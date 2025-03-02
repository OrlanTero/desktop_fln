import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  AccountCircle,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const users = await window.api.user.getAll();
        if (users.success) {
          const userData = users.data;
          setStats({
            totalUsers: userData.length,
            activeUsers: userData.filter(u => u.role !== 'inactive').length,
            adminUsers: userData.filter(u => u.role === 'admin').length,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
    navigate('/login');
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  // User profile menu in the top right
  const userMenu = (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ mr: 2 }}>
        {user?.name || 'User'}
      </Typography>
      <Avatar
        onClick={handleMenu}
        sx={{ cursor: 'pointer' }}
        src={user?.photo_url}
        alt={user?.name || 'User'}
      >
        {!user?.photo_url && <AccountCircle />}
      </Avatar>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Layout title="Dashboard" userMenu={userMenu}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'primary.light',
                color: 'white',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                {stats.totalUsers}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'success.light',
                color: 'white',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                {stats.activeUsers}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'warning.light',
                color: 'white',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Admin Users
              </Typography>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                {stats.adminUsers}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">User Management</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Manage users, add new users, update user information, or remove users from the system.
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button 
                  size="small" 
                  color="primary" 
                  onClick={() => navigateTo('/users')}
                >
                  Go to Users
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DashboardIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Dashboard</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  View system statistics, recent activities, and important metrics.
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button 
                  size="small" 
                  color="primary" 
                  onClick={() => navigateTo('/dashboard')}
                >
                  Refresh Dashboard
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SettingsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Settings</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Configure application settings, manage preferences, and customize your experience.
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button 
                  size="small" 
                  color="primary" 
                  onClick={() => navigateTo('/settings')}
                >
                  Go to Settings
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;