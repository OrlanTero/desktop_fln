import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Navigation from './Navigation';
import FloatingMessenger from './FloatingMessenger';
import { useAuth } from '../contexts/AuthContext';
// Drawer width
const drawerWidth = 280;

const Layout = ({  children, title, userMenu }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser } = useAuth();


  useEffect(() => {
    console.log('User:', currentUser);
  }, [currentUser]);



  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: 1,
        }}
      >
        <Toolbar>
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {userMenu}
        </Toolbar>
      </AppBar>

      {/* Navigation */}
      <Navigation
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
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
          bgcolor: (theme) => theme.palette.grey[100],
        }}
      >
        <Toolbar /> {/* This creates space for the AppBar */}
        {children}
      </Box>

      {/* Floating Messenger */}
      <FloatingMessenger  currentUser={currentUser}/>
    </Box>
  );
};

export default Layout; 