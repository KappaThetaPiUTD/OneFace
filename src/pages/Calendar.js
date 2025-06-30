import { useState, useEffect } from "react";
import AttendanceHistory from "../components/AttendanceHistory";

// ...existing imports and code...

export default function Calendar() {
  const currentDate = new Date(2025, 5, 20); // June 20, 2025
  const [selected, setSelected] = useState(currentDate.getDate());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [hoveredClass, setHoveredClass] = useState(null);
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);
  const [selectedClassDetails, setSelectedClassDetails] = useState(null);

  // Fetch data from your backend
  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    const userId = "tester";
    fetch(`http://localhost:4000/calendar-data?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setDbData(data))
      .catch((err) => console.error("Error fetching calendar data:", err));
  }, []);

  // Helper functions for navigation and calendar logic
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

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelected(today.getDate());
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Use dbData for all calendar content
  const classSchedule = dbData?.classSchedule || {};
  const eventsByDate = dbData?.eventsByDate || {};
  const attendanceRates = dbData?.attendanceRates || [];

  const eventsForSelectedDate = eventsByDate[selected] || [];
  const dayHasEvents = (day) => eventsByDate[day] && eventsByDate[day].length > 0;

  return (
    <section className="card">
      <h1>Calendar</h1>

      {/* Calendar Table: Classes and Attendance Rate */}
      <div className="calendar-table">
        <div>
          <h3>Today's Classes</h3>
          {Object.entries(classSchedule).length === 0 && <p>No classes found.</p>}
          {Object.entries(classSchedule).map(([classID, details], index) => (
            <div 
              className="row class-row"
              key={classID}
              onClick={() => {
                setSelectedClassDetails({ id: classID, ...details });
                setShowAttendanceHistory(true);
              }}
              style={{ cursor: "pointer" }}
            >
              <span>
                <strong>{details.className}</strong><br/>
                {details.start} - {details.end}<br/>
                <span className="event-location">{details.location}</span>
              </span>
              <span className="label">
                Classes
              </span>
            </div>
          ))}
        </div>
        <div>
          <h3>Attendance Rate</h3>
          {attendanceRates.length === 0 && <p>No attendance data.</p>}
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
        {Array.from({length: firstDayOfMonth}, (_, i) => (
          <div key={`empty-${i}`} style={{width: 48, height: 48}}></div>
        ))}
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
            const isClassEvent = event.type === "class";
            let attendanceInfo = null;
            if (isClassEvent) {
              const className = event.title.split(" Lecture")[0];
              const classInfo = Object.entries(classSchedule).find(([name]) => name === className);
              if (classInfo) {
                const details = classInfo[1];
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