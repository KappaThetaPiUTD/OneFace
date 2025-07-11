import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import CameraPage from "./pages/CameraPage";
import "./App.css";
import "./styles/animations.css";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [systemThemeIsDark, setSystemThemeIsDark] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Check authentication status on app load
 useEffect(() => {
    const init = async () => {
      /* ----- FORCE A FRESH SESSION EVERY PAGE LOAD ----- */
      try {
        // If the browser still has a Cognito session, wipe it out
        await signOut();           // add  { global: true }  to sign out of every device
        localStorage.clear();      // (optional) nuke any custom tokens or userData you stored
      } catch (err) {
        // "not authenticated" also lands here – that’s fine
        console.info("No existing session to clear");
      }

      /* ----- NOW CHECK WHETHER A USER IS LOGGED IN (should be false) ----- */
      checkAuthStatus();
    };

    init();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setSystemThemeIsDark(mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize theme from localStorage when app first loads
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const colorBlindMode = localStorage.getItem('colorBlindMode') === 'true';
    
    // If theme is system, apply based on system preference
    const effectiveTheme = savedTheme === 'system' 
      ? (systemThemeIsDark ? 'dark' : 'light')
      : savedTheme;
    
    // Apply theme and color-blind mode
    document.body.setAttribute('data-theme', effectiveTheme);
    document.body.classList.toggle('color-blind-mode', colorBlindMode);
    
    // Add a special attribute to track that system theme is being used
    if (savedTheme === 'system') {
      document.body.setAttribute('data-using-system-theme', 'true');
    } else {
      document.body.removeAttribute('data-using-system-theme');
    }
  }, [systemThemeIsDark]);
  
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      // Use Cognito signOut
      await signOut();
      
      // Clear any stored data
      localStorage.removeItem("idToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if we're on the login page
  const isLoginPage = location.pathname === "/login";

  return (
    <div className={`app-shell ${isLoginPage ? 'login-mode' : ''}`}>
      {!isLoginPage && isAuthenticated && <Sidebar onLogout={handleLogout} />}
      <main className={`main ${isLoginPage ? 'login-main' : ''}`}>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <Dashboard /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/calendar" 
            element={
              isAuthenticated ? 
                <Calendar /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/settings" 
            element={
              isAuthenticated ? 
                <Settings /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/camera" 
            element={
              isAuthenticated ? 
                <CameraPage /> : 
                <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </main>
    </div>
  );
}