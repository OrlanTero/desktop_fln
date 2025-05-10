import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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
import ProposalConversion from './pages/ProposalConversion';
import ProposalView from './pages/ProposalView';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import ProjectView from './pages/ProjectView';
import ProjectEdit from './pages/ProjectEdit';
import JobOrders from './pages/JobOrders';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Logs from './pages/Logs';
import Bin from './pages/Bin';
import Documents from './pages/Documents';

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
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.05),0px 1px 1px 0px rgba(0,0,0,0.03),0px 1px 3px 0px rgba(0,0,0,0.03)',
    '0px 3px 1px -2px rgba(0,0,0,0.05),0px 2px 2px 0px rgba(0,0,0,0.03),0px 1px 5px 0px rgba(0,0,0,0.03)',
    '0px 3px 3px -2px rgba(0,0,0,0.05),0px 3px 4px 0px rgba(0,0,0,0.03),0px 1px 8px 0px rgba(0,0,0,0.03)',
    '0px 2px 4px -1px rgba(0,0,0,0.05),0px 4px 5px 0px rgba(0,0,0,0.03),0px 1px 10px 0px rgba(0,0,0,0.03)',
    '0px 3px 5px -1px rgba(0,0,0,0.05),0px 5px 8px 0px rgba(0,0,0,0.03),0px 1px 14px 0px rgba(0,0,0,0.03)',
    '0px 3px 5px -1px rgba(0,0,0,0.05),0px 6px 10px 0px rgba(0,0,0,0.03),0px 1px 18px 0px rgba(0,0,0,0.03)',
    '0px 4px 5px -2px rgba(0,0,0,0.05),0px 7px 10px 1px rgba(0,0,0,0.03),0px 2px 16px 1px rgba(0,0,0,0.03)',
    '0px 5px 5px -3px rgba(0,0,0,0.05),0px 8px 10px 1px rgba(0,0,0,0.03),0px 3px 14px 2px rgba(0,0,0,0.03)',
    '0px 5px 6px -3px rgba(0,0,0,0.05),0px 9px 12px 1px rgba(0,0,0,0.03),0px 3px 16px 2px rgba(0,0,0,0.03)',
    '0px 6px 6px -3px rgba(0,0,0,0.05),0px 10px 14px 1px rgba(0,0,0,0.03),0px 4px 18px 3px rgba(0,0,0,0.03)',
    '0px 6px 7px -4px rgba(0,0,0,0.05),0px 11px 15px 1px rgba(0,0,0,0.03),0px 4px 20px 3px rgba(0,0,0,0.03)',
    '0px 7px 8px -4px rgba(0,0,0,0.05),0px 12px 17px 2px rgba(0,0,0,0.03),0px 5px 22px 4px rgba(0,0,0,0.03)',
    '0px 7px 8px -4px rgba(0,0,0,0.05),0px 13px 19px 2px rgba(0,0,0,0.03),0px 5px 24px 4px rgba(0,0,0,0.03)',
    '0px 7px 9px -4px rgba(0,0,0,0.05),0px 14px 21px 2px rgba(0,0,0,0.03),0px 5px 26px 4px rgba(0,0,0,0.03)',
    '0px 8px 9px -5px rgba(0,0,0,0.05),0px 15px 22px 2px rgba(0,0,0,0.03),0px 6px 28px 5px rgba(0,0,0,0.03)',
    '0px 8px 10px -5px rgba(0,0,0,0.05),0px 16px 24px 2px rgba(0,0,0,0.03),0px 6px 30px 5px rgba(0,0,0,0.03)',
    '0px 8px 11px -5px rgba(0,0,0,0.05),0px 17px 26px 2px rgba(0,0,0,0.03),0px 6px 32px 5px rgba(0,0,0,0.03)',
    '0px 9px 11px -5px rgba(0,0,0,0.05),0px 18px 28px 2px rgba(0,0,0,0.03),0px 7px 34px 6px rgba(0,0,0,0.03)',
    '0px 9px 12px -6px rgba(0,0,0,0.05),0px 19px 29px 2px rgba(0,0,0,0.03),0px 7px 36px 6px rgba(0,0,0,0.03)',
    '0px 10px 13px -6px rgba(0,0,0,0.05),0px 20px 31px 3px rgba(0,0,0,0.03),0px 8px 38px 7px rgba(0,0,0,0.03)',
    '0px 10px 13px -6px rgba(0,0,0,0.05),0px 21px 33px 3px rgba(0,0,0,0.03),0px 8px 40px 7px rgba(0,0,0,0.03)',
    '0px 10px 14px -6px rgba(0,0,0,0.05),0px 22px 35px 3px rgba(0,0,0,0.03),0px 8px 42px 7px rgba(0,0,0,0.03)',
    '0px 11px 14px -7px rgba(0,0,0,0.05),0px 23px 36px 3px rgba(0,0,0,0.03),0px 9px 44px 8px rgba(0,0,0,0.03)',
    '0px 11px 15px -7px rgba(0,0,0,0.05),0px 24px 38px 3px rgba(0,0,0,0.03),0px 9px 46px 8px rgba(0,0,0,0.03)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          boxShadow: '0 2px 4px rgba(38, 72, 136, 0.3)',
        },
        containedSecondary: {
          boxShadow: '0 2px 4px rgba(132, 38, 36, 0.3)',
        },
        outlined: {
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        },
        elevation2: {
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          borderColor: 'rgba(0, 0, 0, 0.06)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.01)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(38, 72, 136, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(38, 72, 136, 0.12)',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.12)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.24)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#264888',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
  },
});

