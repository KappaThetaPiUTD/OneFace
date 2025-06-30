import { useState, useEffect } from "react";
import { getCurrentUser } from 'aws-amplify/auth';
import OrganizationAttendanceDetail from "../components/OrganizationAttendanceDetail";

export default function Calendar() {
  const currentDate = new Date(2025, 5, 20); // June 20, 2025
  const [selected, setSelected] = useState(currentDate.getDate());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [hoveredClass, setHoveredClass] = useState(null);
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);
  const [selectedClassDetails, setSelectedClassDetails] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // API base URL
  const API_BASE_URL = 'https://9g63csumjh.execute-api.us-east-2.amazonaws.com/dev';

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        console.log('Current user:', user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Fetch organizations dynamically
  useEffect(() => {
    const fetchOrganizations = async () => {
      setOrganizationsLoading(true);
      try {
        const userID = currentUser?.userId || '';
        const url = `${API_BASE_URL}/organizations${userID ? `?userID=${userID}` : ''}`;
        
        console.log('🔄 Fetching organizations from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Organizations fetched:', data);
          setOrganizations(data.organizations || []);
        } else {
          console.error('❌ Failed to fetch organizations:', response.status);
          // Fallback to default organization
          setOrganizations([{
            id: 'kappa-theta-pi',
            name: 'Kappa Theta Pi Frat',
            type: 'organization',
            eventID: 1,
            totalMembers: 0,
            presentMembers: 0,
            attendanceRate: 0,
            meetingTime: '7:00 PM - 9:00 PM',
            location: 'Greek Life Center',
            nextMeeting: 'Every Thursday',
            userStatus: 'absent'
          }]);
        }
      } catch (error) {
        console.error('💥 Error fetching organizations:', error);
        // Fallback to default organization
        setOrganizations([{
          id: 'kappa-theta-pi',
          name: 'Kappa Theta Pi Frat',
          type: 'organization',
          eventID: 1,
          totalMembers: 0,
          presentMembers: 0,
          attendanceRate: 0,
          meetingTime: '7:00 PM - 9:00 PM',
          location: 'Greek Life Center',
          nextMeeting: 'Every Thursday',
          userStatus: 'absent'
        }]);
      } finally {
        setOrganizationsLoading(false);
      }
    };

    if (currentUser) {
      fetchOrganizations();
    }
  }, [currentUser]);

  // Generate dynamic class schedule from organizations
  const classSchedule = organizations.reduce((acc, org) => {
    acc[org.name] = {
      time: org.meetingTime || "7:00 PM - 9:00 PM",
      location: org.location || "Greek Life Center",
      days: [4], // Thursday meetings
      attendanceStatus: org.userStatus || "absent",
      lastAttended: "2025-06-19",
      minutesLate: 0,
      type: "organization"
    };
    return acc;
  }, {});

  // Generate dynamic events by date for organizations
  const eventsByDate = {};
  
  // Add organization meetings to specific dates (Thursdays in June 2025)
  const thursdays = [5, 12, 19, 26]; // Thursday dates in June 2025
  
  thursdays.forEach(date => {
    eventsByDate[date] = organizations.map(org => ({
      time: org.meetingTime || "7:00 PM - 9:00 PM",
      title: `${org.name} Meeting`,
      location: org.location || "Greek Life Center",
      type: "organization",
      organizationData: org
    }));
  });

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

  // Fetch detailed attendance for an organization
  const fetchAttendanceDetails = async (eventID, organizationName) => {
    try {
      console.log('🔄 Fetching attendance details for eventID:', eventID);
      
      const url = `${API_BASE_URL}/attendance/details?eventID=${eventID}`;
      console.log('📍 Full URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Attendance details fetched:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch attendance details:', response.status, errorText);
        
        // Show more specific error message
        if (response.status === 403) {
          console.error('🚫 403 Forbidden - Check API Gateway permissions and CORS');
        } else if (response.status === 404) {
          console.error('🔍 404 Not Found - Check if /attendance/details route exists');
        }
        
        // Return fallback data structure
        return {
          eventID: eventID,
          organizationName: organizationName,
          creator: 'admin',
          schedule: '',
          location: '',
          term: '',
          attendanceRate: 0,
          totalMembers: 0,
          presentCount: 0,
          tardyCount: 0,
          absentCount: 0,
          sessionAttendance: [],
          lastUpdated: '',
          error: `API Error: ${response.status} - ${errorText}`
        };
      }
    } catch (error) {
      console.error('💥 Error fetching attendance details:', error);
      
      // More specific error handling
      if (error.message.includes('Failed to fetch')) {
        console.error('🌐 Network/CORS error - check API Gateway CORS configuration');
      }
      
      // Return fallback data structure
      return {
        eventID: eventID,
        organizationName: organizationName,
        creator: 'admin',
        schedule: '',
        location: '',
        term: '',
        attendanceRate: 0,
        totalMembers: 0,
        presentCount: 0,
        tardyCount: 0,
        absentCount: 0,
        sessionAttendance: [],
        lastUpdated: '',
        error: `Network Error: ${error.message}`
      };
    }
  };

  return (
    <section className="card">
      <h1>Calendar</h1>

      <div className="calendar-table">
        <div>
          <h3>Today's Organizations</h3>
          {organizationsLoading ? (
            <div className="row">
              <span>Loading organizations...</span>
              <span className="label">Loading</span>
            </div>
          ) : (
            Object.entries(classSchedule).map(([name, details], index) => {
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
                  break;
                case 'tardy':
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
                  onClick={async () => {
                    // Find the organization data for this name
                    const orgData = organizations.find(org => org.name === name);
                    if (orgData) {
                      console.log('🔄 Fetching attendance details for organization:', name);
                      const attendanceDetails = await fetchAttendanceDetails(orgData.eventID, name);
                      setSelectedClassDetails({
                        id: name.replace(/\./g, '-').replace(/\s+/g, '-').toLowerCase(),
                        name: name,
                        attendanceDetails: attendanceDetails
                      });
                      setShowAttendanceHistory(true);
                    }
                  }}
                >
                  <span>
                    {name}<br/>
                    <span className="event-time">{details.time}</span><br/>
                    <span className="event-location">{details.location}</span>
                  </span>
                  <span className="label">
                    Organizations
                    {hoveredClass === name && (
                      <span className={`attendance-status ${statusClass}`}>
                        {` (${statusText})`}
                      </span>
                    )}
                  </span>
                </div>
              );
            })
          )}
        </div>
        <div>
          <h3>Attendance Rate</h3>
          {organizationsLoading ? (
            <div className="row">
              <span>Loading...</span>
              <span>...</span>
            </div>
          ) : (
            organizations.map((org, index) => (
              <div className="row" key={index}>
                <span>{org.name}</span>
                <span className={(org.attendanceRate || 0) >= 90 ? "green" : (org.attendanceRate || 0) >= 70 ? "amber" : "red"}>
                  {org.attendanceRate || 0}% ({org.presentMembers || 0} present, {org.absentMembers || 0} absent)
                </span>
              </div>
            ))
          )}
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
            <OrganizationAttendanceDetail 
              attendanceDetails={selectedClassDetails.attendanceDetails}
            />
          </div>
        </div>
      )}
    </section>
  );
}
