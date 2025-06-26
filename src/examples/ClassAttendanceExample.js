import React, { useState } from 'react';
import ClassAttendanceList from '../components/ClassAttendanceList';

/**
 * Example usage of the ClassAttendanceList component
 */
const ClassAttendanceExample = () => {
  // Sample class data
  const classes = [
    { name: "CS 3162.002", type: "Classes" },
    { name: "CS 4347.001", type: "Classes" },
    { name: "CS 4365.003", type: "Classes" },
    { name: "MKT 3300.001", type: "Classes" },
    { name: "ACM Projects", type: "Organizations" }
  ];
  
  // Sample attendance data
  const attendance = [
    { code: "CS 3162.002", done: 15, total: 16, percent: "94%", cls: "green" },
    { code: "CS 4347.001", done: 13, total: 16, percent: "81%", cls: "amber" },
    { code: "CS 4365.003", done: 14, total: 16, percent: "88%", cls: "amber" },
    { code: "MKT 3300.001", done: 10, total: 16, percent: "63%", cls: "red" },
    { code: "ACM Projects", done: 14, total: 16, percent: "88%", cls: "amber" },
  ];

  // Track selected class
  const [selectedClass, setSelectedClass] = useState(null);

  // Handler for when a class is clicked
  const handleClassClick = (className) => {
    setSelectedClass(className);
    console.log(`Class clicked: ${className}`);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h1>Class Attendance List Example</h1>
      <p style={{ marginBottom: '20px' }}>
        Hover over any class to see a tooltip with attendance breakdown.
      </p>
      
      <div className="card" style={{ padding: '20px' }}>
        <ClassAttendanceList
          classes={classes}
          attendance={attendance}
          onClassClick={handleClassClick}
        />
      </div>
      
      {selectedClass && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          color: '#333'
        }}>
          <p><strong>Selected class:</strong> {selectedClass}</p>
        </div>
      )}
    </div>
  );
};

export default ClassAttendanceExample;
