import React, { useState, useMemo } from 'react';
import '../styles/AttendanceDrillDown.css';

/**
 * AttendanceDrillDown Component
 * Displays a detailed session-by-session attendance log for a single class
 * 
 * @param {Object} props - Component props
 * @param {string} props.classID - ID of the class to show attendance for
 * @param {string} props.userID - ID of the user whose attendance is being viewed
 * @param {Function} [props.onClose] - Optional callback when the component is closed
 * @returns {JSX.Element} AttendanceDrillDown component
 */
const AttendanceDrillDown = ({ classID, userID, onClose }) => {
  // Filter and sort state
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');

  // Mock data - will be replaced with API call once backend is ready
  const mockAttendanceData = useMemo(() => [
    { 
      eventID: '1', 
      eventName: 'Lecture 1: Introduction', 
      date: '2025-01-13T09:00:00', 
      status: 'Present' 
    },
    { 
      eventID: '2', 
      eventName: 'Lecture 2: Basic Principles', 
      date: '2025-01-15T09:00:00', 
      status: 'Present' 
    },
    { 
      eventID: '3', 
      eventName: 'Lecture 3: Core Concepts', 
      date: '2025-01-20T09:00:00', 
      status: 'Absent' 
    },
    { 
      eventID: '4', 
      eventName: 'Lecture 4: Advanced Topics', 
      date: '2025-01-22T09:00:00', 
      status: 'Tardy',
      minutesLate: 7 
    },
    { 
      eventID: '5', 
      eventName: 'Lecture 5: Practical Applications', 
      date: '2025-01-27T09:00:00', 
      status: 'Present' 
    },
    { 
      eventID: '6', 
      eventName: 'Lecture 6: Case Studies', 
      date: '2025-01-29T09:00:00', 
      status: 'Present' 
    },
    { 
      eventID: '7', 
      eventName: 'Review Session', 
      date: '2025-02-03T14:00:00', 
      status: 'Tardy',
      minutesLate: 12 
    },
    { 
      eventID: '8', 
      eventName: 'Midterm Exam', 
      date: '2025-02-05T09:00:00', 
      status: 'Present' 
    },
    { 
      eventID: '9', 
      eventName: 'Lecture 7: Intermediate Concepts', 
      date: '2025-02-10T09:00:00', 
      status: 'Absent' 
    },
    { 
      eventID: '10', 
      eventName: 'Lecture 8: Industry Applications', 
      date: '2025-02-12T09:00:00', 
      status: 'Present' 
    },
    { 
      eventID: '11', 
      eventName: 'Lab Session 1', 
      date: '2025-02-17T14:00:00', 
      status: 'Present' 
    },
    { 
      eventID: '12', 
      eventName: 'Lab Session 2', 
      date: '2025-02-19T14:00:00', 
      status: 'Present' 
    }
  ], []);

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   async function fetchAttendanceData() {
  //     try {
  //       const response = await fetch(`/api/attendance?classID=${classID}&userID=${userID}`);
  //       const data = await response.json();
  //       setAttendanceData(data);
  //     } catch (error) {
  //       console.error('Error fetching attendance data:', error);
  //     }
  //   }
  //   fetchAttendanceData();
  // }, [classID, userID]);

  // Filter data based on selected status
  const filteredData = useMemo(() => {
    if (filterStatus === 'all') {
      return mockAttendanceData;
    }
    return mockAttendanceData.filter(item => 
      item.status.toLowerCase() === filterStatus.toLowerCase()
    );
  }, [mockAttendanceData, filterStatus]);

  // Sort data based on selected field and direction
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'eventName') {
        return sortDirection === 'asc' 
          ? a.eventName.localeCompare(b.eventName) 
          : b.eventName.localeCompare(a.eventName);
      } else if (sortField === 'status') {
        return sortDirection === 'asc' 
          ? a.status.localeCompare(b.status) 
          : b.status.localeCompare(a.status);
      }
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  // Handle sort click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Export current view to CSV
  const exportToCSV = () => {
    // Headers for CSV
    const headers = ['Date', 'Session', 'Status'];
    
    // Convert data to CSV format
    const csvData = sortedData.map(item => [
      formatDate(item.date),
      item.eventName,
      item.status + (item.minutesLate ? ` (${item.minutesLate} mins late)` : '')
    ]);
    
    // Add headers to the beginning
    csvData.unshift(headers);
    
    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\\n');
    
    // Create downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-log-${classID}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get status counts
  const statusCounts = useMemo(() => {
    const counts = { Present: 0, Tardy: 0, Absent: 0 };
    mockAttendanceData.forEach(item => {
      // Convert to lowercase to handle case variations
      const status = item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase();
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  }, [mockAttendanceData]);

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Get status display text with minutes late for tardy
  const getStatusDisplay = (item) => {
    const status = item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase();
    
    if (status === 'Tardy' && item.minutesLate !== undefined) {
      return `${status}: ${item.minutesLate} min${item.minutesLate !== 1 ? 's' : ''} late`;
    }
    
    return status;
  };

  return (
    <div className="attendance-drilldown-container">
      <header className="drilldown-header">
        <div className="drilldown-title-section">
          <button 
            className="back-button" 
            onClick={onClose}
            aria-label="Go back"
          >
            ← Back
          </button>
          <h2>Detailed Attendance Log</h2>
        </div>
        
        <div className="drilldown-actions">
          <div className="filter-control">
            <label htmlFor="status-filter">Filter by:</label>
            <select 
              id="status-filter" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Sessions ({mockAttendanceData.length})</option>
              <option value="present">Present ({statusCounts.Present})</option>
              <option value="tardy">Tardy ({statusCounts.Tardy})</option>
              <option value="absent">Absent ({statusCounts.Absent})</option>
            </select>
          </div>
          
          <button 
            className="export-button"
            onClick={exportToCSV}
            aria-label="Export to CSV"
          >
            Download CSV
          </button>
        </div>
      </header>
      
      <div className="attendance-stats-summary">
        <div className="stat-chip present">
          <span className="stat-count">{statusCounts.Present}</span>
          <span className="stat-label">Present</span>
        </div>
        <div className="stat-chip tardy">
          <span className="stat-count">{statusCounts.Tardy}</span>
          <span className="stat-label">Tardy</span>
        </div>
        <div className="stat-chip absent">
          <span className="stat-count">{statusCounts.Absent}</span>
          <span className="stat-label">Absent</span>
        </div>
      </div>
      
      <div className="drilldown-table-container" role="region" aria-label="Attendance records table, scroll horizontally if needed">
        <table className="drilldown-table">
          <thead>
            <tr>
              <th 
                className="sortable"
                onClick={() => handleSort('date')}
                aria-sort={sortField === 'date' ? sortDirection : 'none'}
              >
                Date {getSortIcon('date')}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('eventName')}
                aria-sort={sortField === 'eventName' ? sortDirection : 'none'}
              >
                Session {getSortIcon('eventName')}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('status')}
                aria-sort={sortField === 'status' ? sortDirection : 'none'}
              >
                Status {getSortIcon('status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={3} className="no-data">No attendance records found</td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr key={item.eventID} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.eventName}</td>
                  <td className={`status-cell status-${item.status.toLowerCase()}`}>
                    {getStatusDisplay(item)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceDrillDown;
