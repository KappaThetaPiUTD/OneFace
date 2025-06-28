import { useState } from "react";
import AttendanceHistory from "../components/AttendanceHistory";

export default function Calendar() {
  const currentDate = new Date(2025, 5, 20); // June 20, 2025
  const [selected, setSelected] = useState(currentDate.getDate());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [hoveredClass, setHoveredClass] = useState(null);
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);
  const [selectedClassDetails, setSelectedClassDetails] = useState(null);
  
  // Sample class schedule data with attendance tracking
  const classSchedule = {
    "CS 3162.002": { 
      time: "9:00 AM – 10:15 AM", 
      location: "ECSN 2.110", 
      days: [1, 3], 
      attendanceStatus: "present", 
      lastAttended: "2025-06-19",
      minutesLate: 0
    },
    "CS 4347.001": { 
      time: "11:30 AM – 12:45 PM", 
      location: "ECSS 2.306", 
      days: [1, 3], 
      attendanceStatus: "absent",
      lastAttended: "2025-06-17",
      minutesLate: 0
    },
    "CS 4365.003": { 
      time: "2:00 PM – 3:15 PM", 
      location: "SLC 1.204", 
      days: [2, 4], 
      attendanceStatus: "tardy",
      lastAttended: "2025-06-18",
      minutesLate: 7
    },
    "MKT 3300.001": { 
      time: "4:00 PM – 5:15 PM", 
      location: "JSOM 1.118", 
      days: [2, 4], 
      attendanceStatus: "present",
      lastAttended: "2025-06-18",
      minutesLate: 0
    },
    "ACM Projects": { 
      time: "6:00 PM – 7:30 PM", 
      location: "ECSS 4.619", 
      days: [5], 
      attendanceStatus: "tardy",
      lastAttended: "2025-06-14",
      minutesLate: 12
    },
  };

  // More evenly distributed events across the month
  const eventsByDate = {
    3: [
      { time: "10:30 AM – 11:45 AM", title: "Career Planning Workshop", location: "Career Center", type: "workshop" }
    ],
    5: [
      { time: "9:00 AM – 10:15 AM", title: "CS 3162.002 Lecture", location: "ECSN 2.110", type: "class" }
    ],
    7: [
      { time: "3:30 PM – 5:00 PM", title: "Student Council Meeting", location: "Student Union 2.204", type: "meeting" }
    ],
    9: [
      { time: "11:30 AM – 12:45 PM", title: "CS 4347.001 Lecture", location: "ECSS 2.306", type: "class" }
    ],
    10: [
      { time: "5:00 PM – 6:30 PM", title: "Coding Competition Prep", location: "ECSS 4.619", type: "club" }
    ],
    12: [
      { time: "2:00 PM – 3:15 PM", title: "CS 4365.003 Lecture", location: "SLC 1.204", type: "class" }
    ],
    15: [
      { time: "9:00 AM – 10:15 AM", title: "CS 3162.002 Lecture", location: "ECSN 2.110", type: "class" }
    ],
    17: [
      { time: "2:00 PM – 3:15 PM", title: "CS 4365.003 Lecture", location: "SLC 1.204", type: "class" },
      { time: "5:00 PM – 6:00 PM", title: "Academic Advising", location: "ECSS 2.300", type: "appointment" }
    ],
    20: [
      { time: "10:00 AM – 11:30 AM", title: "Database Project Meeting", location: "Virtual - Zoom", type: "meeting" }
    ],
    22: [
      { time: "9:00 AM – 10:15 AM", title: "CS 3162.002 Lecture", location: "ECSN 2.110", type: "class" }
    ],
    24: [
      { time: "2:00 PM – 3:15 PM", title: "CS 4365.003 Lecture", location: "SLC 1.204", type: "class" }
    ],
    26: [
      { time: "1:00 PM – 3:00 PM", title: "Research Symposium", location: "JSOM Davidson Auditorium", type: "event" }
    ],
    28: [
      { time: "6:00 PM – 8:00 PM", title: "Hackathon Kickoff", location: "ECSS 2.415", type: "event" }
    ],
  };

  // Functions for month and year navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelected(1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelected(1);
  };

  const prevYear = () => {
    setCurrentYear(currentYear - 1);
    setSelected(1);
  };

  const nextYear = () => {
    setCurrentYear(currentYear + 1);
    setSelected(1);
  };
  
  // Function to navigate to today's date
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelected(today.getDate());
  };

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Get the month name
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
  
  // Day names for header
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Get events for selected date
  const eventsForSelectedDate = eventsByDate[selected] || [];
  
  // Check if a day has events
  const dayHasEvents = (day) => {
    return eventsByDate[day] && eventsByDate[day].length > 0;
  };
  
  // Check if a day is today
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };
  
  // Attendance rates for sample classes
  const attendanceRates = [
    { class: "CS 3162.002", rate: 94, attended: 15, tardy: 1, absent: 0, total: 16 },
    { class: "CS 4347.001", rate: 81, attended: 13, tardy: 0, absent: 3, total: 16 },
    { class: "CS 4365.003", rate: 88, attended: 12, tardy: 2, absent: 2, total: 16 },
  ];

  return (
    <section className="card">
      <h1>Calendar</h1>

      <div className="calendar-table">
        <div>
          <h3>Today's Classes</h3>
          {Object.entries(classSchedule).map(([name, details], index) => {
            // Get the correct CSS class and text based on attendance status
            let statusClass = '';
            let statusText = '';
            
            switch(details.attendanceStatus) {
              case 'present':
                statusClass = 'green';
                statusText = 'Present';
                break;
              case 'absent':
                statusClass = 'red';
                statusText = 'Absent';
                break;                  case 'tardy':
                    statusClass = 'amber';
                    statusText = `Tardy: ${details.minutesLate} min${details.minutesLate !== 1 ? 's' : ''} late`;
                    break;
              default:
                statusClass = '';
                statusText = 'Unknown';
            }
            
            return (
              <div 
                className={`row class-row ${hoveredClass === name ? `${details.attendanceStatus}-class` : ''}`}
                key={name}
                onMouseEnter={() => setHoveredClass(name)}
                onMouseLeave={() => setHoveredClass(null)}
                onClick={() => {
                  setSelectedClassDetails({
                    id: name.replace(/\./g, '-'),
                    name: name
                  });
                  setShowAttendanceHistory(true);
                }}
              >
                <span>
                  {name}<br/>
                  <span className="event-time">{details.time}</span><br/>
                  <span className="event-location">{details.location}</span>
                </span>
                <span className="label">
                  Classes
                  {hoveredClass === name && (
                    <span className={`attendance-status ${statusClass}`}>
                      {` (${statusText})`}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <div>
          <h3>Attendance Rate</h3>
          {attendanceRates.map((item, index) => (
            <div className="row" key={index}>
              <span>{item.class}</span>
              <span className={item.rate >= 90 ? "green" : item.rate >= 80 ? "amber" : "red"}>
                {item.rate}% ({item.attended} present, {item.tardy} tardy, {item.absent} absent)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Month and Year Navigation */}
      <div className="calendar-header">
        <div className="calendar-title">Schedule</div>
        <div className="calendar-nav">
          <div className="date-selectors">
            <div className="month-selector">
              <button className="calendar-nav-btn" onClick={prevMonth}>
                &lt;
              </button>
              <div className="month-display">
                {monthNames[currentMonth]}
              </div>
              <button className="calendar-nav-btn" onClick={nextMonth}>
                &gt;
              </button>
            </div>
            
            <div className="year-selector">
              <button className="calendar-nav-btn" onClick={prevYear}>
                &lt;
              </button>
              <div className="year-display">
                {currentYear}
              </div>
              <button className="calendar-nav-btn" onClick={nextYear}>
                &gt;
              </button>
            </div>
          </div>
          <button className="today-btn" onClick={goToToday}>
            Today
          </button>
        </div>
      </div>

      {/* Day of Week Headers */}
      <div className="day-grid">
        {dayNames.map((day, index) => (
          <div className="day-of-week" key={index}>
            {day}
          </div>
        ))}
        
        {/* Empty spaces for days before the first of the month */}
        {Array.from({length: firstDayOfMonth}, (_, i) => (
          <div key={`empty-${i}`} style={{width: 48, height: 48}}></div>
        ))}
        
        {/* Calendar Days */}
        {Array.from({length: daysInMonth}, (_, i) => i + 1).map(day => (
          <div
            key={day}
            className={`day ${day === selected ? "active" : ""}`}
            onClick={() => setSelected(day)}
          >
            {day}
            {dayHasEvents(day) && <div className="event-dot"></div>}
          </div>
        ))}
      </div>

      <div className="events-container">
        <h3>Events for {`${monthNames[currentMonth]} ${selected}, ${currentYear}`}</h3>
        
        {eventsForSelectedDate.length > 0 ? (
          eventsForSelectedDate.map((event, index) => {
            // Check if this event is a class and if we have attendance data
            const isClassEvent = event.type === "class";
            let attendanceInfo = null;
            
            if (isClassEvent) {
              // Extract class name from title (e.g., "CS 3162.002 Lecture" -> "CS 3162.002")
              const className = event.title.split(" Lecture")[0];
              // Look up class in our schedule
              const classInfo = Object.entries(classSchedule).find(([name]) => name === className);
              if (classInfo) {
                const details = classInfo[1];
                
                // Determine status text and class based on attendance status
                let statusClass = '';
                let statusText = '';
                
                switch(details.attendanceStatus) {
                  case 'present':
                    statusClass = 'green';
                    statusText = 'Present';
                    break;
                  case 'absent':
                    statusClass = 'red';
                    statusText = 'Absent';
                    break;
                  case 'tardy':
                    statusClass = 'amber';
                    statusText = `Tardy: ${details.minutesLate} min${details.minutesLate !== 1 ? 's' : ''} late`;
                    break;
                  default:
                    statusClass = '';
                    statusText = 'Unknown';
                }
                
                attendanceInfo = {
                  status: details.attendanceStatus,
                  statusClass: statusClass,
                  statusText: statusText
                };
              }
            }
            
            return (
              <div 
                className={`event-item ${isClassEvent ? `class-event ${attendanceInfo ? attendanceInfo.status + '-event' : ''}` : ''}`} 
                key={index}
              >
                <div className="event-time">{event.time}</div>
                <div className="event-title">
                  {event.title}
                  {isClassEvent && attendanceInfo && (
                    <span className={`attendance-status ${attendanceInfo.statusClass}`}>
                      {` (${attendanceInfo.statusText})`}
                    </span>
                  )}
                </div>
                <div className="event-location">{event.location}</div>
              </div>
            );
          })
        ) : (
          <p>No events scheduled for this day.</p>
        )}
      </div>

      {/* Attendance History Modal */}
      {showAttendanceHistory && selectedClassDetails && (
        <div className="attendance-modal-overlay" onClick={() => setShowAttendanceHistory(false)}>
          <div className="attendance-modal" onClick={e => e.stopPropagation()}>
            <button 
              className="close-modal-btn" 
              onClick={() => setShowAttendanceHistory(false)}
            >
              &times;
            </button>
            <AttendanceHistory 
              userID="current-user" 
              classID={selectedClassDetails.id} 
            />
          </div>
        </div>
      )}
    </section>
  );
}
