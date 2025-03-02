import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  Snackbar,
  Avatar,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

// Tab Panel component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    theme: 'light',
    language: 'en',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [anchorEl, setAnchorEl] = useState(null);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle notification toggle changes
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [name]: checked,
      },
    });
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: 'Settings updated successfully!',
        severity: 'success',
      });
    }, 1000);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Handle menu open
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = () => {
    handleClose();
    logout();
  };

  // User profile menu in the top right
  const userMenu = (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ mr: 2 }}>
        {currentUser?.name || formData.name}
      </Typography>
      <Avatar
        onClick={handleMenu}
        sx={{ cursor: 'pointer' }}
        src={currentUser?.photo_url}
        alt={currentUser?.name || formData.name}
      >
        {!currentUser?.photo_url && <AccountCircle />}
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
    <Layout title="Settings" userMenu={userMenu}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences.
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="settings tabs"
        >
          <Tab
            icon={<PersonIcon />}
            label="Profile"
            id="settings-tab-0"
            aria-controls="settings-tabpanel-0"
          />
          <Tab
            icon={<SecurityIcon />}
            label="Security"
            id="settings-tab-1"
            aria-controls="settings-tabpanel-1"
          />
          <Tab
            icon={<NotificationsIcon />}
            label="Notifications"
            id="settings-tab-2"
            aria-controls="settings-tabpanel-2"
          />
          <Tab
            icon={<SettingsIcon />}
            label="System"
            id="settings-tab-3"
            aria-controls="settings-tabpanel-3"
          />
        </Tabs>
        <Divider />

        {/* Profile Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Profile Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Update your personal information.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={currentUser?.role || ''}
                onChange={handleInputChange}
                margin="normal"
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Photo URL"
                name="photoUrl"
                value={currentUser?.photo_url || ''}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Save Profile
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Update your password and security preferences.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type={showPassword.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleTogglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showPassword.current ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type={showPassword.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleTogglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPassword.new ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type={showPassword.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleTogglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPassword.confirm ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Update Password
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage your notification preferences.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications.email}
                    onChange={handleNotificationChange}
                    name="email"
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications.push}
                    onChange={handleNotificationChange}
                    name="push"
                    color="primary"
                  />
                }
                label="Push Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications.sms}
                    onChange={handleNotificationChange}
                    name="sms"
                    color="primary"
                  />
                }
                label="SMS Notifications"
              />
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Save Notification Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* System Settings */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure system preferences.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                margin="normal"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Theme"
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                margin="normal"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoUpdate}
                    onChange={handleInputChange}
                    name="autoUpdate"
                    color="primary"
                  />
                }
                label="Automatic Updates"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.dataBackup}
                    onChange={handleInputChange}
                    name="dataBackup"
                    color="primary"
                  />
                }
                label="Automatic Data Backup"
              />
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Save System Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Settings; 