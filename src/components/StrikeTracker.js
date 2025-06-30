import React, { useState, useEffect, useRef } from 'react';
import '../styles/StrikeTracker.css';

const StrikeTracker = ({ maxStrikes = 3, onClassChange }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const progressBarRef = useRef(null);
  const userId = 'tester';

  // Fetch class and attendance data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, attendanceRes] = await Promise.all([
          fetch(`http://localhost:4000/user/${userId}/classes`),
          fetch(`http://localhost:4000/user/${userId}/attendance`)
        ]);

        const classesData = await classRes.json();
        const attendanceData = await attendanceRes.json();

        setClasses(classesData.map(c => ({
          name: c.className,
          type: 'Classes'
        })));

        setAttendance(attendanceData.map(item => ({
          code: item.className,
          done: item.attended,
          total: item.total,
          percent: item.percent,
          cls: item.cls
        })));

        if (classesData.length > 0) {
          setSelectedClass(classesData[0].className);
          if (onClassChange) onClassChange(classesData[0].className);
        }
      } catch (error) {
        console.error('Error loading strike tracker data:', error);
      }
    };

    fetchData();
  }, [onClassChange]);

  const getStrikes = () => {
    const record = attendance.find(a => a.code === selectedClass);
    if (!record) return null;
    return record.total - record.done;
  };

  const strikes = getStrikes();
  const progressPercentage = strikes !== null ? (strikes / maxStrikes) * 100 : 0;

  let progressBarClass = 'strike-progress-bar';
  if (strikes === 0) progressBarClass += ' strike-progress-green';
  else if (strikes < maxStrikes) progressBarClass += ' strike-progress-amber';
  else progressBarClass += ' strike-progress-red';

  const isOneStrikeAway = strikes === maxStrikes - 1;

  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.classList.add('animate-progress');
      const timer = setTimeout(() => setAnimationComplete(true), 500);
      return () => clearTimeout(timer);
    }
  }, [selectedClass]);

  const handleClassChange = (className) => {
    setSelectedClass(className);
    if (onClassChange) onClassChange(className);
    setAnimationComplete(false);
  };

  return (
    <div className="strike-tracker-container">
      <div className="strike-tracker-header">
        <div className="strike-tracker-title">
          <h3>Strike Tracker</h3>
          <div className="tooltip-container">
            <button
              className="tooltip-trigger"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              aria-label="Show strike policy information"
            >
              ?
            </button>
            {showTooltip && (
              <div className="tooltip-content">
                <p>Strike Policy: Students are allowed a maximum of {maxStrikes} absences per course.
                  Exceeding this limit may result in penalties according to the course policy.</p>
              </div>
            )}
          </div>
        </div>
        {selectedClass && strikes !== null && (
          <div className="strike-count-display">
            Strikes: <strong>{strikes}</strong> / {maxStrikes}
          </div>
        )}
      </div>

      <div className="class-pill-selector">
        {classes.map((cls) => (
          <button
            key={cls.name}
            className={`class-pill ${selectedClass === cls.name ? 'selected' : ''}`}
            onClick={() => handleClassChange(cls.name)}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {selectedClass && strikes !== null && (
        <>
          <div className="strike-progress-container">
            <div
              ref={progressBarRef}
              className={progressBarClass}
              style={{ width: animationComplete ? `${progressPercentage}%` : '0%' }}
            ></div>
          </div>

          {isOneStrikeAway && (
            <div className="strike-warning">
              <strong>Warning:</strong> One more absence will result in a penalty.
            </div>
          )}

          {strikes === 0 && (
            <div className="strike-success-message">
              <strong>Perfect attendance!</strong> Keep it up!
            </div>
          )}
        </>
      )}

      <div className="strike-actions">
        <button className="view-attendance-button">
          View attendance log
        </button>
      </div>
    </div>
  );
};

export default StrikeTracker;
