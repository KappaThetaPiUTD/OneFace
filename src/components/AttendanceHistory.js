import React, { useState, useEffect } from 'react';
import AttendanceDrillDown from './AttendanceDrillDown';
import '../styles/AttendanceHistory.css';

const AttendanceHistory = ({ userID, classID }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [showDrillDown, setShowDrillDown] = useState(false);

  useEffect(() => {
    // In a real app, this would be an API call to fetch attendance data
    // For now, we'll simulate the data fetching
    const fetchAttendanceData = () => {
      setLoading(true);
      
      try {
        // Simulated API response delay
        setTimeout(() => {
          // Mock class info
          const mockClassInfo = {
            id: classID,
            name: "CS 3162.002",
            professor: "Dr. Elizabeth Chen",
            schedule: "Mon/Wed 9:00 AM – 10:15 AM",
            location: "ECSN 2.110",
            term: "Spring 2025"
          };
          
          // Mock attendance data
          // In a real app, this would come from the Events and AttendanceLog tables
          const mockAttendanceData = [
            { 
              id: 1, 
              sessionName: "Lecture 1: Introduction", 
              date: "2025-01-13", 
              status: "present" 
            },
            { 
              id: 2, 
              sessionName: "Lecture 2: Basic Principles", 
              date: "2025-01-15", 
              status: "present" 
            },
            { 
              id: 3, 
              sessionName: "Lecture 3: Core Concepts", 
              date: "2025-01-20", 
              status: "absent" 
            },
            { 
              id: 4, 
              sessionName: "Lecture 4: Advanced Topics", 
              date: "2025-01-22", 
              status: "tardy",
              minutesLate: 7 
            },
            { 
              id: 5, 
              sessionName: "Lecture 5: Practical Applications", 
              date: "2025-01-27", 
              status: "present" 
            },
            { 
              id: 6, 
              sessionName: "Lecture 6: Case Studies", 
              date: "2025-01-29", 
              status: "present" 
            },
            { 
              id: 7, 
              sessionName: "Review Session", 
              date: "2025-02-03", 
              status: "tardy",
              minutesLate: 12 
            },
            { 
              id: 8, 
              sessionName: "Midterm Exam", 
              date: "2025-02-05", 
              status: "present" 
            },
            { 
              id: 9, 
              sessionName: "Lecture 7: Intermediate Concepts", 
              date: "2025-02-10", 
              status: "absent" 
            },
            { 
              id: 10, 
              sessionName: "Lecture 8: Application Development", 
              date: "2025-02-12", 
              status: "present" 
            },
            { 
              id: 11, 
              sessionName: "Lab Session 1", 
              date: "2025-02-17", 
              status: "present" 
            },
            { 
              id: 12, 
              sessionName: "Lab Session 2", 
              date: "2025-02-19", 
              status: "present" 
            }
          ];

          setClassInfo(mockClassInfo);
          setAttendanceData(mockAttendanceData);
          setLoading(false);
        }, 600);
      } catch (err) {
        setError("Failed to load attendance data. Please try again.");
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [userID, classID]);

  // Function to format dates
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate attendance statistics
  const calculateStats = () => {
    if (!attendanceData.length) return { present: 0, tardy: 0, absent: 0, total: 0, rate: 0 };
    
    const present = attendanceData.filter(item => item.status === 'present').length;
    const tardy = attendanceData.filter(item => item.status === 'tardy').length;
    const absent = attendanceData.filter(item => item.status === 'absent').length;
    const total = attendanceData.length;
    
    // Calculating attendance rate (present counts as 100%, tardy as 50%)
    const rate = Math.round((present + (tardy * 0.5)) / total * 100);
    
    return { present, tardy, absent, total, rate };
  };

  const stats = calculateStats();

  // Get status display text with minutes late for tardy
  const getStatusDisplay = (item) => {
    switch (item.status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'tardy':
        return `Tardy: ${item.minutesLate} min${item.minutesLate !== 1 ? 's' : ''} late`;
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return <div className="attendance-loading">Loading attendance data...</div>;
  }

  if (error) {
    return <div className="attendance-error">{error}</div>;
  }

  return (
    <>
      {showDrillDown ? (
        <AttendanceDrillDown
          classID={classID}
          userID={userID}
          onClose={() => setShowDrillDown(false)}
        />
      ) : (
        <div className="attendance-history-container">
          {classInfo && (
        <div className="attendance-class-header">
          <h2>{classInfo.name}</h2>
          <div className="attendance-class-details">
            <p><strong>Professor:</strong> {classInfo.professor}</p>
            <p><strong>Schedule:</strong> {classInfo.schedule}</p>
            <p><strong>Location:</strong> {classInfo.location}</p>
            <p><strong>Term:</strong> {classInfo.term}</p>
          </div>
        </div>
      )}

      <div className="attendance-stats">
        <div className="attendance-rate">
          <div className={`attendance-rate-circle ${
            stats.rate >= 90 ? 'excellent' : 
            stats.rate >= 80 ? 'good' : 
            stats.rate >= 70 ? 'average' : 'poor'
          }`}>
            <span>{stats.rate}%</span>
          </div>
          <p>Attendance Rate</p>
        </div>
        
        <div className="attendance-summary">
          <div className="stat-box present-stat">
            <span className="stat-count">{stats.present}</span>
            <span className="stat-label">Present</span>
          </div>
          <div className="stat-box tardy-stat">
            <span className="stat-count">{stats.tardy}</span>
            <span className="stat-label">Tardy</span>
          </div>
          <div className="stat-box absent-stat">
            <span className="stat-count">{stats.absent}</span>
            <span className="stat-label">Absent</span>
          </div>
          <div className="stat-box total-stat">
            <span className="stat-count">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      <div className="attendance-table-container">
        <div className="attendance-table-header">
          <h3>Session Attendance</h3>
          <button 
            className="view-detailed-button"
            onClick={() => setShowDrillDown(true)}
          >
            View detailed attendance
          </button>
        </div>
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Session</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.date)}</td>
                <td>{item.sessionName}</td>
                <td className={`status-cell ${item.status}-status`}>
                  {getStatusDisplay(item)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      )}
    </>
  );
};

export default AttendanceHistory;
