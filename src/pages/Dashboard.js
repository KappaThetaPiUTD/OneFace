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
        </div>
      </div>
    </section>
  );
}
