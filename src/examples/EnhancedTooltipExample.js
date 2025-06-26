import React from 'react';
import ClassAttendanceList from '../components/ClassAttendanceList';

/**
 * Example showcasing enhanced tooltip design
 */
const EnhancedTooltipExample = () => {
  // Example class data
  const classes = [
    { name: "CS 3162.002", type: "Classes" },
    { name: "CS 4347.001", type: "Classes" },
    { name: "CS 4365.003", type: "Classes" },
    { name: "MKT 3300.001", type: "Classes" },
    { name: "ACM Projects", type: "Organizations" }
  ];
  
  // Example attendance data with different statuses
  const attendance = [
    { code: "CS 3162.002", done: 15, total: 16, percent: "94%", cls: "green" },
    { code: "CS 4347.001", done: 13, total: 16, percent: "81%", cls: "amber" },
    { code: "CS 4365.003", done: 14, total: 16, percent: "88%", cls: "amber" },
    { code: "MKT 3300.001", done: 10, total: 16, percent: "63%", cls: "red" },
    { code: "ACM Projects", done: 14, total: 16, percent: "88%", cls: "amber" },
  ];
  
  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h1>Enhanced Attendance Tooltip Demo</h1>
      <p>
        Hover over any class row to see the enhanced tooltip with detailed attendance information.
        Each tooltip now provides a comprehensive attendance summary with status indicators and 
        recommendations.
      </p>
      
      <div className="card" style={{ 
        padding: '20px', 
        marginTop: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <ClassAttendanceList 
          classes={classes}
          attendance={attendance}
          onClassClick={(className) => console.log(`Selected: ${className}`)}
        />
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>About This Component</h3>
        <p>
          The ClassAttendanceList component now features enhanced tooltips that provide:
        </p>
        <ul>
          <li>Class attendance summary</li>
          <li>Missed classes (fraction)</li>
          <li>Status indicator (Excellent, Good, or Needs Attention)</li>
          <li>Personalized recommendations based on attendance</li>
          <li>Classes remaining before grade penalties</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedTooltipExample;
