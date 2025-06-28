import React, { useState, useRef, useEffect } from 'react';

const CameraPage = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState('idle'); // 'idle', 'recognizing', 'recognized'
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const videoRef = useRef(null);

  const openCamera = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: false 
      });
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      // Set the video source once the popup is open
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera device found.';
      } else {
        errorMessage += 'Please check your camera settings.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const closeCamera = () => {
    if (stream) {
      // Stop all tracks to release the camera
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setError(null);
    // Reset recognition state when closing camera
    setRecognitionStatus('idle');
    setIsRecognitionActive(false);
  };

  const startRecognition = () => {
    setIsRecognitionActive(true);
    setRecognitionStatus('recognizing');
    
    // Simulate recognition process
    setTimeout(() => {
      setRecognitionStatus('recognized');
    }, 2000);
  };

  const stopRecognition = () => {
    setIsRecognitionActive(false);
    setRecognitionStatus('idle');
  };

  const getStatusText = () => {
    switch (recognitionStatus) {
      case 'recognizing':
        return 'Recognizing…';
      case 'recognized':
        return 'Recognized: Jane Doe';
      default:
        return 'Awaiting Recognition';
    }
  };

  const getStatusColor = () => {
    switch (recognitionStatus) {
      case 'recognizing':
        return '#f59e0b'; // Yellow
      case 'recognized':
        return '#169143'; // Green
      default:
        return '#f59e0b'; // Yellow
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div style={styles.container}>
      <div className="camera-page-header" style={styles.header}>
        <h1 style={styles.title}>Camera Access</h1>
        <p style={styles.subtitle}>
          Professional camera interface for media capture and monitoring
        </p>
      </div>
      
      <div style={styles.content}>
        <div className="camera-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <div className="camera-icon-container" style={styles.iconContainer}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <h3 style={styles.cardTitle}>Camera Device</h3>
            <p style={styles.cardDescription}>
              Access your device camera to capture video feed
            </p>
          </div>
          
          <div style={styles.cardActions}>
            <button 
              onClick={openCamera} 
              className="camera-button"
              style={{
                ...styles.primaryButton,
                ...(isLoading ? styles.loadingButton : {}),
                ...(isCameraOpen ? styles.disabledButton : {})
              }}
              disabled={isCameraOpen || isLoading}
            >
              {isLoading ? (
                <>
                  <span style={styles.spinner}></span>
                  Initializing...
                </>
              ) : isCameraOpen ? (
                'Camera Active'
              ) : (
                'Launch Camera'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="camera-error-card" style={styles.errorCard}>
            <div style={styles.errorIcon}>⚠️</div>
            <div>
              <h4 style={styles.errorTitle}>Camera Access Error</h4>
              <p style={styles.errorMessage}>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Camera Popup */}
      {isCameraOpen && (
        <div style={styles.overlay}>
          <div className="camera-modal" style={styles.modal}>
            <div className="camera-modal-header" style={styles.modalHeader}>
              <div style={styles.modalHeaderContent}>
                <h3 style={styles.modalTitle}>Live Camera Feed</h3>
                <div style={styles.statusBadge}>
                  <span style={styles.statusDot}></span>
                  Recording
                </div>
              </div>
              <button 
                onClick={closeCamera}
                className="camera-close"
                style={styles.closeButton}
                aria-label="Close camera"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div style={styles.videoWrapper}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={styles.video}
              />
              
              {/* Top right controls */}
              <div style={styles.videoOverlay}>
                <div style={styles.videoControls}>
                  <button 
                    className="camera-control"
                    style={styles.controlButton} 
                    aria-label="Take snapshot">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Bottom control bar */}
              <div className="camera-bottom-control-bar" style={styles.bottomControlBar}>
                <button
                  onClick={startRecognition}
                  disabled={isRecognitionActive}
                  className="recognition-button"
                  style={{
                    ...styles.recognitionButton,
                    ...(isRecognitionActive ? styles.disabledRecognitionButton : {})
                  }}
                >
                  Start
                </button>

                <div className="camera-status-section" style={styles.statusSection}>
                  <div 
                    style={{
                      ...styles.statusDot,
                      backgroundColor: getStatusColor()
                    }}
                  ></div>
                  <span className="camera-status-text" style={styles.statusText}>{getStatusText()}</span>
                </div>

                <button
                  onClick={stopRecognition}
                  disabled={!isRecognitionActive}
                  className="recognition-button"
                  style={{
                    ...styles.recognitionButton,
                    ...(!isRecognitionActive ? styles.disabledRecognitionButton : {})
                  }}
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, var(--bg) 0%, rgba(107, 165, 183, 0.1) 50%, var(--bg) 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: 'var(--font-body)',
    transition: 'background-color 0.3s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    color: '#333',
    transition: 'color 0.3s ease',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 1rem 0',
    color: '#333',
    transition: 'color 0.3s ease',
    letterSpacing: '-0.02em',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '1.2rem',
    fontWeight: '400',
    opacity: 0.8,
    margin: 0,
    color: '#555',
    transition: 'color 0.3s ease',
    letterSpacing: '0.01em',
    lineHeight: '1.6',
  },
  content: {
    maxWidth: '500px',
    width: '100%',
  },
  card: {
    background: '#fff',
    border: 'var(--card-border)',
    borderRadius: '20px',
    padding: '3rem 2.5rem',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
    marginBottom: '2rem',
    transition: 'all 0.3s ease',
    transform: 'translateY(0)',
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  iconContainer: {
    display: 'inline-flex',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, var(--wave), var(--sidebar))',
    borderRadius: '50%',
    marginBottom: '2rem',
    boxShadow: '0 8px 24px rgba(0, 100, 138, 0.2)',
    transition: 'all 0.3s ease',
  },
  icon: {
    color: 'white',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
  },
  cardTitle: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 1rem 0',
    transition: 'color 0.3s ease',
    letterSpacing: '-0.01em',
    lineHeight: '1.3',
  },
  cardDescription: {
    fontSize: '1.1rem',
    color: '#666',
    margin: 0,
    lineHeight: '1.7',
    transition: 'color 0.3s ease',
    letterSpacing: '0.005em',
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2rem',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, var(--wave), var(--sidebar))',
    color: 'white',
    border: 'none',
    padding: '1rem 2.5rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    minWidth: '180px',
    justifyContent: 'center',
    letterSpacing: '0.02em',
    boxShadow: '0 4px 16px rgba(0, 100, 138, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  loadingButton: {
    background: 'linear-gradient(135deg, var(--sidebar), #95b8c4)',
    boxShadow: '0 4px 16px rgba(107, 165, 183, 0.3)',
  },
  disabledButton: {
    background: 'linear-gradient(135deg, #169143, #22c55e)',
    boxShadow: '0 4px 16px rgba(22, 145, 67, 0.3)',
    cursor: 'not-allowed',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorCard: {
    background: '#fff',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.25rem',
    boxShadow: '0 8px 32px rgba(239, 68, 68, 0.08)',
    transition: 'all 0.3s ease',
  },
  errorIcon: {
    fontSize: '1.75rem',
    flexShrink: 0,
    color: '#ef4444',
    filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.2))',
  },
  errorTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#dc2626',
    margin: '0 0 0.75rem 0',
    letterSpacing: '-0.01em',
  },
  errorMessage: {
    fontSize: '1rem',
    color: '#991b1b',
    margin: 0,
    lineHeight: '1.6',
    letterSpacing: '0.005em',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
    animation: 'fadeIn 0.3s ease',
  },
  modal: {
    background: '#fff',
    borderRadius: '24px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '850px',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    border: 'var(--card-border)',
    transition: 'all 0.3s ease',
    animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  modalHeader: {
    padding: '2rem 2.5rem 1.5rem',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, var(--bg), rgba(107, 165, 183, 0.05))',
    transition: 'all 0.3s ease',
  },
  modalHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333',
    transition: 'color 0.3s ease',
    letterSpacing: '-0.01em',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(22, 145, 67, 0.1)',
    color: '#169143',
    padding: '0.5rem 1rem',
    borderRadius: '24px',
    fontSize: '0.9rem',
    fontWeight: '600',
    letterSpacing: '0.01em',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    background: '#169143',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
    boxShadow: '0 0 8px rgba(22, 145, 67, 0.4)',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    padding: '0.75rem',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
  },
  videoWrapper: {
    position: 'relative',
    background: '#000',
  },
  video: {
    width: '100%',
    height: 'auto',
    maxHeight: '65vh',
    display: 'block',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: '1.5rem',
    right: '1.5rem',
  },
  videoControls: {
    display: 'flex',
    gap: '0.75rem',
  },
  controlButton: {
    background: 'rgba(0, 100, 138, 0.9)',
    border: 'none',
    color: 'white',
    padding: '1rem',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  bottomControlBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.1)',
  },
  recognitionButton: {
    background: 'linear-gradient(135deg, var(--wave), var(--sidebar))',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '80px',
    letterSpacing: '0.01em',
    boxShadow: '0 3px 12px rgba(0, 100, 138, 0.3)',
  },
  disabledRecognitionButton: {
    background: 'linear-gradient(135deg, #9ca3af, #d1d5db)',
    boxShadow: '0 3px 12px rgba(156, 163, 175, 0.3)',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  statusSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(0, 0, 0, 0.05)',
    padding: '0.75rem 1.25rem',
    borderRadius: '24px',
    backdropFilter: 'blur(5px)',
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)',
    animation: 'statusPulse 2s infinite',
  },
  statusText: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#333',
    letterSpacing: '0.005em',
    transition: 'color 0.3s ease',
  },
};

