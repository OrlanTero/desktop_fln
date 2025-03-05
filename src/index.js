import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';

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
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' data:; connect-src 'self' http://localhost:* ws://localhost:* https://cdnjs.cloudflare.com data:; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://cdnjs.cloudflare.com; img-src 'self' data: blob:; media-src 'self' data: blob:; object-src 'self' blob: data:; child-src 'self' blob:; frame-src 'self' blob: data:; worker-src 'self' blob:;"
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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

// In your real app, you would add more IPC handlers for your API endpoints

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
