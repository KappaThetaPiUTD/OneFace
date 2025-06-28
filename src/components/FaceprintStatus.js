import React, { useState, useEffect } from 'react';
import '../styles/FaceprintStatus.css';

/**
 * Component to display the user's faceprint registration status
 * 
 * @param {Object} props - Component props
 * @param {string} props.userID - The ID of the current user
 * @param {Function} [props.onEnroll] - Optional callback for when the enroll button is clicked
 * @returns {React.ReactElement} The FaceprintStatus component
 */
const FaceprintStatus = ({ userID, onEnroll }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call to fetch user data
        // For demo purposes, we'll simulate an API call with setTimeout
        setTimeout(() => {
          // Mock API response
          // In real scenario, this would come from your backend
          const mockUserData = {
            id: userID,
            name: "Student Name",
            email: "student@example.edu",
            // Simulate different faceprint statuses based on userID for demo
            facePrintID: userID === 'pending-user' ? 'pending' : 
                         userID === 'verified-user' ? 'fp_12345' : undefined,
            facePrintVerifiedDate: userID === 'verified-user' ? '2025-06-15T10:30:45Z' : null,
          };
          
          setUserData(mockUserData);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load user data. Please try again.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userID]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Handler for enroll button click
  const handleEnrollClick = () => {
    if (onEnroll && typeof onEnroll === 'function') {
      onEnroll();
    }
  };

  // Determine status type and content
  const getStatusContent = () => {
    if (!userData) return null;

    if (!userData.facePrintID) {
      // Not registered
      return (
        <div className="faceprint-status not-registered">
          <div className="faceprint-icon-container">
            <svg className="faceprint-icon warning" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          <div className="faceprint-content">
            <h3>Faceprint not registered</h3>
            <p>Register your face to enable quick attendance verification.</p>
            <button 
              className="faceprint-enroll-button"
              onClick={handleEnrollClick}
              aria-label="Enroll now for faceprint registration"
            >
              Enroll Now
            </button>
          </div>
        </div>
      );
    } else if (userData.facePrintID === 'pending') {
      // Pending verification
      return (
        <div className="faceprint-status pending">
          <div className="faceprint-icon-container">
            <div className="faceprint-spinner" aria-hidden="true"></div>
          </div>
          <div className="faceprint-content">
            <h3>Enrollment in progress</h3>
            <p>Your faceprint registration is being processed. This may take a few minutes.</p>
          </div>
        </div>
      );
    } else {
      // Verified
      return (
        <div className="faceprint-status verified">
          <div className="faceprint-icon-container">
            <svg className="faceprint-icon success" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-13l-2 2 6 6 6-6-2-2-4 4z" />
            </svg>
          </div>
          <div className="faceprint-content">
            <h3>Faceprint verified</h3>
            <p>Your faceprint was successfully registered on {formatDate(userData.facePrintVerifiedDate)}.</p>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="faceprint-status-container loading">
        <div className="faceprint-spinner"></div>
        <p className="loading-text">Loading faceprint status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="faceprint-status-container error">
        <div className="faceprint-icon-container">
          <svg className="faceprint-icon error" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        </div>
        <div className="faceprint-content">
          <p className="error-text">{error}</p>
          <button 
            className="faceprint-retry-button"
            onClick={() => window.location.reload()}
            aria-label="Retry loading faceprint status"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="faceprint-status-container">
      {getStatusContent()}
    </div>
  );
};

export default FaceprintStatus;
