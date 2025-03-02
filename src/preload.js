// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

// API base URL
const API_BASE_URL = 'http://localhost:4005';

// Helper function for making API requests
async function makeRequest(url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      success: data.status === 'success',
      data: data.data || data.user || data.users || null,
      message: data.message
    };
  } catch (error) {
    console.error('API request error:', error);
    return { 
      success: false, 
      message: error.message, 
      data: null 
    };
  }
}

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
      return makeRequest(`${API_BASE_URL}/users`);
    },
    
    // Get user by ID
    getById: async (id) => {
      return makeRequest(`${API_BASE_URL}/users/${id}`);
    },
    
    // Create user
    create: async (userData) => {
      return makeRequest(`${API_BASE_URL}/users`, 'POST', userData);
    },
    
    // Update user
    update: async (id, userData) => {
      return makeRequest(`${API_BASE_URL}/users/${id}`, 'PUT', userData);
    },
    
    // Update password
    updatePassword: async (id, passwordData) => {
      return makeRequest(`${API_BASE_URL}/users/${id}/password`, 'PUT', passwordData);
    },
    
    // Delete user
    delete: async (id) => {
      return makeRequest(`${API_BASE_URL}/users/${id}`, 'DELETE');
    },
    
    // Login
    login: async (credentials) => {
      return makeRequest(`${API_BASE_URL}/login`, 'POST', credentials);
    },
  }
});
