
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
          
          {/* Today's Schedule - Quick view of upcoming classes */}
          <div className="card card-hover theme-transition" style={{marginTop: '24px'}}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Today's Schedule
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ 
                padding: '12px', 
                background: 'rgba(107, 165, 183, 0.1)', 
                borderRadius: '8px',
                borderLeft: '4px solid var(--wave)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>CS 3162.002</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>9:00 AM - 10:15 AM</div>
                </div>
                <span style={{ 
                  padding: '4px 8px', 
                  background: '#22c55e', 
                  color: 'white', 
                  borderRadius: '12px', 
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  Next
                </span>
              </div>
              <div style={{ 
                padding: '12px', 
                background: 'rgba(156, 163, 175, 0.1)', 
                borderRadius: '8px',
                borderLeft: '4px solid #9ca3af',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>CS 4347.001</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>11:30 AM - 12:45 PM</div>
                </div>
                <span style={{ 
                  padding: '4px 8px', 
                  background: '#9ca3af', 
                  color: 'white', 
                  borderRadius: '12px', 
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  Later
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

