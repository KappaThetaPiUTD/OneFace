import React, { useState, useEffect, useRef } from 'react';
import '../styles/StrikeTracker.css';

/**
 * StrikeTracker Component
 * Displays the number of strikes a user has received for absences
 * Only admins will be able to modify the strike count in the future admin interface
 * 
 * @param {Object} props - Component props
 * @param {number} [props.maxStrikes=3] - Maximum number of strikes allowed
 * @param {number} [props.initialStrikes] - Initial number of strikes (uses mockStrikes if not provided)
 *                                         In production, this will come from an API call
 * @param {Function} [props.onClassChange] - Callback when selected class changes
 * @param {Array} [props.classes] - Array of class objects with name property
 * @returns {JSX.Element} StrikeTracker component
 */
const StrikeTracker = ({ maxStrikes = 3, initialStrikes, onClassChange, classes = [] }) => {
  // Mock classes if none provided
  const defaultClasses = classes.length > 0 ? classes : [
    { name: "CS 3162.002" },
    { name: "CS 4347.001" },
    { name: "CS 4365.003" },
    { name: "MKT 3300.001" },
    { name: "ACM Projects" }
  ];
  
  // Mock data - will be replaced with actual API call
  const mockStrikes = 1;
  const [selectedClass, setSelectedClass] = useState(defaultClasses[0]?.name || '');
  const [showTooltip, setShowTooltip] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const progressBarRef = useRef(null);
  
  // TODO: Replace mockStrikes with actual API data from /api/strikes?userID=...&classID=...
  // In the future, this will be fetched based on the selected class and current user
  // Only admins will be able to modify strike counts through a separate admin interface
  const strikes = initialStrikes !== undefined ? initialStrikes : mockStrikes;
  
  // Calculate progress percentage
  const progressPercentage = (strikes / maxStrikes) * 100;
  
  // Determine the progress bar color based on strikes
  let progressBarClass = 'strike-progress-bar';
  if (strikes === 0) {
    progressBarClass += ' strike-progress-green';
  } else if (strikes < maxStrikes) {
    progressBarClass += ' strike-progress-amber';
  } else {
    progressBarClass += ' strike-progress-red';
  }
  
  // Check if the user is one strike away from the limit
  const isOneStrikeAway = strikes === maxStrikes - 1;
  
  useEffect(() => {
    // Add animation class after mounting
    if (progressBarRef.current) {
      progressBarRef.current.classList.add('animate-progress');
      
      // Set animationComplete after animation duration (500ms)
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Handle class change
  const handleClassChange = (className) => {
    setSelectedClass(className);
    if (onClassChange) {
      onClassChange(className);
    }
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
        <div className="strike-count-display">
          Strikes: <strong>{strikes}</strong> / {maxStrikes}
        </div>
      </div>
      
      <div className="class-pill-selector">
        {defaultClasses.map((cls) => (
          <button
            key={cls.name}
            className={`class-pill ${selectedClass === cls.name ? 'selected' : ''}`}
            onClick={() => handleClassChange(cls.name)}
          >
            {cls.name}
          </button>
        ))}
      </div>
      
      <div className="strike-progress-container">
        <div 
          ref={progressBarRef}
          className={progressBarClass} 
          style={{ width: animationComplete ? `${progressPercentage}%` : '0%' }}
        ></div>
      </div>
      
      {isOneStrikeAway && (
        <div className="strike-warning">
          <strong>Warning:</strong> One more absence will result in a penalty according to the course policy.
        </div>
      )}
      
      {strikes === 0 && (
        <div className="strike-success-message">
          <strong>Perfect attendance!</strong> Keep up the good work.
        </div>
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
