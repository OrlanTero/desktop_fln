// Modules to control application life and create native browser window
const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
require('dotenv').config();

// Enable debugging
console.log('Starting Electron application...');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Check if development server is running
const isDev = process.env.NODE_ENV === 'development';
const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';

// Function to check if a server is running at a given URL
function checkServerRunning(url, callback) {
  try {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'HEAD',
      timeout: 1000,
    };

    const req = http.request(options, res => {
      callback(res.statusCode < 400); // Consider any non-error response as success
    });

    req.on('error', () => {
      callback(false);
    });

    req.on('timeout', () => {
      req.destroy();
      callback(false);
    });

    req.end();
  } catch (error) {
    console.error('Error checking server:', error);
    callback(false);
  }
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Disable web security to allow cross-origin requests
      allowRunningInsecureContent: true, // Allow loading insecure content
    },
  });

  // Disable CSP by intercepting and modifying headers
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src * 'unsafe-inline' data: blob:;",
        ],
      },
    });
  });

  // Load the app using the webpack entry point
  console.log('Loading application from webpack entry point');
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  console.log('App is ready, creating window...');
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
