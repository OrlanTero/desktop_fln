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

    console.log(`Making ${method} request to: ${url}`);
    if (body) {
      console.log('Request body keys:', Object.keys(body));
      console.log('Request body data types:', {
        base64: typeof body.base64 === 'string' ? `String (length: ${body.base64?.length})` : typeof body.base64,
        name: typeof body.name
      });
    }
    
    const response = await fetch(url, options);
    console.log('Response status:', response.status);
    
    // Check if response is ok (status in the range 200-299)
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage;
      try {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      } catch (e) {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    // Try to parse JSON response
    let data;
    try {
      const responseText = await response.text();
      console.log('Response text:', responseText);
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      throw new Error('Invalid JSON response from server');
    }
    
    return {
      success: data.status === 'success' || data.success === true,
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
  },

  // Proposal API
  proposal: {
    // Get all proposals
    getAll: async () => {
      return makeRequest(`${API_BASE_URL}/proposals`);
    },
    
    // Get proposal by ID
    getById: async (id) => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}`);
    },
    
    // Get proposals by client
    getByClient: async (clientId) => {
      return makeRequest(`${API_BASE_URL}/proposals/client/${clientId}`);
    },
    
    // Get last proposal reference
    getLastReference: async () => {
      return makeRequest(`${API_BASE_URL}/proposals/last-reference`);
    },
    
    // Create proposal
    create: async (proposalData) => {
      return makeRequest(`${API_BASE_URL}/proposals`, 'POST', proposalData);
    },
    
    // Update proposal
    update: async (id, proposalData) => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}`, 'PUT', proposalData);
    },
    
    // Delete proposal
    delete: async (id) => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}`, 'DELETE');
    },
    
    // Convert proposal to project
    convertToProject: async (id) => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}/convert`, 'POST');
    },
    
    // Get proposal status history
    getStatusHistory: async (id) => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}/status-history`);
    },
    
    // Update proposal status
    updateStatus: async (id, statusData) => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}/status`, 'PUT', statusData);
    },
    
    // Save proposal as draft
    saveAsDraft: async (proposalData) => {
      return makeRequest(`${API_BASE_URL}/proposals/draft`, 'POST', proposalData);
    },
    
    // Generate proposal document
    generateDocument: async (id) => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}/document`, 'POST');
    },
    
    // Get proposal document
    getDocument: async (id) => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}/document`, 'GET');
    },
  },

  // Project API
  project: {
    // Get all projects
    getAll: async () => {
      return makeRequest(`${API_BASE_URL}/projects`);
    },
    
    // Get project by ID
    getById: async (id) => {
      return makeRequest(`${API_BASE_URL}/projects/${id}`);
    },
    
    // Get projects by client
    getByClient: async (clientId) => {
      return makeRequest(`${API_BASE_URL}/projects/client/${clientId}`);
    },
    
    // Create project
    create: async (projectData) => {
      return makeRequest(`${API_BASE_URL}/projects`, 'POST', projectData);
    },
    
    // Update project
    update: async (id, projectData) => {
      return makeRequest(`${API_BASE_URL}/projects/${id}`, 'PUT', projectData);
    },
    
    // Delete project
    delete: async (id) => {
      return makeRequest(`${API_BASE_URL}/projects/${id}`, 'DELETE');
    },
    
    // Get project status history
    getStatusHistory: async (id) => {
      return makeRequest(`${API_BASE_URL}/projects/${id}/status-history`);
    },
    
    // Update project status
    updateStatus: async (id, statusData) => {
      return makeRequest(`${API_BASE_URL}/projects/${id}/status`, 'PUT', statusData);
    },
    
    // Get project timeline
    getTimeline: async (id) => {
      return makeRequest(`${API_BASE_URL}/projects/${id}/timeline`);
    },
    
    // Update project timeline
    updateTimeline: async (id, timelineData) => {
      return makeRequest(`${API_BASE_URL}/projects/${id}/timeline`, 'PUT', timelineData);
    }
  },

  // ProService API
  proService: {
    // Get all pro services by proposal ID
    getByProposal: async (proposalId) => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services/proposal/${proposalId}`, 'GET');
        return response;
      } catch (error) {
        console.error('Error getting pro services by proposal:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Get all pro services by project ID
    getByProject: async (projectId) => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services/project/${projectId}`, 'GET');
        return response;
      } catch (error) {
        console.error('Error getting pro services by project:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Get pro service by ID
    getById: async (id) => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services/${id}`, 'GET');
        return response;
      } catch (error) {
        console.error('Error getting pro service:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Create pro service
    create: async (data) => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services`, 'POST', data);
        return response;
      } catch (error) {
        console.error('Error creating pro service:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Update pro service
    update: async (id, data) => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services/${id}`, 'PUT', data);
        return response;
      } catch (error) {
        console.error('Error updating pro service:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Delete pro service
    delete: async (id) => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services/${id}`, 'DELETE');
        return response;
      } catch (error) {
        console.error('Error deleting pro service:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Delete all pro services for a proposal
    deleteByProposal: async (proposalId) => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services/proposal/${proposalId}`, 'DELETE');
        return response;
      } catch (error) {
        console.error('Error deleting pro services by proposal:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Delete all pro services for a project
    deleteByProject: async (proposalId) => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services/project/${proposalId}`, 'DELETE');
        return response;
      } catch (error) {
        console.error('Error deleting pro services by project:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Calculate total amount for a proposal
    calculateProposalTotal: async (proposalId) => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services/proposal/${proposalId}/total`, 'GET');
        return response;
      } catch (error) {
        console.error('Error calculating proposal total:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Copy services from proposal to project
    copyToProject: async (proposalId) => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services/proposal/${proposalId}/copy-to-project`, 'POST');
        return response;
      } catch (error) {
        console.error('Error copying services to project:', error);
        return { success: false, message: error.message };
      }
    }
  },

  // Company Info API
  companyInfo: {
    // Get company info
    get: async () => {
      return makeRequest(`${API_BASE_URL}/company-info`);
    },
    
    // Update company info
    update: async (data) => {
      return makeRequest(`${API_BASE_URL}/company-info`, 'PUT', data);
    },
  },

  // Document endpoints
  document: {
    upload: async (proposalId, fileData) => {
      if (!proposalId) {
        console.error('No proposal ID provided for document upload');
        return { success: false, message: 'No proposal ID provided' };
      }
      
      try {
        console.log(`Uploading document for proposal ID: ${proposalId}`);
        console.log(`Upload URL: ${API_BASE_URL}/documents/upload/${proposalId}`);
        
        // The API expects just the file data without the proposal_id in the body
        const data = {
          name: fileData.name,
          base64: fileData.base64
        };
        
        console.log(`Document name: ${fileData.name}`);
        console.log(`Base64 data length: ${fileData.base64.length}`);
        
        const response = await makeRequest(`${API_BASE_URL}/documents/upload/${proposalId}`, 'POST', data);
        console.log('Document upload response:', response);
        return response;
      } catch (error) {
        console.error('Error uploading document:', error);
        return { success: false, message: error.message };
      }
    },
    
    getByProposal: async (proposalId) => {
      if (!proposalId) {
        console.error('No proposal ID provided for document retrieval');
        return { success: false, message: 'No proposal ID provided' };
      }
      
      try {
        return makeRequest(`${API_BASE_URL}/documents/proposal/${proposalId}`);
      } catch (error) {
        console.error('Error getting documents for proposal:', error);
        return { success: false, message: error.message };
      }
    },
    
    delete: async (documentId) => {
      if (!documentId) {
        console.error('No document ID provided for deletion');
        return { success: false, message: 'No document ID provided' };
      }
      
      try {
        return makeRequest(`${API_BASE_URL}/documents/${documentId}`, 'DELETE');
      } catch (error) {
        console.error('Error deleting document:', error);
        return { success: false, message: error.message };
      }
    }
  },
});
