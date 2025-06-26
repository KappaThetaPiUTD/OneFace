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
  
  // Process and merge class & attendance data
  const mergedData = classes.map(classItem => {
    const attendanceData = attendance.find(a => a.code === classItem.name) || 
      { done: 0, total: 0, percent: '0%', cls: '' };
    
    // Calculate missed classes directly
    const missed = attendanceData.total - attendanceData.done;
    
    return {
      id: classItem.name, // Use name as unique ID
      name: classItem.name,
      type: classItem.type,
      attendancePercent: attendanceData.percent,
      missed: missed,
      total: attendanceData.total,
      colorClass: attendanceData.cls
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
            
            {/* Tooltip - shown when hovering over the entire row - exact format from screenshot */}
            {hoveredClass === item.id && (
              <div className="tooltip">
                Classes missed: {item.missed} / {item.total}
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
