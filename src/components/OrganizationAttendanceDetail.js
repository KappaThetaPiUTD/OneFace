import React from 'react';
import '../styles/OrganizationAttendanceDetail.css';

const OrganizationAttendanceDetail = ({ attendanceDetails }) => {
  if (!attendanceDetails) {
    return <div>Loading attendance details...</div>;
  }

  const {
    eventID,
    organizationName,
    creator,
    schedule,
    location,
    term,
    attendanceRate,
    totalMembers,
    presentCount,
    tardyCount,
    absentCount,
    sessionAttendance
  } = attendanceDetails;

  return (
    <div className="organization-attendance-detail">
      {/* Header with organization name and close button handled by parent */}
      <div className="attendance-header">
        <h2>{organizationName}</h2>
        <div className="attendance-info">
          <div className="info-item">
            <span className="label">Creator:</span>
            <span className="value">{creator}</span>
          </div>
          <div className="info-item">
            <span className="label">Event ID:</span>
            <span className="value">{eventID}</span>
          </div>
          <div className="info-item">
            <span className="label">Schedule:</span>
            <span className="value">{schedule || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="label">Location:</span>
            <span className="value">{location || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="label">Term:</span>
            <span className="value">{term || 'Not specified'}</span>
          </div>
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="attendance-stats">
        <div className="attendance-rate-circle">
          <div className="circle">
            <span className="percentage">{attendanceRate}%</span>
          </div>
          <div className="rate-label">Attendance Rate</div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-item present">
            <div className="stat-number">{presentCount}</div>
            <div className="stat-label">Present</div>
          </div>
          <div className="stat-item tardy">
            <div className="stat-number">{tardyCount}</div>
            <div className="stat-label">Tardy</div>
          </div>
          <div className="stat-item absent">
            <div className="stat-number">{absentCount}</div>
            <div className="stat-label">Absent</div>
          </div>
          <div className="stat-item total">
            <div className="stat-number">{totalMembers}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>

      {/* Session Attendance Table */}
      <div className="session-attendance">
        <div className="section-header">
          <h3>Member Attendance</h3>
          <button className="view-detailed-btn">
            View detailed attendance
          </button>
        </div>
        
        <div className="attendance-table">
          <div className="table-header">
            <div className="header-cell">Member Name</div>
            <div className="header-cell">Session</div>
            <div className="header-cell">Status</div>
          </div>
          
          <div className="table-body">
            {sessionAttendance.length > 0 ? (
              sessionAttendance.map((record, index) => {
                let statusClass = '';
                switch(record.status.toLowerCase()) {
                  case 'present':
                    statusClass = 'status-present';
                    break;
                  case 'tardy':
                    statusClass = 'status-tardy';
                    break;
                  case 'absent':
                    statusClass = 'status-absent';
                    break;
                  default:
                    statusClass = 'status-unknown';
                }

                return (
                  <div key={index} className="table-row">
                    <div className="table-cell member-name">
                      {record.userName || 'Unknown Member'}
                    </div>
                    <div className="table-cell session-info">
                      {record.session}
                    </div>
                    <div className={`table-cell status-cell ${statusClass}`}>
                      {record.status}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-data">
                <p>No attendance records found for this organization.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationAttendanceDetail;