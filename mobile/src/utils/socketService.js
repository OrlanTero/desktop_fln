import { io } from 'socket.io-client';
import apiClient from '../services/api/apiConfig';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    this.listeners = new Map();
    this.deviceType = 'mobile';
    this.socketUrl = apiClient.defaults.serverUrl;
  }

  /**
   * Initialize socket connection
   * @param {string} userId - User identifier
   * @param {string} serverUrl - Optional server URL override
   */
  init(userId, serverUrl = null) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    this.userId = userId;

    if (serverUrl) {
      this.socketUrl = serverUrl;
    }

    this.socket = io(this.socketUrl);

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;

      // Register with the socket server
      this.socket.emit('register', { userId, deviceType: this.deviceType });
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', error => {
      console.error('Socket connection error:', error);
    });

    // Set up default listeners
    this.setupDefaultListeners();
  }

  /**
   * Set up default event listeners
   */
  setupDefaultListeners() {
    // Listen for notifications
    this.socket.on('receive_notification', notification => {
      console.log('Notification received:', notification);
      // Dispatch event for UI components to handle
      this.dispatchEvent('notification', notification);
    });

    // Listen for messages from desktop
    this.socket.on('receive_message', message => {
      console.log('Message received:', message);
      this.dispatchEvent('message', message);
    });

    // Listen for data sync requests
    this.socket.on('data_sync', data => {
      console.log('Data sync request received:', data);
      this.dispatchEvent('sync', data);
    });

    // Listen for user connection events
    this.socket.on('user_connected', data => {
      console.log(`User connected on ${data.deviceType}`);
      this.dispatchEvent('user_connected', data);
    });

    this.socket.on('user_disconnected', data => {
      console.log(`User disconnected from ${data.deviceType}`);
      this.dispatchEvent('user_disconnected', data);
    });
  }

  /**
   * Send a notification to a specific user
   * @param {string} targetUserId - User ID to send notification to
   * @param {object} notification - Notification data
   */
  sendNotification(targetUserId, notification) {
    if (!this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('send_notification', {
      targetUserId,
      notification: {
        ...notification,
        sender: this.userId,
        senderDevice: this.deviceType,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send a message to a specific user
   * @param {string} targetUserId - User ID to send message to
   * @param {object} message - Message data
   */
  sendMessage(targetUserId, message) {
    if (!this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('send_message', {
      targetUserId,
      message: {
        ...message,
        sender: this.userId,
        senderDevice: this.deviceType,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Initiate data sync with other devices
   * @param {string} targetUserId - User ID to sync with
   * @param {object} data - Data to sync
   */
  syncData(targetUserId, data) {
    if (!this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('sync_data', {
      targetUserId,
      syncData: {
        ...data,
        sender: this.userId,
        senderDevice: this.deviceType,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Add event listener for socket events
   * @param {string} eventName - Event name
   * @param {function} callback - Callback function
   */
  addEventListener(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
    return () => this.removeEventListener(eventName, callback);
  }

  /**
   * Remove event listener
   * @param {string} eventName - Event name
   * @param {function} callback - Callback function to remove
   */
  removeEventListener(eventName, callback) {
    if (!this.listeners.has(eventName)) return;

    const callbacks = this.listeners.get(eventName);
    const index = callbacks.indexOf(callback);

    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Dispatch event to listeners
   * @param {string} eventName - Event name
   * @param {any} data - Event data
   */
  dispatchEvent(eventName, data) {
    if (!this.listeners.has(eventName)) return;

    this.listeners.get(eventName).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${eventName} event handler:`, error);
      }
    });
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.socket = null;
      this.listeners.clear();
      console.log('Socket disconnected');
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
