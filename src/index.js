import { app, BrowserWindow, ipcMain, session, shell } from 'electron';
import path from 'path';

// Add global debugging
console.log('Main process starting up');

// Log all IPC events for debugging
ipcMain.on('*', (event, ...args) => {
  console.log('IPC event received:', event.channel, args);
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // Set Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' data:; connect-src 'self' http://localhost:* ws://localhost:* https://cdnjs.cloudflare.com data:; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://cdnjs.cloudflare.com; img-src 'self' data: blob: http://localhost:4005 http://localhost:*; media-src 'self' data: blob:; object-src 'self' blob: data:; child-src 'self' blob:; frame-src 'self' blob: data:; worker-src 'self' blob:;"
        ]
      }
    });
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  // Additional CSP setup for the window
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' data:; connect-src 'self' http://localhost:* ws://localhost:* https://cdnjs.cloudflare.com data:; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://cdnjs.cloudflare.com; img-src 'self' data: blob: http://localhost:4005 http://localhost:*; media-src 'self' data: blob:; object-src 'self' blob: data:; child-src 'self' blob:; frame-src 'self' blob: data:; worker-src 'self' blob:;"
        ]
      }
    });
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  console.log('App is ready, creating window');
  createWindow();
  
  // Set up IPC handlers after app is ready
  setupIpcHandlers();
});

// Set up all IPC handlers
function setupIpcHandlers() {
  console.log('Setting up IPC handlers');
  
  // Handler for opening URLs in default browser
  ipcMain.on('open-external', (event, url) => {
    console.log('open-external event received:', url);
    if (url && typeof url === 'string') {
      shell.openExternal(url).catch(err => {
        console.error('Failed to open URL:', err);
      });
    }
  });
  
  // Handler for loading attachments in the app
  ipcMain.on('load-attachment', (event, data) => {
    console.log('load-attachment event received:', data);
    
    try {
      const { url, filename } = data || {};
      
      if (!url) {
        console.error('No URL provided for attachment');
        return;
      }
      
      // Extract filename from URL if not provided
      const displayFilename = filename || url.split('/').pop() || 'Attachment';
      
      console.log('Loading attachment:', url, displayFilename);
      
      // Try multiple approaches to open the attachment
      
      // Approach 1: Try to open with shell.openExternal
      try {
        console.log('Trying to open with shell.openExternal');
        shell.openExternal(url);
        return;
      } catch (shellError) {
        console.error('Error opening with shell:', shellError);
      }
      
      // Approach 2: Create a browser window
      try {
        console.log('Creating browser window for attachment');
        
        // Create a new browser window for the attachment
        const attachmentWindow = new BrowserWindow({
          width: 800,
          height: 600,
          title: displayFilename,
          webPreferences: {
            webSecurity: false, // Disable web security to allow loading local files
            nodeIntegration: false,
            contextIsolation: true,
          }
        });
        
        console.log('Attachment window created');
        
        // Try to determine if it's an image
        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(displayFilename) || url.includes('image/');
        
        // For images, use a simple approach
        if (isImage) {
          console.log('Loading image directly:', url);
          
          // Load a simple HTML page with just the image
          attachmentWindow.loadURL(`data:text/html,
            <html>
              <head>
                <title>${displayFilename}</title>
                <style>
                  body { margin: 0; padding: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
                  img { max-width: 100%; max-height: 100vh; }
                </style>
              </head>
              <body>
                <img src="${url}" alt="${displayFilename}">
              </body>
            </html>
          `);
        } else {
          // For other files, just try to load the URL directly
          console.log('Loading URL directly:', url);
          attachmentWindow.loadURL(url);
        }
        
        // Open DevTools in development mode
        if (process.env.NODE_ENV === 'development') {
          attachmentWindow.webContents.openDevTools();
        }
        
        // Handle window close
        attachmentWindow.on('closed', () => {
          console.log('Attachment window closed');
        });
      } catch (windowError) {
        console.error('Error creating window:', windowError);
      }
    } catch (error) {
      console.error('Error in load-attachment handler:', error);
    }
  });
  
  // IPC handlers for API communication
  ipcMain.handle('test-api', async () => {
    try {
      return { status: 'success', message: 'API connection successful' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  });
  
  ipcMain.handle('test-db', async () => {
    try {
      return { status: 'success', message: 'Database connection successful' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In your real app, you would add more IPC handlers for your API endpoints

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
