import { useState, useEffect, useRef } from "react";
import "../styles/Settings.css";
import SettingsIcons from "../components/SettingsIcons";
import FaceprintStatus from "../components/FaceprintStatus";

export default function Settings() {
  const [tab, setTab] = useState("Profile");
  const [prevTab, setPrevTab] = useState(""); // Track previous tab for animation direction
  const tabs = ["Profile", "Permissions", "Camera", "Billing", "Security", "Notifications", "Integrations"];
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState("(555) 123-4567");
  const [preferredName, setPreferredName] = useState("Johnny");
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
                      src="/images/aashay.png" 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                  <button className="btn avatar-btn btn-hover-effect">
                    Change Avatar
                  </button>
                </div>

                {/* text details */}
                <div className="profile-details">
                  <h2>John Doe</h2>
                  
                  <div className="settings-section theme-transition">
                    <div className="setting-row">
                      <div className="setting-label">Email:</div>
                      <div className="setting-value">john.doe@utdallas.edu</div>
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-label">School:</div>
                      <div className="setting-value">University of Texas at Dallas</div>
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-label">Major:</div>
                      <div className="setting-value">Computer Science</div>
                    </div>
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
                          />
                        ) : (
                          <div>{phone}</div>
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
                          />
                        ) : (
                          <div>{preferredName}</div>
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