// Add CSS animations to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    @keyframes slideUp {
      0% { transform: translateY(30px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes statusPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }
    
    /* Enhanced card hover effect */
    .camera-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
    }
    
    /* Icon container hover effect */
    .camera-icon-container:hover {
      transform: scale(1.05) rotate(2deg);
      box-shadow: 0 12px 32px rgba(0, 100, 138, 0.3);
    }
    
    /* Enhanced button hover effects */
    .camera-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 100, 138, 0.4);
      background: linear-gradient(135deg, #0074a6, #7bb3c4);
    }
    
    .camera-button:active:not(:disabled) {
      transform: translateY(0);
      transition: all 0.1s ease;
    }
    
    /* Button shimmer effect */
    .camera-button:not(:disabled)::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }
    
    .camera-button:hover:not(:disabled)::before {
      left: 100%;
    }
    
    .camera-control:hover {
      background: rgba(0, 100, 138, 1);
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
    
    .camera-close:hover {
      background: rgba(0, 100, 138, 0.1);
      color: var(--wave);
      transform: scale(1.1);
    }
    
    /* Recognition button hover effects */
    .recognition-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 100, 138, 0.4);
      background: linear-gradient(135deg, #0074a6, #7bb3c4);
    }
    
    .recognition-button:active:not(:disabled) {
      transform: translateY(0);
      transition: all 0.1s ease;
    }
    
    /* Dark mode support for camera page */
    body[data-theme="dark"] .camera-page-header h1,
    body[data-theme="dark"] .camera-page-header p,
    body[data-using-system-theme="true"] .camera-page-header h1,
    body[data-using-system-theme="true"] .camera-page-header p {
      color: #e0e0e0;
    }
    
    body[data-theme="dark"] .camera-card,
    body[data-using-system-theme="true"] .camera-card {
      background: #252525;
      border-color: #333;
    }
    
    body[data-theme="dark"] .camera-modal,
    body[data-using-system-theme="true"] .camera-modal {
      background: #252525;
      border-color: #333;
    }
    
    body[data-theme="dark"] .camera-modal-header,
    body[data-using-system-theme="true"] .camera-modal-header {
      border-bottom-color: #333;
      background: linear-gradient(135deg, #121212, rgba(44, 71, 89, 0.1));
    }
    
    body[data-theme="dark"] .camera-error-card,
    body[data-using-system-theme="true"] .camera-error-card {
      background: #2d1b1b;
      border-color: #4a2626;
    }
    
    /* Dark mode support for bottom control bar */
    body[data-theme="dark"] .camera-bottom-control-bar,
    body[data-using-system-theme="true"] .camera-bottom-control-bar {
      background: rgba(37, 37, 37, 0.95);
      border-top-color: #333;
    }
    
    body[data-theme="dark"] .camera-status-section,
    body[data-using-system-theme="true"] .camera-status-section {
      background: rgba(255, 255, 255, 0.1);
    }
    
    body[data-theme="dark"] .camera-status-text,
    body[data-using-system-theme="true"] .camera-status-text {
      color: #e0e0e0;
    }
    
    /* Responsive design improvements */
    @media (max-width: 768px) {
      .camera-card {
        padding: 2rem 1.5rem !important;
        margin: 1rem !important;
      }
      
      .camera-page-header h1 {
        font-size: 2rem !important;
      }
      
      .camera-page-header p {
        font-size: 1rem !important;
      }
      
      .camera-modal {
        margin: 1rem !important;
        width: calc(100vw - 2rem) !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default CameraPage;
