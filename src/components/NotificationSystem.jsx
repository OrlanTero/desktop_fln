import React, { useEffect, useState } from 'react';
import {
  Snackbar,
  Alert,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import socketService from '../utils/socketService';
import axios from 'axios';

// API configuration - adjust based on your environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4005';

const NotificationSystem = ({ userId, apiUrl = API_URL }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationToShow, setNotificationToShow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const open = Boolean(anchorEl);

  // Function to fetch notifications from the API
  const fetchNotifications = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiUrl}/users/${userId}/notifications`);

      if (response.data && response.data.status === 'success') {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.total_unread || 0);
      } else {
        console.error('Failed to fetch notifications:', response.data);
        setError('Failed to load notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await axios.put(`${apiUrl}/users/${userId}/notifications/read-all`);
      setUnreadCount(0);

      // Update the read status in the local notifications list
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Mark a single notification as read
  const markAsRead = async notificationId => {
    try {
      await axios.put(`${apiUrl}/notifications/${notificationId}/read`);

      // Update the read status in the local notifications list
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    // Initialize socket connection when component mounts and userId is available
    if (userId) {
      socketService.init(userId);

      // Fetch notifications from API
      fetchNotifications();

      // Add event listener for receiving notifications
      socketService.addEventListener('notification', handleNewNotification);

      // Refresh notifications periodically (every minute)
      const intervalId = setInterval(fetchNotifications, 60000);

      // Clean up function
      return () => {
        socketService.removeEventListener('notification', handleNewNotification);
        clearInterval(intervalId);
      };
    }
  }, [userId, apiUrl]);

  // Handle new notifications from socket
  const handleNewNotification = notification => {
    setNotifications(prev => {
      // Add new notification to the beginning of the array
      const updated = [notification, ...prev];
      // Only keep the latest 50 notifications
      return updated.slice(0, 50);
    });

    setUnreadCount(prev => prev + 1);

    // Show the notification as a snackbar if it's not from our own device
    if (notification.source_device !== 'desktop' && notification.senderDevice !== 'desktop') {
      setNotificationToShow(notification);
    }
  };

  // Handle menu open
  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget);
    // Mark all as read when menu is opened
    markAllAsRead();
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setNotificationToShow(null);
  };

  // Handle notification click
  const handleNotificationClick = notification => {
    // If the notification isn't already marked as read, mark it as read
    if (notification.id && !notification.is_read) {
      markAsRead(notification.id);
    }

    // Close the menu
    handleMenuClose();

    // Here you could navigate to the relevant page based on notification type
    // For example:
    // if (notification.reference_type === 'message') {
    //   navigate(`/messages/${notification.reference_id}`);
    // }
  };

  // Format notification time
  const formatTime = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <IconButton
        size="large"
        color="inherit"
        onClick={handleMenuOpen}
        aria-label="notifications"
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'notifications-button',
        }}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '350px',
          },
        }}
      >
        <Typography variant="h6" style={{ padding: '8px 16px' }}>
          Notifications
        </Typography>
        <Divider />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Typography color="error" style={{ padding: '20px', textAlign: 'center' }}>
            {error}
          </Typography>
        ) : notifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          <List sx={{ width: '100%', maxWidth: 360, padding: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id || index}>
                <ListItem
                  alignItems="flex-start"
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: !notification.is_read ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  }}
                >
                  <ListItemText
                    primary={notification.title || 'New Notification'}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block' }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary">
                          {formatTime(notification.created_at || notification.timestamp)} •
                          {notification.source_device === 'mobile' ||
                          notification.senderDevice === 'mobile'
                            ? ' From Mobile'
                            : ' From System'}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>

      {/* Snackbar for displaying new notifications */}
      <Snackbar
        open={!!notificationToShow}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notificationToShow && (
          <Alert
            onClose={handleSnackbarClose}
            severity={notificationToShow.severity || 'info'}
            sx={{ width: '100%' }}
          >
            <Typography variant="subtitle1">
              {notificationToShow.title || 'New Notification'}
            </Typography>
            <Typography variant="body2">
              {notificationToShow.message || notificationToShow.content}
            </Typography>
          </Alert>
        )}
      </Snackbar>
    </>
  );
};

export default NotificationSystem;
