// Preload script for attachment viewer
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('attachmentViewer', {
  // Close the window
  close: () => {
    ipcRenderer.send('close-attachment-window');
  },
  
  // Print the content
  print: () => {
    ipcRenderer.send('print-attachment');
  }
});

// Listen for DOM content loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('Attachment viewer loaded');
}); 