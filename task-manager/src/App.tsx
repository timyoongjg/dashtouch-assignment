import React, { useState, useEffect } from 'react';
import TaskList from './features/tasks/components/TaskList';
import Dashboard from './features/tasks/components/Dashboard';
import './index.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Check for user's preferred color scheme
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Apply theme class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleDashboard = () => {
    setShowDashboard(!showDashboard);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`} style={appStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1>Task Management App</h1>
          <span style={badgeStyle}>Enhanced</span>
        </div>
        
        <div style={headerControlsStyle}>
          <button
            onClick={toggleDashboard}
            style={dashboardButtonStyle}
            title={showDashboard ? "Hide Dashboard" : "Show Dashboard"}
          >
            {showDashboard ? "Hide Dashboard" : "Show Dashboard"}
          </button>
          
          <button
            onClick={toggleTheme}
            style={themeToggleStyle}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>
      
      <main style={mainStyle}>
        {showDashboard && <Dashboard />}
        <TaskList />
      </main>
      
      <footer style={footerStyle}>
        <p>Task Management App - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

const appStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
  boxSizing: 'border-box' as const,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column' as const
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  marginBottom: '30px',
  flexWrap: 'wrap' as const,
  gap: '15px'
};

const headerControlsStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center'
};

const badgeStyle = {
  backgroundColor: '#4c9aff',
  color: 'white',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  padding: '3px 8px',
  borderRadius: '12px',
  marginLeft: '10px'
};

const dashboardButtonStyle = {
  backgroundColor: '#9c59b6',
  color: 'white',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};

const themeToggleStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '5px',
  borderRadius: '50%',
  width: '36px',
  height: '36px'
};

const mainStyle = {
  backgroundColor: 'var(--bg-primary)',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  flex: '1 0 auto'
};

const footerStyle = {
  marginTop: '30px',
  textAlign: 'center' as const,
  padding: '20px 0',
  color: 'var(--text-secondary)',
  fontSize: '14px'
};

export default App; 