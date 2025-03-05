import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Clients from './pages/Clients';
import ClientTypes from './pages/ClientTypes';
import ServiceCategories from './pages/ServiceCategories';
import Services from './pages/Services';
import Settings from './pages/Settings';
import Proposals from './pages/Proposals';
import ProposalForm from './pages/ProposalForm';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import ProjectView from './pages/ProjectView';

// Import components
import SplashScreen from './components/SplashScreen';

// Create theme with FLN colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#264888', // FLN blue
      light: '#5673b9',
      dark: '#002159',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#842624', // FLN red
      light: '#b7524f',
      dark: '#530000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          boxShadow: '0 2px 4px rgba(38, 72, 136, 0.3)',
        },
        containedSecondary: {
          boxShadow: '0 2px 4px rgba(132, 38, 36, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Log the current location for debugging
  useEffect(() => {
    console.log('Current location:', location.pathname);
  }, [location]);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
          path="/dashboard" 
          element={
            isAuthenticated ? 
              <Dashboard user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/users" 
          element={
            isAuthenticated ? 
              <Users user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/clients" 
          element={
            isAuthenticated ? 
              <Clients user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/client-types" 
          element={
            isAuthenticated ? 
              <ClientTypes user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/service-categories" 
          element={
            isAuthenticated ? 
              <ServiceCategories user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/services" 
          element={
            isAuthenticated ? 
              <Services user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        {/* Proposals Routes */}
        <Route 
          path="/proposals" 
          element={
            isAuthenticated ? 
              <Proposals user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/proposals/new" 
          element={
            isAuthenticated ? 
              <ProposalForm user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/proposals/edit/:id" 
          element={
            isAuthenticated ? 
              <ProposalForm user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        {/* Projects Routes */}
        <Route 
          path="/projects" 
          element={
            isAuthenticated ? 
              <Projects user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/projects/new" 
          element={
            isAuthenticated ? 
              <ProjectForm user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/projects/edit/:id" 
          element={
            isAuthenticated ? 
              <ProjectForm user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/projects/view/:id" 
          element={
            isAuthenticated ? 
              <ProjectView user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/settings" 
          element={
            isAuthenticated ? 
              <Settings user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        <Route 
          path="/main_window" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        <Route 
          path="/main_window/*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App; 