const AppContent = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  // Log the current location for debugging
  useEffect(() => {
    console.log('Current location:', location.pathname);
  }, [location]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated() ? (
            <Dashboard user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/users"
        element={
          isAuthenticated() ? (
            <Users user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/clients"
        element={
          isAuthenticated() ? (
            <Clients user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/client-types"
        element={
          isAuthenticated() ? (
            <ClientTypes user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/service-categories"
        element={
          isAuthenticated() ? (
            <ServiceCategories user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/services"
        element={
          isAuthenticated() ? (
            <Services user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      {/* Proposals Routes */}
      <Route
        path="/proposals"
        element={
          isAuthenticated() ? (
            <Proposals user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/proposals/new"
        element={
          isAuthenticated() ? (
            <ProposalForm user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/proposals/edit/:id"
        element={
          isAuthenticated() ? (
            <ProposalForm user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/proposals/view/:id"
        element={
          isAuthenticated() ? (
            <ProposalView user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/proposal-conversion"
        element={
          isAuthenticated() ? (
            <ProposalConversion user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      {/* Projects Routes */}
      <Route
        path="/projects"
        element={
          isAuthenticated() ? (
            <Projects user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/projects/new"
        element={
          isAuthenticated() ? (
            <ProjectForm user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/projects/edit/:id"
        element={
          isAuthenticated() ? (
            <ProjectEdit user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/projects/view/:id"
        element={
          isAuthenticated() ? (
            <ProjectView user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isAuthenticated() ? (
            <Settings user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/job-orders"
        element={
          isAuthenticated() ? (
            <JobOrders user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/tasks"
        element={
          isAuthenticated() ? (
            <Tasks user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={isAuthenticated() ? <Profile /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/billing"
        element={
          isAuthenticated() ? (
            <Billing user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/reports"
        element={
          isAuthenticated() ? (
            <Reports user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/documents"
        element={
          isAuthenticated() ? (
            <Documents user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/logs"
        element={
          isAuthenticated() ? (
            <Logs user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/bin"
        element={
          isAuthenticated() ? (
            <Bin user={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />}
      />
      <Route
        path="/main_window"
        element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />}
      />
      <Route
        path="/main_window/*"
        element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
