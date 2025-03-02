// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');
let axios;

try {
  // Try to require axios
  axios = require('axios');
} catch (error) {
  console.error('Failed to load axios:', error);
  // Provide a fallback implementation for testing
  axios = {
    get: async () => {
      return { 
        data: { 
          status: 'error', 
          message: 'Axios module not loaded. Error: ' + error.message 
        } 
      };
    },
    post: async () => {
      return { 
        data: { 
          status: 'error', 
          message: 'Axios module not loaded. Error: ' + error.message 
        } 
      };
    },
    put: async () => {
      return { 
        data: { 
          status: 'error', 
          message: 'Axios module not loaded. Error: ' + error.message 
        } 
      };
    },
    delete: async () => {
      return { 
        data: { 
          status: 'error', 
          message: 'Axios module not loaded. Error: ' + error.message 
        } 
      };
    }
  };
}

// API base URL
const API_BASE_URL = 'http://localhost:4005';

// Expose API functions to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Test connections
  testConnection: async () => {
    try {
      return await ipcRenderer.invoke('test-api');
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  },
  
  testDatabaseConnection: async () => {
    try {
      return await ipcRenderer.invoke('test-db');
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  },
  
  // User API
  user: {
    // Get all users
    getAll: async () => {
      try {
        const response = await fetch('http://localhost:4005/users');
        const data = await response.json();
        return {
          success: data.status === 'success',
          data: data.users || [],
          message: data.message
        };
      } catch (error) {
        return { success: false, message: error.message, data: [] };
      }
    },
    
    // Get user by ID
    getById: async (id) => {
      try {
        const response = await fetch(`http://localhost:4005/users/${id}`);
        const data = await response.json();
        return {
          success: data.status === 'success',
          data: data.user || null,
          message: data.message
        };
      } catch (error) {
        return { success: false, message: error.message, data: null };
      }
    },
    
    // Create user
    create: async (userData) => {
      try {
        const response = await fetch('http://localhost:4005/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        return {
          success: data.status === 'success',
          data: data.user || null,
          message: data.message
        };
      } catch (error) {
        return { success: false, message: error.message, data: null };
      }
    },
    
    // Update user
    update: async (id, userData) => {
      try {
        const response = await fetch(`http://localhost:4005/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        return {
          success: data.status === 'success',
          data: data.user || null,
          message: data.message
        };
      } catch (error) {
        return { success: false, message: error.message, data: null };
      }
    },
    
    // Update password
    updatePassword: async (id, passwordData) => {
      try {
        const response = await fetch(`http://localhost:4005/users/${id}/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(passwordData),
        });
        const data = await response.json();
        return {
          success: data.status === 'success',
          message: data.message
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    
    // Delete user
    delete: async (id) => {
      try {
        const response = await fetch(`http://localhost:4005/users/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        return {
          success: data.status === 'success',
          message: data.message
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    
    // Login
    login: async (credentials) => {
      try {
        const response = await fetch('http://localhost:4005/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
        const data = await response.json();
        return {
          success: data.status === 'success',
          data: data.user || null,
          message: data.message
        };
      } catch (error) {
        return { success: false, message: error.message, data: null };
      }
    },
  }
});
