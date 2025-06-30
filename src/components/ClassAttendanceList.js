import React, { useState, useEffect } from 'react';
import '../styles/ClassAttendanceList.css';

const ClassAttendanceList = ({ onClassClick }) => {
  const [hoveredClass, setHoveredClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const userId = 'tester';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, attendanceRes] = await Promise.all([
          fetch(`http://localhost:4000/user/${userId}/classes`),
          fetch(`http://localhost:4000/user/${userId}/attendance`)
        ]);

        const classesData = await classesRes.json();
        const attendanceData = await attendanceRes.json();

        setClasses(classesData.map(cls => ({
          name: cls.className,
          type: "Classes"
        })));

        setAttendance(attendanceData.map(item => ({
          code: item.className,
          done: item.attended,
          total: item.total,
          percent: item.percent,
          cls: item.cls
        })));
      } catch (error) {
        console.error("Error fetching class attendance data:", error);
      }
    };

    fetchData();
  }, []);

  const mergedData = classes.map(classItem => {
    const attendanceData = attendance.find(a => a.code === classItem.name) || 
      { done: 0, total: 0, percent: 'N/A', cls: 'gray' };

    const missed = attendanceData.total - attendanceData.done;
    const attendanceRate = attendanceData.total > 0
      ? (attendanceData.done / attendanceData.total * 100).toFixed(0)
      : 'N/A';

    let statusMessage = '';
    let recommendation = '';

    if (attendanceData.cls === 'green') {
      statusMessage = 'Excellent';
      recommendation = 'Keep up the great attendance!';
    } else if (attendanceData.cls === 'amber') {
      statusMessage = 'Good';
      recommendation = 'Try to attend more regularly.';
    } else if (attendanceData.cls === 'red') {
      statusMessage = 'Needs Attention';
      recommendation = 'Contact your instructor about your attendance.';
    }

    return {
      id: classItem.name,
      name: classItem.name,
      type: classItem.type,
      attendancePercent: attendanceRate === 'N/A' ? 'N/A' : `${attendanceRate}%`,
      attendanceRate,
      missed,
      total: attendanceData.total,
      colorClass: attendanceData.cls || "gray",
      statusMessage,
      recommendation,
    };
  });

  return (
    <div className="class-attendance-list">
      <h1>My Classes &amp; Organizations</h1>

      <div className="class-list">
        {mergedData.map((item) => (
          <div
            className="class-row"
            key={item.id}
            onClick={() => onClassClick && onClassClick(item.name)}
            onMouseEnter={() => setHoveredClass(item.id)}
            onMouseLeave={() => setHoveredClass(null)}
          >
            <div className="class-name-section">
              <div className="class-name">{item.name}</div>
              <div className="class-type">{item.type}</div>
            </div>

            <div className={`attendance-badge ${item.colorClass}`}>
              {item.attendancePercent}
            </div>

            {hoveredClass === item.id && (
              <div className="tooltip">
                <div className="tooltip-header">{item.name} Attendance</div>
                <div>Classes missed: {item.missed} / {item.total}</div>
                <div className="tooltip-details">
                  Attendance rate: {item.attendancePercent}
                </div>
                <div className={`tooltip-status ${item.colorClass}`}>
                  {item.statusMessage}
                </div>
                {item.recommendation && (
                  <div className="tooltip-details" style={{ marginTop: '5px', fontStyle: 'italic' }}>
                    {item.recommendation}
                  </div>
                )}
                <div className="tooltip-arrow"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassAttendanceList;
