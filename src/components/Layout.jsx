import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  useTheme, 
  useMediaQuery,
  Paper,
  Breadcrumbs,
  Link,
  Fade
} from '@mui/material';
import { 
  Menu as MenuIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import FloatingMessenger from './FloatingMessenger';
import UserMenu from './UserMenu';
import { useAuth } from '../contexts/AuthContext';

// Drawer width
const drawerWidth = 280;

const Layout = ({ children, title, breadcrumbs }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();

  // Generate breadcrumbs from location if not provided
  const generateBreadcrumbs = () => {
    if (breadcrumbs) return breadcrumbs;
    
    const pathnames = location.pathname.split('/').filter(x => x);
    if (pathnames.length === 0) return null;
    
    return (
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          return last ? (
            <Typography key={to} color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              {value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')}
            </Typography>
          ) : (
            <Link underline="hover" color="inherit" href={to} key={to}>
              {value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(20px)',
          transition: 'box-shadow 0.3s ease-in-out',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div" fontWeight="bold">
              {title}
            </Typography>
          </Box>
          
          <UserMenu darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </Toolbar>
      </AppBar>

      {/* Navigation */}
      <Navigation
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        darkMode={darkMode}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          overflow: 'auto',
          bgcolor: (theme) => theme.palette.grey[50],
          transition: 'all 0.3s',
        }}
      >
        <Toolbar /> {/* This creates space for the AppBar */}
        
        <Fade in={true} timeout={500}>
          <Box sx={{ p: 3 }}>
            {/* Breadcrumbs */}
            {generateBreadcrumbs()}
            
            {/* Page Content */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                mb: 3
              }}
            >
              {children}
            </Paper>
          </Box>
        </Fade>
      </Box>

      {/* Floating Messenger */}
      <FloatingMessenger currentUser={currentUser} />
    </Box>
  );
};

export default Layout; 