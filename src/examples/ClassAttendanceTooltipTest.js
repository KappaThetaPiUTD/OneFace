import React, { useState } from 'react';
import ClassAttendanceList from '../components/ClassAttendanceList';

/**
 * Test component for ClassAttendanceList tooltip functionality
 */
const ClassAttendanceTooltipTest = () => {
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

  const [selectedClass, setSelectedClass] = useState('');
  
  const handleClassClick = (className) => {
    setSelectedClass(className);
    console.log(`Selected class: ${className}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Attendance Tooltip Test</h1>
      <p>Hover over class names or attendance percentages to see tooltips. Click on classes to select them.</p>
      
      <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
        <ClassAttendanceList 
          classes={classes}
          attendance={attendance}
          onClassClick={handleClassClick}
        />
      </div>

      {selectedClass && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p><strong>Selected class:</strong> {selectedClass}</p>
        </div>
      )}
    </div>
  );
};

export default ClassAttendanceTooltipTest;
