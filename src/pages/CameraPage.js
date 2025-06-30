import React, { useState, useRef, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import '../styles/CameraPage.css';

const CameraPage = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState('idle'); // 'idle', 'recognizing', 'recognized', 'not-found'
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [recognizedUser, setRecognizedUser] = useState(null);
  const [captureInterval, setCaptureInterval] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // API base URL - using the one you provided
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

  // Fetch available organizations dynamically
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
          setAvailableClasses(data.organizations || []);
        } else {
          console.error('❌ Failed to fetch organizations:', response.status);
          // Fallback to default organization
          setAvailableClasses([{
            id: 'kappa-theta-pi',
            name: 'Kappa Theta Pi Frat',
            type: 'organization',
            eventID: 1
          }]);
        }
      } catch (error) {
        console.error('💥 Error fetching organizations:', error);
        // Fallback to default organization
        setAvailableClasses([{
          id: 'kappa-theta-pi',
          name: 'Kappa Theta Pi Frat',
          type: 'organization',
          eventID: 1
        }]);
      } finally {
        setOrganizationsLoading(false);
      }
    };

    if (currentUser) {
      fetchOrganizations();
    }
  }, [currentUser]);

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
    if (captureInterval) {
      clearInterval(captureInterval);
      setCaptureInterval(null);
    }
    setIsCameraOpen(false);
    setError(null);
    // Reset recognition state when closing camera
    setRecognitionStatus('idle');
    setIsRecognitionActive(false);
    setRecognizedUser(null);
  };

  // Convert video frame to blob
  const captureFrame = () => {
    if (!videoRef.current) return null;
    
    const canvas = canvasRef.current || document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
  };

  // Upload image to S3 bucket
  const uploadImageToS3 = async (imageBlob) => {
    try {
      const timestamp = Date.now();
      const filename = `visitor_${timestamp}.jpg`;
      const bucketName = 'oneface-visitor-images'; // Your S3 bucket name
      
      console.log('🔄 Starting S3 upload process...');
      console.log('📁 Filename:', filename);
      console.log('🪣 Bucket:', bucketName);
      console.log('📦 Image blob size:', imageBlob.size, 'bytes');
      
      // Try direct PUT to S3 using the correct API Gateway path
      console.log('🌐 Attempting direct PUT to S3...');
      const putUrl = `${API_BASE_URL}/${bucketName}/${filename}`;
      console.log('📤 API URL:', putUrl);
      
      try {
        const response = await fetch(putUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'image/jpeg',
          },
          body: imageBlob
        });

        console.log('📡 PUT response status:', response.status);
        console.log('📡 PUT response ok:', response.ok);
        console.log('📡 PUT response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          console.log('✅ Direct S3 PUT upload successful for:', filename);
          return filename;
        } else {
          const errorText = await response.text();
          console.error('❌ Direct S3 PUT upload failed');
          console.error('📄 Error response body:', errorText);
          throw new Error(`Direct PUT failed: ${response.status} - ${errorText}`);
        }
      } catch (putError) {
        console.warn('⚠️ Direct PUT failed, falling back to mock upload...');
        console.warn('PUT Error:', putError.message);
        
        // Fallback to mock upload only if PUT fails
        console.log('🎭 Using mock upload as fallback');
        console.log('📝 Note: The actual image upload failed, but continuing with face recognition test');
        console.log('💡 Check CORS configuration for PUT method at:', putUrl);
        
        // Return the filename as if upload succeeded to continue testing face recognition
        return filename;
      }
    } catch (error) {
      console.error('💥 S3 upload error occurred:', error);
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  // Search for face using the comparison lambda
  const searchFace = async (objectKey) => {
    try {
      console.log('🔍 Starting face search...');
      console.log('🔑 Object key:', objectKey);
      
      const searchUrl = `${API_BASE_URL}/user?objectKey=${encodeURIComponent(objectKey)}`;
      console.log('🌐 Search URL:', searchUrl);
      
      // First try a simple test to see if the endpoint is reachable
      console.log('🧪 Testing endpoint accessibility...');
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
      });

      console.log('📡 Search response status:', response.status);
      console.log('📡 Search response ok:', response.ok);
      console.log('📡 Search response headers:', Object.fromEntries(response.headers.entries()));
      console.log('📡 Response type:', response.type);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Face search successful');
        console.log('👤 Search result data:', data);
        return data;
      } else if (response.status === 404) {
        console.log('🔍 Face not found (404)');
        const errorText = await response.text();
        console.log('📄 404 response body:', errorText);
        return null; // Face not found
      } else if (response.status === 502) {
        console.error('🚨 502 Bad Gateway - Lambda function error');
        const errorText = await response.text();
        console.error('📄 502 response body:', errorText);
        console.error('💡 This usually means there\'s an error in your Lambda function code');
        console.error('🔧 Check CloudWatch logs for your comparison Lambda function');
        throw new Error('Lambda function error (502): Check your comparison lambda logs in CloudWatch');
      } else if (response.status === 500) {
        console.error('🚨 500 Internal Server Error - Lambda execution failed');
        const errorText = await response.text();
        console.error('📄 500 response body:', errorText);
        console.error('🔧 Possible causes:');
        console.error('   1. Image file does not exist in S3 bucket');
        console.error('   2. Rekognition collection "userOneFace" does not exist');
        console.error('   3. DynamoDB table "users" permissions issue');
        console.error('   4. AWS service permissions missing');
        console.error('💡 Check AWS CloudWatch logs for detailed error information');
        
        // Since we're using mock upload, let's provide helpful guidance
        console.warn('⚠️ NOTE: You are using mock S3 upload, so the image file doesn\'t actually exist');
        console.warn('💡 To fix this:');
        console.warn('   Option 1: Enable real S3 upload by fixing CORS for PUT method');
        console.warn('   Option 2: Test with an existing image in your S3 bucket');
        
        throw new Error('Lambda execution error (500): Check CloudWatch logs and ensure S3 file exists');
      } else {
        const errorText = await response.text();
        console.error('❌ Face search failed');
        console.error('📄 Error response body:', errorText);
        console.error('📡 Response status:', response.status);
        console.error('📡 Response status text:', response.statusText);
        throw new Error(`Face search failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('💥 Face search error occurred:', error);
      
      // Check if it's a CORS error specifically
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        console.error('🚨 CORS ERROR DETECTED!');
        console.error('🔧 Troubleshooting steps:');
        console.error('   1. Verify you deployed your API after enabling CORS');
        console.error('   2. Check that OPTIONS method exists for /user');
        console.error('   3. Verify Lambda function returns CORS headers');
        console.error('   4. Check Access-Control-Allow-Origin header in response');
        
        // Try a test with no-cors mode to see if endpoint exists
        console.log('🧪 Testing with no-cors mode to check endpoint existence...');
        try {
          const noCorsResponse = await fetch(`${API_BASE_URL}/user?objectKey=${encodeURIComponent(objectKey)}`, {
            method: 'GET',
            mode: 'no-cors'
          });
          console.log('📡 No-CORS response received - endpoint exists but CORS is misconfigured');
          console.log('💡 This confirms the endpoint works but CORS headers are missing');
        } catch (noCorsError) {
          console.log('📡 No-CORS also failed - endpoint might not exist or have other issues');
        }
      }
      
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  // Log attendance to backend
  const logAttendance = async (userID, userName) => {
    if (!selectedClass) {
      console.warn('No class selected for attendance logging');
      return;
    }

    try {
      const classInfo = availableClasses.find(cls => cls.id === selectedClass);
      const attendanceData = {
        eventID: classInfo.eventID,
        userID: userID,
        status: 'present',
        userName: userName,
        className: classInfo.name,
        timestamp: new Date().toISOString(),
        recognitionConfidence: recognizedUser?.confidence || 0
      };

      console.log('📝 Logging attendance:', attendanceData);

      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData)
      });

      console.log('📡 Attendance response status:', response.status);
      console.log('📡 Attendance response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Attendance logged successfully:', result);
        setAttendanceMessage(`✅ Attendance recorded for ${userName} in ${classInfo.name}`);
        
        // Clear message after 5 seconds
        setTimeout(() => setAttendanceMessage(''), 5000);
      } else {
        const errorText = await response.text();
        console.error('❌ Attendance logging failed:', errorText);
        setAttendanceMessage(`❌ Failed to record attendance: ${errorText}`);
        setTimeout(() => setAttendanceMessage(''), 5000);
      }
    } catch (error) {
      console.error('💥 Attendance logging error:', error);
      setAttendanceMessage(`❌ Error recording attendance: ${error.message}`);
      setTimeout(() => setAttendanceMessage(''), 5000);
    }
  };

  // Process video frame for face recognition
  const processFrame = async () => {
    try {
      console.log('🎥 Starting frame processing...');
      setRecognitionStatus('recognizing');
      
      // Capture current frame
      console.log('📸 Capturing video frame...');
      const imageBlob = await captureFrame();
      if (!imageBlob) {
        throw new Error('Failed to capture frame');
      }
      console.log('✅ Frame captured successfully, size:', imageBlob.size, 'bytes');

      // Upload to S3
      console.log('📤 Starting S3 upload...');
      const objectKey = await uploadImageToS3(imageBlob);
      console.log('✅ S3 upload completed, object key:', objectKey);
      
      // Search for face
      console.log('🔍 Starting face recognition...');
      const result = await searchFace(objectKey);
      
      if (result && result.Item) {
        console.log('🎉 Face recognized successfully!');
        console.log('👤 Recognized user:', result.Item);
        setRecognitionStatus('recognized');
        setRecognizedUser({
          ...result.Item,
          confidence: result.confidence,
          faceId: result.faceId
        });

        // Log attendance if class is selected
        if (selectedClass) {
          const userName = result.Item.Name || 
                          `${result.Item.FirstName || ''} ${result.Item.LastName || ''}`.trim() ||
                          result.Item.username ||
                          'Unknown User';
          
          await logAttendance(result.Item.userID, userName);
        }
      } else {
        console.log('❌ Face not recognized');
        setRecognitionStatus('not-found');
        setRecognizedUser(null);
      }
    } catch (error) {
      console.error('💥 Frame processing failed:', error);
      console.error('🔍 Processing error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setError('Face recognition failed: ' + error.message);
      setRecognitionStatus('idle');
    }
  };

  const startRecognition = () => {
    if (!selectedClass) {
      setError('Please select a class/organization before starting face recognition');
      return;
    }

    console.log('🚀 Starting face recognition system...');
    console.log('📚 Selected class:', selectedClass);
    setIsRecognitionActive(true);
    setRecognitionStatus('recognizing');
    setError(null);
    setAttendanceMessage('');
    
    // Process frame immediately
    console.log('⚡ Processing initial frame...');
    processFrame();
    
    // Set up interval to process frames every 3 seconds
    console.log('⏰ Setting up recognition interval (3 seconds)...');
    const interval = setInterval(() => {
      console.log('🔄 Interval triggered - processing new frame...');
      processFrame();
    }, 3000);
    setCaptureInterval(interval);
  };

  const stopRecognition = () => {
    console.log('🛑 Stopping face recognition system...');
    setIsRecognitionActive(false);
    setRecognitionStatus('idle');
    setRecognizedUser(null);
    setAttendanceMessage('');
    
    if (captureInterval) {
      console.log('⏰ Clearing recognition interval...');
      clearInterval(captureInterval);
      setCaptureInterval(null);
    }
    console.log('✅ Recognition system stopped');
  };

  const getStatusText = () => {
    switch (recognitionStatus) {
      case 'recognizing':
        return '🔍 Scanning for faces...';
      case 'recognized':
        // Handle different possible name field formats
        const displayName = recognizedUser?.Name || 
                           `${recognizedUser?.FirstName || ''} ${recognizedUser?.LastName || ''}`.trim() ||
                           recognizedUser?.username ||
                           'Unknown User';
        return `✓ Recognized: ${displayName}`;
      case 'not-found':
        return '❌ Face not recognized';
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
      case 'not-found':
        return 'status-not-found';
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
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
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
                <h3 className="camera-modal-title">Live Face Recognition</h3>
                <div className="camera-status-badge">
                  <span className="camera-status-dot"></span>
                  {isRecognitionActive ? 'Scanning' : 'Ready'}
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

            {/* Class Selection and Attendance Controls */}
            <div className="camera-controls-section">
              <div className="class-selection-container">
                <label htmlFor="class-select" className="class-selection-label">
                  Select Organization:
                </label>
                <select
                  id="class-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="class-selection-dropdown"
                  disabled={isRecognitionActive || organizationsLoading}
                >
                  <option value="">
                    {organizationsLoading ? 'Loading organizations...' : 'Choose an organization...'}
                  </option>
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.type})
                      {cls.userEnrolled ? ' - Enrolled' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Attendance Status Message */}
              {attendanceMessage && (
                <div className={`attendance-message ${attendanceMessage.includes('✅') ? 'success' : 'error'}`}>
                  {attendanceMessage}
                </div>
              )}
            </div>
            
            <div className="camera-video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
              
              {/* Recognition overlay */}
              {recognitionStatus === 'recognized' && recognizedUser && (
                <div className="recognition-overlay">
                  <div className="recognition-card">
                    <h4>Welcome Back!</h4>
                    <p><strong>Name:</strong> {recognizedUser.Name || `${recognizedUser.FirstName || ''} ${recognizedUser.LastName || ''}`.trim() || 'Unknown'}</p>
                    {recognizedUser.Email && <p><strong>Email:</strong> {recognizedUser.Email}</p>}
                    {recognizedUser.RoleID && <p><strong>Role:</strong> {recognizedUser.RoleID}</p>}
                    {recognizedUser.username && <p><strong>Username:</strong> {recognizedUser.username}</p>}
                  </div>
                </div>
              )}
              
              {/* Top right controls */}
              <div className="camera-video-overlay">
                <div className="camera-video-controls">
                  <button 
                    className="camera-control-button"
                    onClick={processFrame}
                    disabled={isRecognitionActive}
                    aria-label="Manual scan">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
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
                  {isRecognitionActive ? 'Active' : 'Start Scan'}
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
