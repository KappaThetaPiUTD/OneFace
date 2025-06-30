import { useState, useEffect, useRef } from "react";
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import "../styles/Settings.css";
import SettingsIcons from "../components/SettingsIcons";
import FaceprintStatus from "../components/FaceprintStatus";

export default function Settings() {
  const [tab, setTab] = useState("Profile");
  const [prevTab, setPrevTab] = useState(""); // Track previous tab for animation direction
  const tabs = ["Profile", "Permissions", "Camera", "Billing", "Security", "Notifications", "Integrations"];
  const [isEditing, setIsEditing] = useState(false);
  
  // User profile state from database
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Editable fields state
  const [phone, setPhone] = useState("");
  const [preferredName, setPreferredName] = useState("");
  
  // Profile image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("/images/aashay.png");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  
  const [systemThemeIsDark, setSystemThemeIsDark] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  // Refs for animation
  const contentRef = useRef(null);
  const tabsRef = useRef([]);

  // Initialize theme state from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  
  // Initialize colorBlindMode from localStorage or default to false
  const [colorBlindMode, setColorBlindMode] = useState(() => {
    const savedMode = localStorage.getItem('colorBlindMode');
    return savedMode === 'true';
  });
  
  // For demo purposes: toggle between different faceprint statuses
  const [faceprintStatusExample, setFaceprintStatusExample] = useState("current-user"); // not registered
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setSystemThemeIsDark(mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Apply theme to document
  useEffect(() => {
    // If theme is system, use the system preference
    const effectiveTheme = theme === 'system' 
      ? (systemThemeIsDark ? 'dark' : 'light')
      : theme;
      
    document.body.setAttribute('data-theme', effectiveTheme);
    document.body.classList.toggle('color-blind-mode', colorBlindMode);
    
    // Add a special attribute to track that system theme is being used
    if (theme === 'system') {
      document.body.setAttribute('data-using-system-theme', 'true');
    } else {
      document.body.removeAttribute('data-using-system-theme');
    }
  }, [theme, colorBlindMode, systemThemeIsDark]);
  
  // Handle tab changes with animation
  const handleTabChange = (newTab) => {
    setPrevTab(tab);
    setTab(newTab);
    
    // Apply animation to content
    if (contentRef.current) {
      contentRef.current.classList.remove('slide-left', 'slide-right');
      
      // Determine animation direction based on tab position
      const currentTabIndex = tabs.indexOf(tab);
      const newTabIndex = tabs.indexOf(newTab);
      
      // Force a reflow before adding the new animation class
      void contentRef.current.offsetWidth;
      
      if (newTabIndex > currentTabIndex) {
        contentRef.current.classList.add('slide-left');
      } else {
        contentRef.current.classList.add('slide-right');
      }
    }
  };
  
  // Animation for tabs on initial load
  useEffect(() => {
    tabsRef.current.forEach((tabRef, idx) => {
      if (tabRef) {
        setTimeout(() => {
          tabRef.classList.add('fade-in');
        }, idx * 60);
      }
    });
    
    if (contentRef.current) {
      contentRef.current.classList.add('fade-in');
    }
    
    // Initial animation for staggered items
    const staggeredItems = document.querySelectorAll('.settings-section');
    staggeredItems.forEach((item, idx) => {
      setTimeout(() => {
        item.classList.add('slide-up');
      }, 200 + (idx * 100));
    });
  }, []);
  
  // Theme toggle handler
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Toggle color blind mode
  const toggleColorBlindMode = () => {
    setColorBlindMode(!colorBlindMode);
    localStorage.setItem('colorBlindMode', String(!colorBlindMode));
  };
  
  // Animation for edit mode toggle
  const toggleEditing = () => {
    setIsEditing(!isEditing);
    
    setTimeout(() => {
      const inputs = document.querySelectorAll('.setting-row.editable input');
      inputs.forEach((input, idx) => {
        if (input) {
          input.classList.add('fade-in');
        }
      });
    }, 50);
  };

  // Profile image upload handler with better debugging
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a JPEG, PNG, or WebP image file.');
      setTimeout(() => setUploadError(''), 5000);
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB.');
      setTimeout(() => setUploadError(''), 5000);
      return;
    }

    setIsUploadingImage(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      // Get user email for the upload
      const userEmail = currentUser?.attributes?.email || 
                       currentUser?.email || 
                       currentUser?.signInDetails?.loginId;

      if (!userEmail) {
        throw new Error('User email not found. Please try logging in again.');
      }

      console.log('🖼️ Uploading profile image for user:', userEmail);
      console.log('📁 File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Create form data
      const formData = new FormData();
      formData.append('image', file);

      // Upload to your Lambda function
      const uploadUrl = `https://njs67kowh1.execute-api.us-east-2.amazonaws.com/Dev/upload-url?email=${encodeURIComponent(userEmail)}`;
      console.log('🔗 Upload URL:', uploadUrl);
      
      console.log('📤 Starting upload request...');
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

      console.log('📨 Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Image uploaded successfully:', result);
        
        // Update the profile image URL with cache busting
        if (result.data?.imageUrl) {
          const imageUrlWithCacheBust = `${result.data.imageUrl}?t=${Date.now()}`;
          console.log('🖼️ Setting new profile image URL:', imageUrlWithCacheBust);
          setProfileImageUrl(imageUrlWithCacheBust);
          
          // Test if the image is accessible
          const testImage = new Image();
          testImage.onload = () => {
            console.log('✅ Image is accessible from S3');
          };
          testImage.onerror = () => {
            console.error('❌ Image not accessible from S3 URL:', imageUrlWithCacheBust);
            // Try the regional URL if available
            if (result.data?.regionalUrl) {
              const regionalUrlWithCache = `${result.data.regionalUrl}?t=${Date.now()}`;
              console.log('🔄 Trying regional URL:', regionalUrlWithCache);
              setProfileImageUrl(regionalUrlWithCache);
            }
          };
          testImage.src = imageUrlWithCacheBust;
        }
        
        setUploadSuccess('Profile image updated successfully!');
        setTimeout(() => setUploadSuccess(''), 5000);
      } else {
        const responseText = await response.text();
        console.error('❌ Upload failed response:', responseText);
        
        let errorMessage = 'Upload failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('💥 Upload error:', error);
      setUploadError(`Upload failed: ${error.message}`);
      setTimeout(() => setUploadError(''), 5000);
    } finally {
      setIsUploadingImage(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  // Trigger file input click
  const triggerImageUpload = () => {
    const fileInput = document.getElementById('profile-image-input');
    fileInput?.click();
  };

  // API base URL
  const API_BASE_URL = 'https://9g63csumjh.execute-api.us-east-2.amazonaws.com/dev';

  // Fetch current user from Cognito and get actual email
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        console.log('Current Cognito user:', user);
        
        // Fetch user attributes to get the actual email
        const attributes = await fetchUserAttributes();
        console.log('🔍 User attributes from Cognito:', attributes);
        console.log('📧 Actual email from attributes:', attributes.email);
        
        // Set the user with the fetched attributes
        setCurrentUser({
          ...user,
          attributes: attributes
        });
        
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Fetch user profile from database
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Get email from multiple possible locations in Cognito user
      const userEmail = currentUser?.attributes?.email || 
                       currentUser?.email || 
                       currentUser?.signInDetails?.loginId;
      
      if (!userEmail) {
        console.warn('⚠️ No email found for current user:', currentUser);
        setIsLoadingProfile(false);
        return;
      }
      
      setIsLoadingProfile(true);
      try {
        console.log('🔄 Fetching user profile for email:', userEmail);
        
        const url = `${API_BASE_URL}/user/profile?email=${encodeURIComponent(userEmail)}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ User profile fetched:', data);
          setUserProfile(data);
          
          // Set editable fields with existing data or defaults
          setPhone(data.Phone || "(555) 123-4567");
          setPreferredName(data.PreferredName || data.Name || "");
        } else {
          console.error('❌ Failed to fetch user profile:', response.status);
          const errorText = await response.text();
          console.error('Error details:', errorText);
          
          // Set default profile data if fetch fails
          setUserProfile({
            username: currentUser.username,
            Email: userEmail,
            Name: currentUser.attributes?.name || "Unknown User",
            RoleID: "Student",
            EnrollmentDate: new Date().toISOString(),
            FacePrintID: ""
          });
        }
      } catch (error) {
        console.error('💥 Error fetching user profile:', error);
        
        // Set default profile data if fetch fails
        setUserProfile({
          username: currentUser.username,
          Email: userEmail,
          Name: currentUser.attributes?.name || "Unknown User",
          RoleID: "Student",
          EnrollmentDate: new Date().toISOString(),
          FacePrintID: ""
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  return (
    <section className="settings-container theme-transition">
      <h1 className="settings-title">Account Settings</h1>
      
      <div className="settings-layout">
        {/* ---------- tab sidebar ---------- */}
        <div className="settings-sidebar theme-transition">
          {tabs.map((t, idx) => (
            <div
              key={t}
              ref={(el) => (tabsRef.current[idx] = el)}
              className={`settings-tab ${t === tab ? "active" : ""} theme-transition`}
              onClick={() => handleTabChange(t)}
            >
              <span className="tab-icon sidebar-icon-hover">{SettingsIcons[t]}</span>
              <span className="tab-text">{t}</span>
            </div>
          ))}
        </div>

        {/* ---------- tab content ---------- */}
        <div ref={contentRef} className="settings-content theme-transition">
          {tab === "Profile" && (
            <>
              <h2 className="content-title">Profile Settings</h2>
              <div className="settings-grid">
                {/* avatar + upload */}
                <div className="avatar-container">
                  <div className="avatar theme-transition">
                    <img 
                      src={profileImageUrl} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      onError={(e) => {
                        // Fallback to default image if S3 image fails to load
                        e.target.src = "/images/aashay.png";
                      }}
                    />
                    {isUploadingImage && (
                      <div className="upload-overlay">
                        <div className="upload-spinner"></div>
                      </div>
                    )}
                  </div>
                  <button 
                    className="btn avatar-btn btn-hover-effect" 
                    onClick={triggerImageUpload}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? 'Uploading...' : 'Change Avatar'}
                  </button>
                  <input 
                    type="file" 
                    id="profile-image-input"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  
                  {/* Upload status messages */}
                  {uploadError && (
                    <div className="upload-message error">
                      ❌ {uploadError}
                    </div>
                  )}
                  {uploadSuccess && (
                    <div className="upload-message success">
                      ✅ {uploadSuccess}
                    </div>
                  )}
                </div>

                {/* text details */}
                <div className="profile-details">
                  {isLoadingProfile ? (
                    <div className="loading-profile">
                      <h2>Loading Profile...</h2>
                      <div className="loading-spinner"></div>
                    </div>
                  ) : (
                    <>
                      <h2>{userProfile?.Name || "Unknown User"}</h2>
                      
                      <div className="settings-section theme-transition">
                        <div className="setting-row">
                          <div className="setting-label">Username:</div>
                          <div className="setting-value">{userProfile?.username || "N/A"}</div>
                        </div>
                        
                        <div className="setting-row">
                          <div className="setting-label">Email:</div>
                          <div className="setting-value">{userProfile?.Email || "No email provided"}</div>
                        </div>
                        
                        <div className="setting-row">
                          <div className="setting-label">Role:</div>
                          <div className="setting-value">{userProfile?.RoleID || "Student"}</div>
                        </div>
                        
                        <div className="setting-row">
                          <div className="setting-label">User ID:</div>
                          <div className="setting-value">{userProfile?.userID || "N/A"}</div>
                        </div>
                        
                        <div className="setting-row">
                          <div className="setting-label">Enrollment Date:</div>
                          <div className="setting-value">
                            {userProfile?.EnrollmentDate 
                              ? new Date(userProfile.EnrollmentDate).toLocaleDateString()
                              : "N/A"
                            }
                          </div>
                        </div>
                        
                        {userProfile?.FacePrintID && (
                          <div className="setting-row">
                            <div className="setting-label">Face Print Status:</div>
                            <div className="setting-value">
                              <span className="status-badge registered">Registered</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="settings-section theme-transition">
                        <h3 className="section-title">Personal Information</h3>
                        
                        <div className="setting-row editable">
                          <div className="setting-label">Phone:</div>
                          <div className="setting-value">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                className="theme-transition"
                                placeholder="Enter phone number"
                              />
                            ) : (
                              <div>{phone || "Not provided"}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="setting-row editable">
                          <div className="setting-label">Preferred Name:</div>
                          <div className="setting-value">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={preferredName} 
                                onChange={(e) => setPreferredName(e.target.value)} 
                                className="theme-transition"
                                placeholder="Enter preferred name"
                              />
                            ) : (
                              <div>{preferredName || userProfile?.Name || "Not set"}</div>
                            )}
                          </div>
                        </div>
                        
                        {isEditing ? (
                          <button 
                            className="save-btn btn-hover-effect" 
                            onClick={toggleEditing}
                          >
                            Save Changes
                          </button>
                        ) : (
                          <button 
                            className="edit-btn-large btn-hover-effect" 
                            onClick={toggleEditing}
                          >
                            Edit Information
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  
                  <div className="settings-section theme-transition">
                    <h3 className="section-title">Theme Preferences</h3>
                    <div className="setting-row">
                      <div className="setting-label">Theme Mode:</div>
                      <div className="setting-value theme-toggles">
                        <button 
                          className={`theme-btn ${theme === 'light' ? 'active' : ''} btn-hover-effect`}
                          onClick={() => handleThemeChange('light')}
                        >
                          Light
                        </button>
                        <button 
                          className={`theme-btn ${theme === 'dark' ? 'active' : ''} btn-hover-effect`}
                          onClick={() => handleThemeChange('dark')}
                        >
                          Dark
                        </button>
                        <button 
                          className={`theme-btn ${theme === 'system' ? 'active' : ''} btn-hover-effect`}
                          onClick={() => handleThemeChange('system')}
                        >
                          System
                        </button>
                      </div>
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-label">Color-blind Mode:</div>
                      <div className="setting-value">
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={colorBlindMode}
                            onChange={toggleColorBlindMode}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-label">Language:</div>
                      <div className="setting-value">
                        <select className="language-select theme-transition" defaultValue="en">
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Other tabs with animations */}
          {tab === "Security" && (
            <>
              <h2 className="content-title">Security Settings</h2>
              
              <div className="settings-section theme-transition">
                <h3 className="section-title">Account Security</h3>
                
                <div className="setting-row faceprint-status-row theme-transition">
                  <h4 className="sub-section-title">Facial Recognition</h4>
                  <div className="faceprint-demo-controls">
                    <button 
                      className={`demo-btn ${faceprintStatusExample === 'current-user' ? 'active' : ''}`}
                      onClick={() => setFaceprintStatusExample('current-user')}
                    >
                      Not Registered
                    </button>
                    <button 
                      className={`demo-btn ${faceprintStatusExample === 'pending-user' ? 'active' : ''}`}
                      onClick={() => setFaceprintStatusExample('pending-user')}
                    >
                      Pending
                    </button>
                    <button 
                      className={`demo-btn ${faceprintStatusExample === 'verified-user' ? 'active' : ''}`}
                      onClick={() => setFaceprintStatusExample('verified-user')}
                    >
                      Verified
                    </button>
                  </div>
                  <FaceprintStatus 
                    userID={faceprintStatusExample} 
                    onEnroll={() => {
                      console.log("Launching face enrollment flow");
                      // In a real app, this would launch your face enrollment process
                      setFaceprintStatusExample('pending-user');
                    }} 
                  />
                </div>
                
                <div className="setting-row action-row">
                  <div>
                    <div className="setting-label">Change Password</div>
                    <div className="setting-description">Update your account password</div>
                  </div>
                  <button className="secondary-btn btn-hover-effect">Change</button>
                </div>
                
                <div className="setting-row action-row">
                  <div>
                    <div className="setting-label">Two-Factor Authentication</div>
                    <div className="setting-description">Add an extra layer of security with TOTP or SMS verification</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="setting-row action-row">
                  <div>
                    <div className="setting-label">Device Sessions</div>
                    <div className="setting-description">View and log out from all active devices</div>
                  </div>
                  <button className="secondary-btn btn-hover-effect">Manage</button>
                </div>
                
                <div className="setting-row action-row danger">
                  <div>
                    <div className="setting-label">Delete Account</div>
                    <div className="setting-description">Permanently delete your account and all data (GDPR-compliant)</div>
                  </div>
                  <button className="danger-btn btn-hover-effect">Delete</button>
                </div>
              </div>
            </>
          )}
          
          {/* Apply animation classes to other tabs too */}
          {tab === "Notifications" && (
            <>
              <h2 className="content-title">Notifications Settings</h2>
              
              <div className="settings-section theme-transition">
                <h3 className="section-title">Notification Preferences</h3>
                
                <div className="setting-row action-row">
                  <div>
                    <div className="setting-label">Low Attendance Alerts</div>
                    <div className="setting-description">Receive notifications when your attendance falls below 80%</div>
                  </div>
                  <div className="notification-options">
                    <label className="checkbox-label">
                      <input type="checkbox" checked /> Email
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" /> SMS
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked /> Push
                    </label>
                  </div>
                </div>
                
                <div className="setting-row action-row">
                  <div>
                    <div className="setting-label">Class Cancellations</div>
                    <div className="setting-description">Get notified when classes are cancelled</div>
                  </div>
                  <div className="notification-options">
                    <label className="checkbox-label">
                      <input type="checkbox" checked /> Email
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked /> SMS
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked /> Push
                    </label>
                  </div>
                </div>
                
                <div className="setting-row action-row">
                  <div>
                    <div className="setting-label">Quiz Reminders</div>
                    <div className="setting-description">Receive reminders about upcoming quizzes</div>
                  </div>
                  <div className="notification-options">
                    <label className="checkbox-label">
                      <input type="checkbox" checked /> Email
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" /> SMS
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked /> Push
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Similar animation classes for other tabs */}
          {tab === "Integrations" && (
            <>
              <h2 className="content-title">Integrations</h2>
              
              <div className="settings-section">
                <div className="setting-row action-row">
                  <div>
                    <div className="setting-label">Google Calendar</div>
                    <div className="setting-description">Auto-push class schedule and attendance events</div>
                  </div>
                  <button className="secondary-btn">Connect</button>
                </div>
                
                <div className="setting-row action-row">
                  <div>
                    <div className="setting-label">Microsoft 365</div>
                    <div className="setting-description">Sync with your Microsoft account</div>
                  </div>
                  <button className="secondary-btn">Connect</button>
                </div>
                
                <div className="setting-row action-row">
                  <div>
                    <div className="setting-label">GitHub</div>
                    <div className="setting-description">Link your GitHub account</div>
                  </div>
                  <button className="secondary-btn">Connect</button>
                </div>
              </div>
            </>
          )}
          
          {(tab === "Permissions" || tab === "Camera" || tab === "Billing") && (
            <div className="placeholder-content">
              <h2 className="content-title">{tab} Settings</h2>
              <p>This section is coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
