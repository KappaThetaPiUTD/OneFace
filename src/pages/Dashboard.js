
import { useEffect, useRef, useState } from 'react';
import StrikeTracker from '../components/StrikeTracker';
import ClassAttendanceList from '../components/ClassAttendanceList';

export default function Dashboard() {
  // State for selected class (strike count will be managed by admin in the future)
  const [selectedClass, setSelectedClass] = useState('CS 3162.002');

  const classes = [
    { name: "CS 3162.002", type: "Classes" },
    { name: "CS 4347.001", type: "Classes" },
    { name: "CS 4365.003", type: "Classes" },
    { name: "MKT 3300.001", type: "Classes" },
    { name: "ACM Projects", type: "Organizations" }
  ];
  
  const attendance = [
    { code: "CS 3162.002", done: 15, total: 16, percent: "94%", cls: "green" },
    { code: "CS 4347.001", done: 13, total: 16, percent: "81%", cls: "amber" },
    { code: "CS 4365.003", done: 14, total: 16, percent: "88%", cls: "amber" },
    { code: "MKT 3300.001", done: 10, total: 16, percent: "63%", cls: "red" },
    { code: "ACM Projects", done: 14, total: 16, percent: "88%", cls: "amber" },
  ];
  
  // Refs for the sections that will be animated
  const classAttendanceCardRef = useRef(null);
  const managementCardRef = useRef(null);
  const strikeTrackerCardRef = useRef(null);
  
  useEffect(() => {
    // Animation for the cards to fade in
    const classAttendanceCard = classAttendanceCardRef.current;
    const managementCard = managementCardRef.current;
    const strikeTrackerCard = strikeTrackerCardRef.current;
    
    if (classAttendanceCard) classAttendanceCard.classList.add('slide-up', 'delay-1');
    if (managementCard) managementCard.classList.add('slide-up', 'delay-2');
    if (strikeTrackerCard) strikeTrackerCard.classList.add('slide-up', 'delay-3');
    
    // Clean up animations on unmount if needed
    return () => {
      if (classAttendanceCard) classAttendanceCard.classList.remove('slide-up', 'delay-1');
      if (managementCard) managementCard.classList.remove('slide-up', 'delay-2');
      if (strikeTrackerCard) strikeTrackerCard.classList.remove('slide-up', 'delay-3');
    };
  }, []);

  return(
    <>
      <section className="dashboard-grid">
        {/* Left Column: Class Attendance */}
        <div ref={classAttendanceCardRef} className="card card-hover theme-transition">
          <ClassAttendanceList 
            classes={classes}
            attendance={attendance}
            onClassClick={(className) => setSelectedClass(className)}
          />
        </div>
        
        {/* Right Column: Strike Tracker and Management */}
        <div className="right-column">
          {/* Strike Tracker */}
          <div ref={strikeTrackerCardRef} className="card card-hover theme-transition" style={{marginBottom: '24px'}}>
            <StrikeTracker 
              maxStrikes={3} 
              classes={classes}
              onClassChange={(classname) => setSelectedClass(classname)}
            />
          </div>
          
          {/* Class Management - Now underneath the Strike Tracker */}
          <div ref={managementCardRef} className="card card-hover theme-transition">
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Class Management</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-hover-effect">Enroll</button>
              <button className="btn btn-hover-effect">Manage Classes</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

