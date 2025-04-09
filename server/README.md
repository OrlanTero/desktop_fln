# Socket.io Server for FLN Services Corporation

This server handles real-time communication between the FLN Services Corporation desktop and mobile applications.

## Features

- **Real-time notifications** between desktop and mobile applications
- **Device synchronization** across platforms
- **Message passing** between devices
- **User connection tracking**

## Installation

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file with the following content:
   ```
   SOCKET_PORT=3001
   NODE_ENV=development
   ```

3. Start the server:
   ```bash
   npm start
   ```

   For development with hot reloading:
   ```bash
   npm run dev
   ```

## API Endpoints

- **GET /health** - Check server status and see number of connected users

## Socket.io Events

### Client to Server Events

- **register** - Register a user with their device type
  ```javascript
  socket.emit('register', { userId: 'user123', deviceType: 'desktop|mobile' });
  ```

- **send_notification** - Send a notification to a specific user
  ```javascript
  socket.emit('send_notification', {
    targetUserId: 'user123',
    notification: {
      title: 'New Message',
      message: 'You have a new message from John Doe',
      severity: 'info' // 'success', 'info', 'warning', 'error'
    }
  });
  ```

- **send_message** - Send a direct message to a specific user
  ```javascript
  socket.emit('send_message', {
    targetUserId: 'user123',
    message: {
      type: 'chat',
      content: 'Hello there!'
    }
  });
  ```

- **sync_data** - Sync data between devices
  ```javascript
  socket.emit('sync_data', {
    targetUserId: 'user123',
    syncData: {
      type: 'settings',
      data: { theme: 'dark', notifications: true }
    }
  });
  ```

### Server to Client Events

- **receive_notification** - Receive a notification
  ```javascript
  socket.on('receive_notification', (notification) => {
    console.log('New notification:', notification);
  });
  ```

- **receive_message** - Receive a direct message
  ```javascript
  socket.on('receive_message', (message) => {
    console.log('New message:', message);
  });
  ```

- **data_sync** - Receive data sync request
  ```javascript
  socket.on('data_sync', (data) => {
    console.log('Data sync request:', data);
  });
  ```

- **user_connected** - User connected on another device
  ```javascript
  socket.on('user_connected', (data) => {
    console.log(`User connected on ${data.deviceType}`);
  });
  ```

- **user_disconnected** - User disconnected from another device
  ```javascript
  socket.on('user_disconnected', (data) => {
    console.log(`User disconnected from ${data.deviceType}`);
  });
  ```

## Integration

### Desktop Application

Add to your application:

```javascript
import socketService from '../utils/socketService';

// Initialize the socket connection with the current user's ID
socketService.init('userId');

// To send a notification to mobile
socketService.sendNotification('targetUserId', {
  title: 'New Update',
  message: 'A new update is available',
  severity: 'info'
});

// Listen for notifications from mobile
socketService.addEventListener('notification', (notification) => {
  console.log('Received notification:', notification);
});
```

### Mobile Application

Add to your application:

```javascript
import socketService from '../utils/socketService';

// Initialize with user ID and optionally override the socket server URL
socketService.init('userId', 'http://your-socket-server-ip:3001');

// To send a notification to desktop
socketService.sendNotification('targetUserId', {
  title: 'Mobile Alert',
  message: 'New message received on mobile',
  severity: 'info'
});

// Listen for notifications from desktop
const removeListener = socketService.addEventListener('notification', (notification) => {
  console.log('Received notification:', notification);
});

// Clean up when component unmounts
removeListener();
```

## Production Deployment

For production environments:

1. Update the `.env` file:
   ```
   SOCKET_PORT=3001
   NODE_ENV=production
   ```

2. Update CORS settings in `index.js` with specific allowed origins:
   ```javascript
   const io = new Server(server, {
     cors: {
       origin: ["https://your-desktop-app.com", "https://your-mobile-app.com"],
       methods: ["GET", "POST"]
     }
   });
   ```

3. Use a process manager like PM2 to keep the server running:
   ```bash
   npm install -g pm2
   pm2 start index.js --name "socket-server"
   ```

## Security Considerations

- In production, implement authentication middleware to validate socket connections
- Use HTTPS for secure communication
- Limit the allowed origins in CORS settings
- Implement rate limiting to prevent abuse 