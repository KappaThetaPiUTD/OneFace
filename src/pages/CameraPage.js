import React, { useState, useRef, useEffect } from 'react';
import '../styles/CameraPage.css';

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
        return '🔍 Recognizing…';
      case 'recognized':
        return '✓ Recognized: Jane Doe';
      default:
        return '⏳ Awaiting Recognition';
    }
  };

  const getStatusClass = () => {
    switch (recognitionStatus) {
      case 'recognizing':
        return 'status-recognizing';
      case 'recognized':
        return 'status-recognized';
      default:
        return 'status-idle';
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
    <div className="camera-page-container">
      <div className="camera-page-header">
        <h1 className="camera-page-title">Camera Access</h1>
        <p className="camera-page-subtitle">
          Professional camera interface for media capture and monitoring
        </p>
      </div>
      
      <div className="camera-page-content">
        <div className="camera-card">
          <div className="camera-card-header">
            <div className="camera-icon-container">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="camera-icon">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <h3 className="camera-card-title">Camera Device</h3>
            <p className="camera-card-description">
              Access your device camera to capture video feed
            </p>
          </div>
          
          <div className="camera-card-actions">
            <button 
              onClick={openCamera} 
              className={`camera-primary-button ${isLoading ? 'loading' : ''} ${isCameraOpen ? 'active' : ''}`}
              disabled={isCameraOpen || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="camera-loading-spinner"></span>
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
          <div className="camera-error-card">
            <div className="camera-error-icon">⚠️</div>
            <div>
              <h4 className="camera-error-title">Camera Access Error</h4>
              <p className="camera-error-message">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Camera Popup */}
      {isCameraOpen && (
        <div className="camera-overlay">
          <div className="camera-modal">
            <div className="camera-modal-header">
              <div className="camera-modal-header-content">
                <h3 className="camera-modal-title">Live Camera Feed</h3>
                <div className="camera-status-badge">
                  <span className="camera-status-dot"></span>
                  Recording
                </div>
              </div>
              <button 
                onClick={closeCamera}
                className="camera-close-button"
                aria-label="Close camera"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="camera-video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
              
              {/* Top right controls */}
              <div className="camera-video-overlay">
                <div className="camera-video-controls">
                  <button 
                    className="camera-control-button"
                    aria-label="Take snapshot">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Bottom control bar */}
              <div className="camera-bottom-control-bar">
                <button
                  onClick={startRecognition}
                  disabled={isRecognitionActive}
                  className="camera-recognition-button"
                >
                  Start
                </button>

                <div className="camera-status-section">
                  <div className={`camera-status-dot-control ${getStatusClass()}`}></div>
                  <span className="camera-status-text">{getStatusText()}</span>
                </div>

                <button
                  onClick={stopRecognition}
                  disabled={!isRecognitionActive}
                  className="camera-recognition-button"
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

export default CameraPage;
