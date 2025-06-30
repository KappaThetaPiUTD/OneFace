import express from "express";
import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  ScanCommand
} from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Route: Get user info
app.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  const params = {
    TableName: "users",
    Key: { userID: { S: userId } }
  };

  try {
    const command = new GetItemCommand(params);
    const data = await client.send(command);

    res.json({
      Email: data.Item?.Email?.S || "",
      Name: data.Item?.Name?.S || "",
      Phone: data.Item?.Phone?.S || "",
      PreferredName: data.Item?.PreferredName?.S || ""
    });
  } catch (err) {
    console.error("DynamoDB error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Get all classes
app.get("/api/classes", async (req, res) => {
  try {
    const command = new ScanCommand({ TableName: "classes" });
    const data = await client.send(command);

    const classes = data.Items.map(item => ({
      name: item.className?.S || "Unknown",
      start: item.start?.S || "TBD",
      end: item.end?.S || "TBD",
      location: item.location?.S || "TBD",
      type: item.type?.S || "class"
    }));

    res.json(classes);
  } catch (err) {
    console.error("Error retrieving classes:", err);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// Get user enrolled classes
app.get("/user/:userId/classes", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await client.send(new QueryCommand({
      TableName: "classMembers",
      KeyConditionExpression: "userID = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId }
      }
    }));

    const classIDs = result.Items?.map(item => item.classID.N) || [];

    const classDetails = await Promise.all(classIDs.map(async (id) => {
      const data = await client.send(new GetItemCommand({
        TableName: "classes",
        Key: { classID: { N: id } }
      }));

      return {
        classID: id,
        className: data.Item?.className?.S || "Unknown"
      };
    }));

    res.json(classDetails);
  } catch (err) {
    console.error("Error fetching user classes:", err);
    res.status(500).json({ error: "Could not fetch classes" });
  }
});

// Route: Get attendance history for a user and class
app.get('/attendance-history', async (req, res) => {
  const userId = req.query.userId || "tester";
  const classId = req.query.classId;
  if (!classId) return res.status(400).json({ error: "Missing classId" });

  try {
    const eventScan = await client.send(new ScanCommand({
      TableName: "events",
      FilterExpression: "classID = :cid",
      ExpressionAttributeValues: {
        ":cid": { N: classId }
      }
    }));
    const events = eventScan.Items || [];

    const attendanceHistory = await Promise.all(events.map(async (event) => {
      const eventID = event.eventID.N;
      const eventName = event.eventName?.S || "";
      const date = ""; // skipping real date for now

      let status = "unknown";
      let minutesLate;

      console.log(`Checking attendance for user ${userId}, event ${eventID}`);

      try {
        const logResult = await client.send(new GetItemCommand({
          TableName: "attendanceLog",
          Key: {
            userID: { S: userId },
            eventID: { N: eventID }
          }
        }));

        console.log(`Result from attendanceLog for event ${eventID}:`, logResult.Item);

        const raw = logResult.Item?.status?.S?.trim().toLowerCase();
        if (raw === "present") status = "present";
        else if (raw === "tardy") status = "tardy";
        else if (raw === "absent") status = "absent";

        if (logResult.Item?.minutesLate?.N) {
          minutesLate = Number(logResult.Item.minutesLate.N);
        }

      } catch (err) {
        console.warn(`No attendance log found for user ${userId}, event ${eventID}`);
      }

      return {
        id: Number(eventID),
        sessionName: eventName,
        date,
        status,
        minutesLate
      };
    }));

    attendanceHistory.sort((a, b) => a.id - b.id);
    res.json(attendanceHistory);
  } catch (err) {
    console.error("Error fetching attendance history:", err);
    res.status(500).json({ error: "Failed to fetch attendance history" });
  }
});



// Get class info
app.get('/class-info', async (req, res) => {
  const classId = req.query.classId;
  if (!classId) return res.status(400).json({ error: "Missing classId" });

  try {
    const classData = await client.send(new GetItemCommand({
      TableName: "classes",
      Key: { classID: { N: classId } }
    }));

    if (!classData.Item) return res.status(404).json({ error: "Class not found" });

    const classItem = classData.Item;
    const adminId = classItem.adminId?.S;

    let professorName = "Unknown";
    if (adminId) {
      const userData = await client.send(new GetItemCommand({
        TableName: "users",
        Key: { userID: { S: adminId } }
      }));
      professorName = userData.Item?.Name?.S || "Unknown";
    }

    res.json({
      id: classItem.classID.N,
      name: classItem.className?.S || "",
      location: classItem.location?.S || "",
      start: classItem.start?.S || "",
      end: classItem.end?.S || "",
      schedule: classItem.schedule?.S || "",
      term: classItem.term?.S || "",
      professor: professorName
    });
  } catch (err) {
    console.error("Error fetching class info:", err);
    res.status(500).json({ error: "Failed to fetch class info" });
  }
});


// Route: Get calendar data for the user
app.get('/calendar-data', async (req, res) => {
  const userId = req.query.userId || "tester";

  try {
    // Get class IDs the user is enrolled in
    const memberResult = await client.send(new QueryCommand({
      TableName: "classMembers",
      KeyConditionExpression: "userID = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId }
      }
    }));
    const classIDs = memberResult.Items?.map(item => item.classID.N) || [];

    // Get class details
    const classSchedule = {};
    for (const classID of classIDs) {
      const data = await client.send(new GetItemCommand({
        TableName: "classes",
        Key: { classID: { N: classID } }
      }));
      if (data.Item) {
        classSchedule[classID] = {
          className: data.Item.className?.S || "Unknown",
          start: data.Item.start?.S || "",
          end: data.Item.end?.S || "",
          location: data.Item.location?.S || ""
        };
      }
    }

    // Get all events
    const eventScan = await client.send(new ScanCommand({ TableName: "events" }));
    const events = eventScan.Items.filter(event => classIDs.includes(event.classID.N));

    // Get attendance logs
    const attendanceScan = await client.send(new ScanCommand({ TableName: "attendanceLog" }));
    const attendanceLogs = attendanceScan.Items.filter(log => log.userID.S === userId);

    // Group events by eventID
    const eventsByDate = {};
    for (const event of events) {
      const eventID = event.eventID.N;
      eventsByDate[eventID] = eventsByDate[eventID] || [];
      eventsByDate[eventID].push({
        eventID,
        classID: event.classID.N,
        eventName: event.eventName?.S || ""
      });
    }

    // Attendance rates per class
    const attendanceRates = [];
    for (const classID of classIDs) {
      const classEvents = events.filter(e => e.classID.N === classID);
      const total = classEvents.length;
      let attended = 0, tardy = 0, absent = 0;

      for (const event of classEvents) {
        const log = attendanceLogs.find(l => l.eventID.N === event.eventID.N);
        if (log) {
          const s = log.status.S.toLowerCase();
          if (s === "present") attended++;
          else if (s === "tardy") tardy++;
          else if (s === "absent") absent++;
        }
      }

      attendanceRates.push({
        class: classSchedule[classID]?.className || "Unknown",
        attended,
        tardy,
        absent,
        rate: total === 0 ? 0 : Math.round(((attended + tardy) / total) * 100)
      });
    }

    res.json({ classSchedule, eventsByDate, attendanceRates });
  } catch (err) {
    console.error("Error in /calendar-data:", err);
    res.status(500).json({ error: "Failed to fetch calendar data" });
  }
});

// Route: Get attendance summary for user dashboard
app.get('/user/:userId/attendance', async (req, res) => {
  const { userId } = req.params;

  try {
    // Step 1: Get user's class IDs
    const memberResult = await client.send(new QueryCommand({
      TableName: "classMembers",
      KeyConditionExpression: "userID = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId }
      }
    }));

    const classIDs = memberResult.Items?.map(item => item.classID.N) || [];

    // Step 2: For each class, get attendance stats and class name
    const summaries = await Promise.all(classIDs.map(async (classID) => {
      // Get class name
      const classData = await client.send(new GetItemCommand({
        TableName: "classes",
        Key: { classID: { N: classID } }
      }));
      const className = classData.Item?.className?.S || "Unknown";

      // Get all events for this class
      const eventScan = await client.send(new ScanCommand({
        TableName: "events",
        FilterExpression: "classID = :cid",
        ExpressionAttributeValues: {
          ":cid": { N: classID }
        }
      }));
      const events = eventScan.Items || [];

      // Get all attendance logs for this user in these events
      const logs = await Promise.all(events.map(async (event) => {
        const eventID = event.eventID.N;
        try {
          const log = await client.send(new GetItemCommand({
            TableName: "attendanceLog",
            Key: {
              userID: { S: userId },
              eventID: { N: eventID }
            }
          }));
          return log.Item || null;
        } catch {
          return null;
        }
      }));

      const filtered = logs.filter(Boolean);
      const attended = filtered.filter(log =>
        log.status?.S?.toLowerCase() === "present" || log.status?.S?.toLowerCase() === "tardy"
      ).length;

      const total = events.length;
      const percent = total > 0 ? Math.round((attended / total) * 100) : 0;

      return {
        className,
        attended,
        total,
        percent,
        cls: className
      };
    }));

    res.json(summaries);
  } catch (err) {
    console.error("Error in /user/:userId/attendance:", err);
    res.status(500).json({ error: "Failed to fetch attendance data" });
  }
});







app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

