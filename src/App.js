import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import "./App.css";
import "./styles/animations.css";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const [systemThemeIsDark, setSystemThemeIsDark] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

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
  
  // Check if we're on the login page
  const isLoginPage = location.pathname === "/login";
  
  // For demonstration purposes, simulate login after visiting /login
  useEffect(() => {
    if (location.pathname === "/login") {
      setIsAuthenticated(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className={`app-shell ${isLoginPage ? 'login-mode' : ''}`}>
      {!isLoginPage && <Sidebar onLogout={handleLogout} />}
      <main className={`main ${isLoginPage ? 'login-main' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
