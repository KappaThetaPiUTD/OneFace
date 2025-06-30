import { useEffect, useRef, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import StrikeTracker from '../components/StrikeTracker';
import ClassAttendanceList from '../components/ClassAttendanceList';

export default function Dashboard() {
  // State for selected class (strike count will be managed by admin in the future)
  const [selectedClass, setSelectedClass] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // API base URL
  const API_BASE_URL = 'https://9g63csumjh.execute-api.us-east-2.amazonaws.com/dev';

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        console.log('Current user:', user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Fetch organizations dynamically
  useEffect(() => {
    const fetchOrganizations = async () => {
      setOrganizationsLoading(true);
      try {
        const userID = currentUser?.userId || '';
        const url = `${API_BASE_URL}/organizations${userID ? `?userID=${userID}` : ''}`;
        
        console.log('🔄 Fetching organizations from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Organizations fetched:', data);
          setOrganizations(data.organizations || []);
          
          // Set first organization as selected if none selected
          if (!selectedClass && data.organizations && data.organizations.length > 0) {
            setSelectedClass(data.organizations[0].name);
          }
        } else {
          console.error('❌ Failed to fetch organizations:', response.status);
          // Fallback to default organization
          const fallbackOrg = {
            id: 'kappa-theta-pi',
            name: 'Kappa Theta Pi Frat',
            type: 'organization',
            eventID: 1,
            totalMembers: 0,
            presentMembers: 0,
            attendanceRate: 0
          };
          setOrganizations([fallbackOrg]);
          setSelectedClass(fallbackOrg.name);
        }
      } catch (error) {
        console.error('💥 Error fetching organizations:', error);
        // Fallback to default organization
        const fallbackOrg = {
          id: 'kappa-theta-pi',
          name: 'Kappa Theta Pi Frat',
          type: 'organization',
          eventID: 1,
          totalMembers: 0,
          presentMembers: 0,
          attendanceRate: 0
        };
        setOrganizations([fallbackOrg]);
        setSelectedClass(fallbackOrg.name);
      } finally {
        setOrganizationsLoading(false);
      }
    };

    if (currentUser) {
      fetchOrganizations();
    }
  }, [currentUser]);

  // Convert organizations to classes format for existing components
  const classes = organizations.map(org => ({
    name: org.name,
    type: "Organizations"
  }));
  
  const attendance = organizations.map(org => ({
    code: org.name,
    done: org.presentMembers || 0,
    total: org.totalMembers || 0,
    percent: `${org.attendanceRate || 0}%`,
    cls: (org.attendanceRate || 0) >= 90 ? "green" : (org.attendanceRate || 0) >= 70 ? "amber" : "red"
  }));

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

