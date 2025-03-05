import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import { sendEmail } from './main/email.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Set CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob:;",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline';",
          "connect-src 'self' http://localhost:4005 ws: wss: data: blob:;",
          "img-src 'self' data: blob:;",
          "style-src 'self' 'unsafe-inline';",
          "font-src 'self' data:;"
        ].join(' ')
      }
    });
  });

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
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

// Handle email sending through IPC
ipcMain.handle('send-email', async (event, emailData) => {
  try {
    const result = await sendEmail(emailData);
    return result;
  } catch (error) {
    console.error('Error in send-email handler:', error);
    return { success: false, error: error.message };
  }
}); 