import { useEffect, useRef, useState } from 'react';
import StrikeTracker from '../components/StrikeTracker';
import ClassAttendanceList from '../components/ClassAttendanceList';

export default function Dashboard() {
  const [selectedClass, setSelectedClass] = useState('');

  const classAttendanceCardRef = useRef(null);
  const managementCardRef = useRef(null);
  const strikeTrackerCardRef = useRef(null);

  // Animate cards
  useEffect(() => {
    const classAttendanceCard = classAttendanceCardRef.current;
    const managementCard = managementCardRef.current;
    const strikeTrackerCard = strikeTrackerCardRef.current;

    if (classAttendanceCard) classAttendanceCard.classList.add('slide-up', 'delay-1');
    if (managementCard) managementCard.classList.add('slide-up', 'delay-2');
    if (strikeTrackerCard) strikeTrackerCard.classList.add('slide-up', 'delay-3');

    return () => {
      if (classAttendanceCard) classAttendanceCard.classList.remove('slide-up', 'delay-1');
      if (managementCard) managementCard.classList.remove('slide-up', 'delay-2');
      if (strikeTrackerCard) strikeTrackerCard.classList.remove('slide-up', 'delay-3');
    };
  }, []);

  return (
    <section className="dashboard-grid">
      <div ref={classAttendanceCardRef} className="card card-hover theme-transition">
        <ClassAttendanceList onClassClick={(className) => setSelectedClass(className)} />
      </div>

      <div className="right-column">
        <div
          ref={strikeTrackerCardRef}
          className="card card-hover theme-transition"
          style={{ marginBottom: '24px' }}
        >
          <StrikeTracker 
            maxStrikes={3}
            selectedClass={selectedClass}
          />
        </div>

        <div ref={managementCardRef} className="card card-hover theme-transition">
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Class Management</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-hover-effect">Enroll</button>
            <button className="btn btn-hover-effect">Manage Classes</button>
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
      </div>
    </section>
  );
}
