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
  },

  // Client API
  client: {
    // Get all clients
    getAll: async () => {
      return makeRequest(`${API_BASE_URL}/clients`);
    },
    
    // Get client by ID
    getById: async (id) => {
      return makeRequest(`${API_BASE_URL}/clients/${id}`);
    },
    
    // Create client
    create: async (clientData) => {
      return makeRequest(`${API_BASE_URL}/clients`, 'POST', clientData);
    },
    
    // Update client
    update: async (id, clientData) => {
      return makeRequest(`${API_BASE_URL}/clients/${id}`, 'PUT', clientData);
    },
    
    // Delete client
    delete: async (id) => {
      return makeRequest(`${API_BASE_URL}/clients/${id}`, 'DELETE');
    },
  },

  // Client Type API
  clientType: {
    // Get all client types
    getAll: async () => {
      return makeRequest(`${API_BASE_URL}/client-types`);
    },
    
    // Get client type by ID
    getById: async (id) => {
      return makeRequest(`${API_BASE_URL}/client-types/${id}`);
    },
    
    // Create client type
    create: async (typeData) => {
      return makeRequest(`${API_BASE_URL}/client-types`, 'POST', typeData);
    },
    
    // Update client type
    update: async (id, typeData) => {
      return makeRequest(`${API_BASE_URL}/client-types/${id}`, 'PUT', typeData);
    },
    
    // Delete client type
    delete: async (id) => {
      return makeRequest(`${API_BASE_URL}/client-types/${id}`, 'DELETE');
    },
  },
  
  // Service Category API
  serviceCategory: {
    // Get all service categories
    getAll: async () => {
      return makeRequest(`${API_BASE_URL}/service-categories`);
    },
    
    // Get service category by ID
    getById: async (id) => {
      return makeRequest(`${API_BASE_URL}/service-categories/${id}`);
    },
    
    // Create service category
    create: async (categoryData) => {
      return makeRequest(`${API_BASE_URL}/service-categories`, 'POST', categoryData);
    },
    
    // Update service category
    update: async (id, categoryData) => {
      return makeRequest(`${API_BASE_URL}/service-categories/${id}`, 'PUT', categoryData);
    },
    
    // Delete service category
    delete: async (id) => {
      return makeRequest(`${API_BASE_URL}/service-categories/${id}`, 'DELETE');
    },
  },
  
  // Service API
  service: {
    // Get all services
    getAll: async () => {
      return makeRequest(`${API_BASE_URL}/services`);
    },
    
    // Get services by category
    getByCategory: async (categoryId) => {
      return makeRequest(`${API_BASE_URL}/services/category/${categoryId}`);
    },
    
    // Get service by ID
    getById: async (id) => {
      return makeRequest(`${API_BASE_URL}/services/${id}`);
    },
    
    // Create service
    create: async (serviceData) => {
      return makeRequest(`${API_BASE_URL}/services`, 'POST', serviceData);
    },
    
    // Update service
    update: async (id, serviceData) => {
      return makeRequest(`${API_BASE_URL}/services/${id}`, 'PUT', serviceData);
    },
    
    // Delete service
    delete: async (id) => {
      return makeRequest(`${API_BASE_URL}/services/${id}`, 'DELETE');
    },
    
    // Get requirements for a service
    getRequirements: async (id) => {
      return makeRequest(`${API_BASE_URL}/services/${id}/requirements`);
    },
    
    // Add requirement to a service
    addRequirement: async (id, requirementData) => {
      return makeRequest(`${API_BASE_URL}/services/${id}/requirements`, 'POST', requirementData);
    },
    
    // Update requirement
    updateRequirement: async (id, requirementData) => {
      return makeRequest(`${API_BASE_URL}/requirements/${id}`, 'PUT', requirementData);
    },
    
    // Delete requirement
    deleteRequirement: async (id) => {
      return makeRequest(`${API_BASE_URL}/requirements/${id}`, 'DELETE');
    },
  }
});
