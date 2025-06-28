import React, { useState } from 'react';
import '../styles/ClassAttendanceList.css';

/**
 * ClassAttendanceList Component
 * 
 * Displays a list of classes with attendance percentages and tooltips on hover
 * showing missed classes fraction
 * 
 * @param {Object} props - Component props
 * @param {Array} props.classes - Array of class objects { name, type }
 * @param {Array} props.attendance - Array of attendance objects { code, done, total, percent, cls }
 * @param {Function} props.onClassClick - Optional callback when a class is clicked
 * @returns {JSX.Element} ClassAttendanceList component
 */
const ClassAttendanceList = ({ classes, attendance, onClassClick }) => {
  // State for tracking tooltips
  const [hoveredClass, setHoveredClass] = useState(null);
  
  // Process and merge class & attendance data with enhanced information
  const mergedData = classes.map(classItem => {
    const attendanceData = attendance.find(a => a.code === classItem.name) || 
      { done: 0, total: 0, percent: '0%', cls: '' };
    
    // Calculate missed classes directly
    const missed = attendanceData.total - attendanceData.done;
    
    // Calculate attendance percentage as a number for additional calculations
    const attendanceRate = attendanceData.done / attendanceData.total * 100;
    
    // Get status message and recommendation based on attendance rate
    let statusMessage = '';
    let recommendation = '';
    
    if (attendanceData.cls === 'green') {
      statusMessage = 'Excellent';
      recommendation = 'Keep up the great attendance!';
    } else if (attendanceData.cls === 'amber') {
      statusMessage = 'Good';
      recommendation = 'Try to attend more regularly.';
    } else if (attendanceData.cls === 'red') {
      statusMessage = 'Needs Attention';
      recommendation = 'Contact your instructor about your attendance.';
    }
    
    return {
      id: classItem.name, // Use name as unique ID
      name: classItem.name,
      type: classItem.type,
      attendancePercent: attendanceData.percent,
      attendanceRate: attendanceRate, // Numeric value
      missed: missed,
      total: attendanceData.total,
      colorClass: attendanceData.cls,
      statusMessage: statusMessage,
      recommendation: recommendation,
      // Calculate classes remaining before a grade penalty (if applicable)
      classesRemaining: Math.max(0, attendanceData.total - missed - Math.floor(attendanceData.total * 0.7))
    };
  });

  // Handle mouse events
  const handleMouseEnter = (classId) => {
    setHoveredClass(classId);
  };
  
  const handleMouseLeave = () => {
    setHoveredClass(null);
  };

  return (
    <div className="class-attendance-list">
      <h1>My Classes &amp; Organizations</h1>
      
      <div className="class-list">
        {mergedData.map((item) => (
          <div 
            className="class-row"
            key={item.id}
            onClick={() => onClassClick && onClassClick(item.name)}
            onMouseEnter={() => handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Left side: Class name */}
            <div className="class-name-section">
              <div className="class-name">{item.name}</div>
              <div className="class-type">{item.type}</div>
            </div>
            
            {/* Right side: Attendance percentage */}
            <div className={`attendance-badge ${item.colorClass}`}>
              {item.attendancePercent}
            </div>
            
            {/* Enhanced tooltip with comprehensive attendance information */}
            {hoveredClass === item.id && (
              <div className="tooltip">
                <div className="tooltip-header">
                  {item.name} Attendance
                </div>
                <div>
                  Classes missed: {item.missed} / {item.total}
                </div>
                <div className="tooltip-details">
                  Attendance rate: {item.attendancePercent}
                  {item.classesRemaining > 0 && item.colorClass !== 'green' && (
                    <div style={{marginTop: '5px'}}>
                      Classes remaining before penalty: {item.classesRemaining}
                    </div>
                  )}
                </div>
                <div className={`tooltip-status ${item.colorClass}`}>
                  {item.statusMessage}
                </div>
                {item.recommendation && (
                  <div className="tooltip-details" style={{marginTop: '5px', fontStyle: 'italic'}}>
                    {item.recommendation}
                  </div>
                )}
                <div className="tooltip-arrow"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassAttendanceList;
