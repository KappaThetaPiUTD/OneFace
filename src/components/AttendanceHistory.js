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
    setLoading(true);
    setError(null);

    // Fetch attendance data and class info from backend
    Promise.all([
      fetch(`http://localhost:4000/attendance-history?userId=tester&classId=${classID}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch attendance data");
          return res.json();
        }),
      fetch(`http://localhost:4000/class-info?classId=${classID}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch class info");
          return res.json();
        })
    ])
      .then(([attendance, classInfo]) => {
        setAttendanceData(attendance);
        setClassInfo(classInfo);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load attendance data. Please try again.");
        setLoading(false);
      });
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
    
    const rate = Math.round((present + tardy) / total * 100);

    
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
  console.log("attendanceData", attendanceData);

  if (loading) {
    return <div className="attendance-loading">Loading attendance data...</div>;
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
