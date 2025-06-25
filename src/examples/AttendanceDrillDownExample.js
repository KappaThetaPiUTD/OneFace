import React from 'react';
import AttendanceDrillDown from '../components/AttendanceDrillDown';

/**
 * Example usage of the AttendanceDrillDown component
 */
const AttendanceDrillDownExample = () => {
  // Mock identifiers for demonstration
  const classId = "CS3162-002";
  const userId = "UTD123456789";
  
  // Example close handler
  const handleClose = () => {
    console.log('AttendanceDrillDown closed');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>AttendanceDrillDown Example</h1>
      <p>Below is an example of the AttendanceDrillDown component displaying detailed attendance logs:</p>
      
      <AttendanceDrillDown
        classID={classId}
        userID={userId}
        onClose={handleClose}
      />
    </div>
  );
};

export default AttendanceDrillDownExample;
