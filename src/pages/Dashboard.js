import { useEffect, useRef, useState } from 'react';
import StrikeTracker from '../components/StrikeTracker';

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
  const classesCardRef = useRef(null);
  const attendanceCardRef = useRef(null);
  const managementCardRef = useRef(null);
  const strikeTrackerCardRef = useRef(null);
  
  useEffect(() => {
    // Animation for the cards to fade in
    const classesCard = classesCardRef.current;
    const attendanceCard = attendanceCardRef.current;
    const managementCard = managementCardRef.current;
    const strikeTrackerCard = strikeTrackerCardRef.current;
    
    if (classesCard) classesCard.classList.add('slide-up', 'delay-1');
    if (attendanceCard) attendanceCard.classList.add('slide-up', 'delay-2');
    if (managementCard) managementCard.classList.add('slide-up', 'delay-3');
    if (strikeTrackerCard) strikeTrackerCard.classList.add('slide-up', 'delay-4');
    
    // Staggered animation for list items
    const listItems = document.querySelectorAll('.staggered-item');
    listItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('animate-staggered');
      }, 100 + (index * 70)); // Stagger each item by 70ms
    });
    
    // Clean up animations on unmount if needed
    return () => {
      if (classesCard) classesCard.classList.remove('slide-up', 'delay-1');
      if (attendanceCard) attendanceCard.classList.remove('slide-up', 'delay-2');
      if (managementCard) managementCard.classList.remove('slide-up', 'delay-3');
      if (strikeTrackerCard) strikeTrackerCard.classList.remove('slide-up', 'delay-4');
      
      listItems.forEach(item => {
        item.classList.remove('animate-staggered');
      });
    };
  }, []);

  return(
    <>
      <section className="dashboard-grid">
        <div ref={classesCardRef} className="card card-hover theme-transition">
          <h1>My Classes &amp; Organizations</h1>
          {classes.map((c, index) => (
            <div className="row staggered-item" key={c.name}>
              <span>{c.name}</span>
              <span className="label">{c.type}</span>
            </div>
          ))}
        </div>

        <div ref={attendanceCardRef} className="card card-hover theme-transition">
          <h1>Attendance Analysis</h1>
          {attendance.map(({code, done, total, percent, cls}, index) => (
            <div className="row staggered-item" key={code}>
              <span>{code}</span>
              <span className={cls}>{done}/{total} {percent}</span>
            </div>
          ))}
        </div>
        
        <div ref={strikeTrackerCardRef} className="card span-2 card-hover theme-transition">
          {/* Enhanced StrikeTracker with class pill selection */}
          <StrikeTracker 
            maxStrikes={3} 
            classes={classes}
            onClassChange={(classname) => setSelectedClass(classname)}
          />
        </div>

        <div ref={managementCardRef} className="card span-2 card-hover theme-transition">
          <h1>Class Management</h1>
          <div>
            <button className="btn btn-hover-effect">Enroll</button>
            <button className="btn btn-hover-effect">Manage Classes</button>
          </div>
        </div>
      </section>
    </>
  );
}
