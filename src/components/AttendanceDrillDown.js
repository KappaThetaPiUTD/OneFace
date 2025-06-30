import React, { useState, useEffect, useMemo } from 'react';
import '../styles/AttendanceDrillDown.css';

const AttendanceDrillDown = ({ classID, userID, onClose }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        const response = await fetch(`http://localhost:4000/attendance-history?userId=tester&classId=${classID}`);
        if (!response.ok) throw new Error('Failed to fetch attendance data');
        const data = await response.json();
        setAttendanceData(data);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
      }
    }

    fetchAttendanceData();
  }, [classID, userID]);

  const filteredData = useMemo(() => {
    if (filterStatus === 'all') return attendanceData;
    return attendanceData.filter(item => item.status?.toLowerCase() === filterStatus);
  }, [attendanceData, filterStatus]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortField === 'date') return sortDirection === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
      if (sortField === 'sessionName') return sortDirection === 'asc' ? a.sessionName.localeCompare(b.sessionName) : b.sessionName.localeCompare(a.sessionName);
      if (sortField === 'status') return sortDirection === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Session', 'Status'];
    const csvData = sortedData.map(item => [
      formatDate(item.date),
      item.sessionName,
      item.status + (item.minutesLate ? ` (${item.minutesLate} mins late)` : '')
    ]);
    csvData.unshift(headers);
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-log-${classID}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusCounts = useMemo(() => {
    const counts = { present: 0, tardy: 0, absent: 0 };
    attendanceData.forEach(item => {
      const status = item.status?.toLowerCase();
      if (counts[status] !== undefined) counts[status]++;
    });
    return counts;
  }, [attendanceData]);

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getStatusDisplay = (item) => {
    if (!item.status) return 'Unknown';
    if (item.status.toLowerCase() === 'tardy') {
      return `Tardy: ${item.minutesLate ?? '0'} min${item.minutesLate === 1 ? '' : 's'} late`;
    }
    return item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase();
  };

  return (
    <div className="attendance-drilldown-container">
      <header className="drilldown-header">
        <div className="drilldown-title-section">
          <button className="back-button" onClick={onClose}>← Back</button>
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
              <option value="all">All Sessions ({attendanceData.length})</option>
              <option value="present">Present ({statusCounts.present})</option>
              <option value="tardy">Tardy ({statusCounts.tardy})</option>
              <option value="absent">Absent ({statusCounts.absent})</option>
            </select>
          </div>
          <button className="export-button" onClick={exportToCSV}>Download CSV</button>
        </div>
      </header>

      <div className="attendance-stats-summary">
        <div className="stat-chip present">
          <span className="stat-count">{statusCounts.present}</span>
          <span className="stat-label">Present</span>
        </div>
        <div className="stat-chip tardy">
          <span className="stat-count">{statusCounts.tardy}</span>
          <span className="stat-label">Tardy</span>
        </div>
        <div className="stat-chip absent">
          <span className="stat-count">{statusCounts.absent}</span>
          <span className="stat-label">Absent</span>
        </div>
      </div>

      <div className="drilldown-table-container" role="region" aria-label="Attendance records table">
        <table className="drilldown-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} className="sortable">Date {getSortIcon('date')}</th>
              <th onClick={() => handleSort('sessionName')} className="sortable">Session {getSortIcon('sessionName')}</th>
              <th onClick={() => handleSort('status')} className="sortable">Status {getSortIcon('status')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr><td colSpan={3} className="no-data">No attendance records found</td></tr>
            ) : (
              sortedData.map((item, index) => (
                <tr key={item.id || item.eventID} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.sessionName}</td>
                  <td className={`status-cell status-${item.status?.toLowerCase() || 'unknown'}`}>
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

