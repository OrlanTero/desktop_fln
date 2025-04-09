require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

// Configuration
const PORT = process.env.SOCKET_PORT || 3001;
const API_URL = process.env.API_URL || 'http://localhost:4005'; // Default API URL

// Initialize Express app and HTTP server
const app = express();
app.use(cors());
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // In production, specify your allowed origins
    methods: ['GET', 'POST'],
  },
});

// Track connected users
const connectedUsers = new Map();

// Helper function to save notification to database
async function saveNotificationToDatabase(notification) {
  try {
    // Format notification data for the API
    const notificationData = {
      user_id: notification.targetUserId,
      sender_id: notification.notification.sender || null,
      title: notification.notification.title || 'New Notification',
      message: notification.notification.message || notification.notification.content,
      type: notification.notification.type || 'general',
      reference_type: notification.notification.reference_type || null,
      reference_id: notification.notification.reference_id || null,
      is_read: 0,
      severity: notification.notification.severity || 'info',
      icon: notification.notification.icon || null,
      source_device: notification.notification.senderDevice || 'system',
    };

    // Send notification data to API
    const response = await axios.post(`${API_URL}/notifications`, notificationData);

    if (response.data && response.data.status === 'success') {
      console.log(`Notification saved to database with ID: ${response.data.data.id}`);
      return response.data.data.id;
    } else {
      console.error('Failed to save notification to database:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error saving notification to database:', error.message);
    return null;
  }
}

// Socket.io connection handling
io.on('connection', socket => {
  console.log(`User connected: ${socket.id}`);

  // Register user with device type (desktop or mobile)
  socket.on('register', data => {
    const { userId, deviceType } = data;
    if (userId) {
      connectedUsers.set(socket.id, { userId, deviceType });
      console.log(`User ${userId} registered as ${deviceType}`);

      // Join a room specific to this user
      socket.join(`user-${userId}`);

      // Notify this user's other devices
      socket.to(`user-${userId}`).emit('user_connected', { deviceType });
    }
  });

  // Handle notifications
  socket.on('send_notification', async data => {
    const { targetUserId, notification } = data;
    if (targetUserId) {
      // Save notification to database
      const notificationId = await saveNotificationToDatabase(data);

      if (notificationId) {
        // Add notification ID to the notification object
        notification.id = notificationId;
      }

      // Send to all devices of the target user
      io.to(`user-${targetUserId}`).emit('receive_notification', notification);
      console.log(`Notification sent to user ${targetUserId}:`, notification);
    }
  });

  // Handle direct messaging between devices
  socket.on('send_message', async data => {
    const { targetUserId, message } = data;
    if (targetUserId) {
      // For messages, we can optionally create a notification as well
      if (message.createNotification) {
        const notificationData = {
          targetUserId,
          notification: {
            title: message.title || 'New Message',
            message: message.content,
            type: 'message',
            reference_type: 'message',
            reference_id: message.id,
            sender: message.sender,
            senderDevice: message.senderDevice,
            severity: 'info',
          },
        };

        await saveNotificationToDatabase(notificationData);
      }

      io.to(`user-${targetUserId}`).emit('receive_message', message);
      console.log(`Message sent to user ${targetUserId}`);
    }
  });

  // Handle data synchronization between devices
  socket.on('sync_data', data => {
    const { targetUserId, syncData } = data;
    if (targetUserId) {
      io.to(`user-${targetUserId}`).emit('data_sync', syncData);
      console.log(`Data sync initiated for user ${targetUserId}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    if (userData) {
      const { userId, deviceType } = userData;

      // Notify other devices of this user
      socket.to(`user-${userId}`).emit('user_disconnected', { deviceType });

      console.log(`User ${userId} (${deviceType}) disconnected`);
      connectedUsers.delete(socket.id);
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', connections: connectedUsers.size });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
