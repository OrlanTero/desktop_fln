import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Badge } from 'react-native-safe-area-context';
import socketService from '../utils/socketService';
import axios from 'axios';

const API_URL = 'http://192.168.1.100:4005'; // Change this to your API URL

const NotificationItem = ({ notification, onPress }) => {
  const formatTime = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity style={styles.notificationItem} onPress={() => onPress(notification)}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title || 'New Notification'}</Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>
          {formatTime(notification.created_at || notification.timestamp)} •
          {notification.source_device === 'desktop' ? ' From Desktop' : ' From System'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const NotificationSystem = ({ userId, socketUrl, apiUrl = API_URL, onNotificationPress }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      // Initialize the socket
      socketService.init(userId, socketUrl);

      // Fetch notifications from API
      fetchNotifications();

      // Set up socket listener for new notifications
      const removeListener = socketService.addEventListener('notification', handleNewNotification);

      // Refresh notifications periodically (every minute)
      const intervalId = setInterval(fetchNotifications, 60000);

      // Clean up function
      return () => {
        removeListener();
        clearInterval(intervalId);
      };
    }
  }, [userId, socketUrl, apiUrl]);

  // Handle new notifications from socket
  const handleNewNotification = notification => {
    setNotifications(prev => {
      // Add new notification to the beginning of the array
      const updated = [notification, ...prev];
      // Only keep the latest 50 notifications
      return updated.slice(0, 50);
    });

    setUnreadCount(prev => prev + 1);
  };

  // Toggle notification panel visibility
  const toggleNotifications = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      // When opening the panel, mark all as read and reset unread count
      markAllAsRead();
    }
  };

  // Handle notification press
  const handleNotificationPress = notification => {
    setIsVisible(false);

    // If the notification isn't already marked as read, mark it as read
    if (notification.id && !notification.is_read) {
      markAsRead(notification.id);
    }

    if (onNotificationPress) {
      onNotificationPress(notification);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.notificationButton} onPress={toggleNotifications}>
        {unreadCount > 0 && (
          <Badge style={styles.badge} value={unreadCount > 99 ? '99+' : unreadCount} />
        )}
        <Text style={styles.notificationBtnText}>Notifications</Text>
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.notificationPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Notifications</Text>
            <TouchableOpacity onPress={toggleNotifications}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : notifications.length === 0 ? (
            <Text style={styles.emptyText}>No notifications</Text>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item, index) => item.id?.toString() || `notification-${index}`}
              renderItem={({ item }) => (
                <NotificationItem notification={item} onPress={handleNotificationPress} />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              refreshing={loading}
              onRefresh={fetchNotifications}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  notificationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtnText: {
    fontSize: 16,
    color: '#007AFF',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
  },
  notificationPanel: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 300,
    maxHeight: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 1000,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: '#888',
  },
  errorText: {
    padding: 20,
    textAlign: 'center',
    color: 'red',
  },
  loader: {
    padding: 20,
  },
  notificationItem: {
    padding: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  separator: {
    height: 1,
    backgroundColor: '#e1e1e1',
    marginLeft: 12,
  },
});

export default NotificationSystem;
