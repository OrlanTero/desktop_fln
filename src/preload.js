// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');
// Import the Node.js modules directly instead of using our custom module
const http = require('http');
const https = require('https');
// Don't use URL from url module as it's not properly exposed to the renderer
// const { URL } = require('url');

// API base URL - hardcoded to ensure it's correct
// const API_BASE_URL = 'https://fln.enutrition.site';
const API_BASE_URL = 'http://192.168.1.5:4005';
console.log('Using API URL:', API_BASE_URL);

// Helper function to manually parse URLs without using the URL constructor
function parseUrl(urlString) {
  try {
    // Simple URL parsing without using the URL constructor
    if (!urlString || typeof urlString !== 'string') {
      return null;
    }

    // Ensure URL has protocol
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = 'http://' + urlString;
    }

    // Extract protocol
    const protocolSplit = urlString.split('://');
    const protocol = protocolSplit[0] + ':';
    const rest = protocolSplit[1];

    // Extract hostname, port, and path
    const pathSplit = rest.split('/');
    const hostPortPart = pathSplit[0];

    // Extract hostname and port
    const hostPortSplit = hostPortPart.split(':');
    const hostname = hostPortSplit[0];
    const port = hostPortSplit.length > 1 ? parseInt(hostPortSplit[1], 10) : null;

    // Extract path and search
    const path = '/' + pathSplit.slice(1).join('/');
    const searchSplit = path.split('?');
    const pathname = searchSplit[0];
    const search = searchSplit.length > 1 ? '?' + searchSplit[1] : '';

    return {
      protocol,
      hostname,
      port,
      pathname,
      search,
      href: urlString,
    };
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

// Direct Node.js HTTP request function that completely bypasses browser restrictions
function directHttpRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Making direct ${method} request to ${url}`);

      // Use our custom URL parser instead of the URL constructor
      const parsedUrl = parseUrl(url);
      if (!parsedUrl) {
        reject(new Error(`Invalid URL: ${url}`));
        return;
      }

      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };

      console.log('Request options:', options);

      const req = httpModule.request(options, res => {
        let responseData = '';

        res.on('data', chunk => {
          responseData += chunk;
        });

        res.on('end', () => {
          console.log(`Response status: ${res.statusCode}`);
          console.log(`Response data: ${responseData}`);

          try {
            if (!responseData.trim()) {
              resolve({
                success: res.statusCode >= 200 && res.statusCode < 300,
                data: null,
                message: 'Empty response from server',
              });
              return;
            }

            const jsonData = JSON.parse(responseData);
            resolve({
              success: jsonData.status === 'success' || jsonData.success === true,
              data: jsonData.data || jsonData.user || jsonData.users || null,
              message: jsonData.message || '',
            });
          } catch (e) {
            console.error('Error parsing JSON:', e);
            // Still resolve with a success status if the HTTP status is OK
            resolve({
              success: res.statusCode >= 200 && res.statusCode < 300,
              data: responseData,
              message: `Error parsing JSON: ${e.message}`,
            });
          }
        });
      });

      req.on('error', error => {
        console.error('Request error:', error);
        reject(error);
      });

      if (body) {
        const bodyString = JSON.stringify(body);
        console.log('Request body:', bodyString);
        req.write(bodyString);
      }

      req.end();
    } catch (error) {
      console.error('Fatal request error:', error);
      reject(error);
    }
  });
}

// Helper function for making API requests - simplified to use only directHttpRequest
async function makeRequest(url, method = 'GET', body = null) {
  try {
    console.log(`Making ${method} request to ${url}`, body);

    // Validate URL before making the request
    if (!url || typeof url !== 'string') {
      throw new Error(`Invalid URL: ${url}`);
    }

    // Ensure URL is properly formatted
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }

    // Use direct HTTP request - no IPC, no fetch, no CSP issues
    const result = await directHttpRequest(url, method, body);
    return result;
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}

// Helper function for uploading files
async function uploadFile(url, formData) {
  try {
    // Convert FormData to multipart/form-data format for Node.js
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    const chunks = [];
    let body = '';

    // Extract file data from FormData
    const fileData = formData.get('photo') || formData.get('file');
    const fileName = fileData.name;
    const fileType = fileData.type;

    // Create multipart form data manually
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
    body += `Content-Type: ${fileType}\r\n\r\n`;

    // Convert file data to buffer
    const fileBuffer = Buffer.from(await fileData.arrayBuffer());

    // Create request options
    const parsedUrl = parseUrl(url);
    if (!parsedUrl) {
      throw new Error(`Invalid URL: ${url}`);
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Accept: 'application/json',
      },
    };

    return new Promise((resolve, reject) => {
      const req = httpModule.request(options, res => {
        let responseData = '';

        res.on('data', chunk => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const data = JSON.parse(responseData);
            resolve({
              success: data.success === true,
              data: data.data || null,
              message: data.message || '',
            });
          } catch (e) {
            reject(new Error('Invalid JSON response: ' + e.message));
          }
        });
      });

      req.on('error', error => {
        reject(error);
      });

      // Write form data boundary
      req.write(body);
      // Write file data
      req.write(fileBuffer);
      // End boundary
      req.write(`\r\n--${boundary}--\r\n`);

      req.end();
    });
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      data: null,
      message: error.message,
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

    // Get all users by role
    getAllByRole: async role => {
      return makeRequest(`${API_BASE_URL}/users/role/${role}`);
    },

    // Get user by ID
    getById: async id => {
      return makeRequest(`${API_BASE_URL}/users/${id}`);
    },

    // Create user
    create: async userData => {
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
    delete: async id => {
      return makeRequest(`${API_BASE_URL}/users/${id}`, 'DELETE');
    },

    // Login
    login: async credentials => {
      return makeRequest(`${API_BASE_URL}/login`, 'POST', credentials);
    },
  },

  // User Profile API
  userProfile: {
    // Get user profile
    getProfile: async userId => {
      return makeRequest(`${API_BASE_URL}/user_profile/${userId}`);
    },

    // Update user profile
    updateProfile: async (userId, profileData) => {
      try {
        console.log(`Updating profile for user ${userId}:`, profileData);

        const response = await fetch(`${API_BASE_URL}/user_profile/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });

        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
          } catch (e) {
            errorMessage = `HTTP error! status: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        const responseText = await response.text();
        console.log('Profile update response text:', responseText);

        if (!responseText.trim()) {
          return {
            success: false,
            message: 'Empty response from server',
          };
        }

        const data = JSON.parse(responseText);

        return {
          success: data.success === true,
          data: data.data || null,
          message: data.message || '',
        };
      } catch (error) {
        console.error('Profile update error:', error);
        return {
          success: false,
          data: null,
          message: error.message,
        };
      }
    },

    // Upload profile photo
    uploadPhoto: async (userId, photoFile) => {
      const formData = new FormData();
      formData.append('photo', photoFile);

      try {
        const response = await fetch(`${API_BASE_URL}/user_profile/${userId}/photo`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
          } catch (e) {
            errorMessage = `HTTP error! status: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        return {
          success: data.success === true,
          data: data.data || null,
          message: data.message || '',
        };
      } catch (error) {
        console.error('File upload error:', error);
        return {
          success: false,
          data: null,
          message: error.message,
        };
      }
    },

    // Upload signature
    uploadSignature: async (userId, signatureFile) => {
      const formData = new FormData();
      formData.append('signature', signatureFile);

      try {
        const response = await fetch(`${API_BASE_URL}/user_profile/${userId}/signature`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
          } catch (e) {
            errorMessage = `HTTP error! status: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        return {
          success: data.success === true,
          data: data.data || null,
          message: data.message || '',
        };
      } catch (error) {
        console.error('Signature upload error:', error);
        return {
          success: false,
          data: null,
          message: error.message,
        };
      }
    },
  },

  // Client API
  client: {
    // Get all clients
    getAll: async () => {
      return makeRequest(`${API_BASE_URL}/clients`);
    },

    // Get client by ID
    getById: async id => {
      return makeRequest(`${API_BASE_URL}/clients/${id}`);
    },

    // Create client
    create: async clientData => {
      return makeRequest(`${API_BASE_URL}/clients`, 'POST', clientData);
    },

    // Update client
    update: async (id, clientData) => {
      return makeRequest(`${API_BASE_URL}/clients/${id}`, 'PUT', clientData);
    },

    // Delete client
    delete: async id => {
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
    getById: async id => {
      return makeRequest(`${API_BASE_URL}/client-types/${id}`);
    },

    // Create client type
    create: async typeData => {
      return makeRequest(`${API_BASE_URL}/client-types`, 'POST', typeData);
    },

    // Update client type
    update: async (id, typeData) => {
      return makeRequest(`${API_BASE_URL}/client-types/${id}`, 'PUT', typeData);
    },

    // Delete client type
    delete: async id => {
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
    getById: async id => {
      return makeRequest(`${API_BASE_URL}/service-categories/${id}`);
    },

    // Create service category
    create: async categoryData => {
      return makeRequest(`${API_BASE_URL}/service-categories`, 'POST', categoryData);
    },

    // Update service category
    update: async (id, categoryData) => {
      return makeRequest(`${API_BASE_URL}/service-categories/${id}`, 'PUT', categoryData);
    },

    // Delete service category
    delete: async id => {
      return makeRequest(`${API_BASE_URL}/service-categories/${id}`, 'DELETE');
    },
  },

  // Service API
  service: {
    // Get all services
    getAll: async () => {
      return makeRequest(`${API_BASE_URL}/services`);
    },

    // Get services by project
    getByProject: async projectId => {
      return makeRequest(`${API_BASE_URL}/services/project/${projectId}`);
    },

    // Get services by category
    getByCategory: async categoryId => {
      return makeRequest(`${API_BASE_URL}/services/category/${categoryId}`);
    },

    // Get service by ID
    getById: async id => {
      return makeRequest(`${API_BASE_URL}/services/${id}`);
    },

    // Create service
    create: async serviceData => {
      return makeRequest(`${API_BASE_URL}/services`, 'POST', serviceData);
    },

    // Update service
    update: async (id, serviceData) => {
      return makeRequest(`${API_BASE_URL}/services/${id}`, 'PUT', serviceData);
    },

    // Delete service
    delete: async id => {
      return makeRequest(`${API_BASE_URL}/services/${id}`, 'DELETE');
    },

    // Get requirements for a service
    getRequirements: async id => {
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
    deleteRequirement: async id => {
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
    getById: async id => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}`);
    },

    // Get proposals by client
    getByClient: async clientId => {
      return makeRequest(`${API_BASE_URL}/proposals/client/${clientId}`);
    },

    // Get last proposal reference
    getLastReference: async () => {
      return makeRequest(`${API_BASE_URL}/proposals/last-reference`);
    },

    // Create proposal
    create: async proposalData => {
      return makeRequest(`${API_BASE_URL}/proposals`, 'POST', proposalData);
    },

    // Update proposal
    update: async (id, proposalData) => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}`, 'PUT', proposalData);
    },

    // Delete proposal
    delete: async id => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}`, 'DELETE');
    },

    // Convert proposal to project
    convertToProject: async id => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}/convert`, 'POST');
    },

    // Get proposal status history
    getStatusHistory: async id => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}/status-history`);
    },

    // Update proposal status
    updateStatus: async (id, statusData) => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}/status`, 'PUT', statusData);
    },

    updateOnlyStatus: async (id, status) => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}/${status}`, 'PUT');
    },

    // Save proposal as draft
    saveAsDraft: async proposalData => {
      return makeRequest(`${API_BASE_URL}/proposals/draft`, 'POST', proposalData);
    },

    // Generate proposal document
    generateDocument: async id => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}/document`, 'POST');
    },

    // Get proposal document
    getDocument: async id => {
      return makeRequest(`${API_BASE_URL}/proposals/${id}/document`, 'GET');
    },
    getDocumentByProposal: async id => {
      return makeRequest(`${API_BASE_URL}/documents/proposal/${id}`, 'GET');
    },
  },

  // Project API
  project: {
    // Get all projects
    getAll: async () => {
      return makeRequest(`${API_BASE_URL}/projects`);
    },

    // Get project by ID
    getById: async id => {
      return makeRequest(`${API_BASE_URL}/projects/${id}`);
    },

    // Get projects by client
    getByClient: async clientId => {
      return makeRequest(`${API_BASE_URL}/projects/client/${clientId}`);
    },

    // Create project
    create: async projectData => {
      return makeRequest(`${API_BASE_URL}/projects`, 'POST', projectData);
    },

    // Update project
    update: async (id, projectData) => {
      return makeRequest(`${API_BASE_URL}/projects/${id}`, 'PUT', projectData);
    },

    // Delete project
    delete: async id => {
      return makeRequest(`${API_BASE_URL}/projects/${id}`, 'DELETE');
    },

    // Get project status history
    getStatusHistory: async id => {
      return makeRequest(`${API_BASE_URL}/projects/${id}/status-history`);
    },

    // Update project status
    updateStatus: async (id, statusData) => {
      return makeRequest(`${API_BASE_URL}/projects/${id}/status`, 'PUT', statusData);
    },

    // Get project timeline
    getTimeline: async id => {
      return makeRequest(`${API_BASE_URL}/projects/${id}/timeline`);
    },

    // Update project timeline
    updateTimeline: async (id, timelineData) => {
      return makeRequest(`${API_BASE_URL}/projects/${id}/timeline`, 'PUT', timelineData);
    },

    // Update project paid amount
    updatePaidAmount: async (id, amount) => {
      return makeRequest(`${API_BASE_URL}/projects/${id}/payment`, 'PUT', { amount });
    },
  },

  // ProService API
  proService: {
    // Get all pro services by proposal ID
    getByProposal: async proposalId => {
      try {
        const response = await makeRequest(
          `${API_BASE_URL}/pro-services/proposal/${proposalId}`,
          'GET'
        );
        return response;
      } catch (error) {
        console.error('Error getting pro services by proposal:', error);
        return { success: false, message: error.message };
      }
    },

    // Get all pro services by project ID
    getByProject: async projectId => {
      try {
        const response = await makeRequest(
          `${API_BASE_URL}/pro-services/project/${projectId}`,
          'GET'
        );
        return response;
      } catch (error) {
        console.error('Error getting pro services by project:', error);
        return { success: false, message: error.message };
      }
    },

    // Get pro service by ID
    getById: async id => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services/${id}`, 'GET');
        return response;
      } catch (error) {
        console.error('Error getting pro service:', error);
        return { success: false, message: error.message };
      }
    },

    // Create pro service
    create: async data => {
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
    delete: async id => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/pro-services/${id}`, 'DELETE');
        return response;
      } catch (error) {
        console.error('Error deleting pro service:', error);
        return { success: false, message: error.message };
      }
    },

    // Delete all pro services for a proposal
    deleteByProposal: async proposalId => {
      try {
        const response = await makeRequest(
          `${API_BASE_URL}/pro-services/proposal/${proposalId}`,
          'DELETE'
        );
        return response;
      } catch (error) {
        console.error('Error deleting pro services by proposal:', error);
        return { success: false, message: error.message };
      }
    },

    // Delete all pro services for a project
    deleteByProject: async proposalId => {
      try {
        const response = await makeRequest(
          `${API_BASE_URL}/pro-services/project/${proposalId}`,
          'DELETE'
        );
        return response;
      } catch (error) {
        console.error('Error deleting pro services by project:', error);
        return { success: false, message: error.message };
      }
    },

    // Calculate total amount for a proposal
    calculateProposalTotal: async proposalId => {
      try {
        const response = await makeRequest(
          `${API_BASE_URL}/pro-services/proposal/${proposalId}/total`,
          'GET'
        );
        return response;
      } catch (error) {
        console.error('Error calculating proposal total:', error);
        return { success: false, message: error.message };
      }
    },

    // Copy services from proposal to project
    copyToProject: async proposalId => {
      try {
        const response = await makeRequest(
          `${API_BASE_URL}/pro-services/proposal/${proposalId}/copy-to-project`,
          'POST'
        );
        return response;
      } catch (error) {
        console.error('Error copying services to project:', error);
        return { success: false, message: error.message };
      }
    },
  },

  // Company Info API
  companyInfo: {
    // Get company info
    get: async () => {
      return makeRequest(`${API_BASE_URL}/company-info`);
    },

    // Update company info
    update: async data => {
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
          base64: fileData.base64,
        };

        console.log(`Document name: ${fileData.name}`);
        console.log(`Base64 data length: ${fileData.base64.length}`);

        const response = await makeRequest(
          `${API_BASE_URL}/documents/upload/${proposalId}`,
          'POST',
          data
        );
        console.log('Document upload response:', response);
        return response;
      } catch (error) {
        console.error('Error uploading document:', error);
        return { success: false, message: error.message };
      }
    },

    getByProposal: async proposalId => {
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

    delete: async documentId => {
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
    },
  },

  // Job Orders API
  jobOrders: {
    create: async data => {
      try {
        return await makeRequest(`${API_BASE_URL}/job-orders`, 'POST', data);
      } catch (error) {
        console.error('Error creating job order:', error);
        return { success: false, message: error.message };
      }
    },

    getAll: async () => {
      try {
        return await makeRequest(`${API_BASE_URL}/job-orders`);
      } catch (error) {
        console.error('Error fetching job orders:', error);
        return { success: false, message: error.message };
      }
    },

    getByProject: async projectId => {
      try {
        return await makeRequest(`${API_BASE_URL}/job-orders/project/${projectId}`);
      } catch (error) {
        console.error('Error fetching job orders by project:', error);
        return { success: false, message: error.message };
      }
    },

    getByService: async (serviceId, proposalId) => {
      try {
        return await makeRequest(
          `${API_BASE_URL}/job-orders/service/${serviceId}/proposal/${proposalId}`
        );
      } catch (error) {
        console.error('Error fetching job orders:', error);
        return { success: false, message: error.message };
      }
    },

    update: async (id, data) => {
      try {
        return await makeRequest(`${API_BASE_URL}/job-orders/${id}`, 'PUT', data);
      } catch (error) {
        console.error('Error updating job order:', error);
        return { success: false, message: error.message };
      }
    },

    delete: async id => {
      try {
        return await makeRequest(`${API_BASE_URL}/job-orders/${id}`, 'DELETE');
      } catch (error) {
        console.error('Error deleting job order:', error);
        return { success: false, message: error.message };
      }
    },

    // Get unassigned job orders by project
    getUnassignedByProject: async projectId => {
      try {
        return await makeRequest(`${API_BASE_URL}/job-orders/unassigned/project/${projectId}`);
      } catch (error) {
        console.error('Error fetching unassigned job orders:', error);
        return { success: false, message: error.message };
      }
    },

    // Get assigned job orders by project
    getAssignedByProject: async projectId => {
      try {
        return await makeRequest(`${API_BASE_URL}/job-orders/assigned/project/${projectId}`);
      } catch (error) {
        console.error('Error fetching assigned job orders:', error);
        return { success: false, message: error.message };
      }
    },

    // Assign job order to liaison
    assign: async assignmentData => {
      try {
        return await makeRequest(`${API_BASE_URL}/job-orders/assign`, 'POST', assignmentData);
      } catch (error) {
        console.error('Error assigning job order:', error);
        return { success: false, message: error.message };
      }
    },

    // Get job order by ID with submission data
    getById: async id => {
      try {
        return await makeRequest(`${API_BASE_URL}/job-orders/${id}`);
      } catch (error) {
        console.error('Error fetching job order details:', error);
        return { success: false, message: error.message };
      }
    },

    // Get submissions for a job order
    getSubmissions: async jobOrderId => {
      try {
        return await makeRequest(`${API_BASE_URL}/job-orders/${jobOrderId}/submissions`);
      } catch (error) {
        console.error('Error fetching job order submissions:', error);
        return { success: false, message: error.message };
      }
    },

    // Update submission status
    updateSubmissionStatus: async (submissionId, status) => {
      try {
        return await makeRequest(
          `${API_BASE_URL}/job-orders/submissions/${submissionId}/status`,
          'PUT',
          { status }
        );
      } catch (error) {
        console.error('Error updating submission status:', error);
        return { success: false, message: error.message };
      }
    },

    // Get attachment URL
    getAttachmentUrl: path => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    },
  },

  // Email API
  email: {
    send: async emailData => {
      return makeRequest(`${API_BASE_URL}/email/send`, 'POST', emailData);
    },
  },

  // Task API
  task: {
    // Get all tasks
    getAll: async () => {
      return makeRequest(`${API_BASE_URL}/tasks`);
    },

    // Get tasks by project
    getById: async id => {
      return makeRequest(`${API_BASE_URL}/tasks/${id}`);
    },

    // Get tasks by liaison
    getByLiaison: async liaisonId => {
      return makeRequest(`${API_BASE_URL}/tasks/liaison/${liaisonId}`);
    },

    // Create task
    create: async taskData => {
      return makeRequest(`${API_BASE_URL}/tasks`, 'POST', taskData);
    },

    // Update task
    update: async (id, taskData) => {
      return makeRequest(`${API_BASE_URL}/tasks/${id}`, 'PUT', taskData);
    },

    // Update task status
    updateStatus: async (id, statusData) => {
      return makeRequest(`${API_BASE_URL}/tasks/${id}/status`, 'PUT', statusData);
    },

    // Update submission status
    updateSubmissionStatus: async (submissionId, status) => {
      return makeRequest(`${API_BASE_URL}/task-submissions/${submissionId}/status`, 'PUT', {
        status,
      });
    },

    // Get attachment URL
    getAttachmentUrl: path => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    },

    // Delete task
    delete: async id => {
      return makeRequest(`${API_BASE_URL}/tasks/${id}`, 'DELETE');
    },
  },

  // Utility functions
  utils: {
    // Open URL in default browser
    openExternal: url => {
      if (!url) return;

      console.log('Sending open-external IPC message:', url);
      // Use the Electron shell to open the URL in the default browser
      ipcRenderer.send('open-external', url);
    },

    // Format URL for uploaded files
    formatUploadUrl: path => {
      if (!path) return '';
      if (path.startsWith('http')) return path;

      // Use the serving script to access files
      if (path.startsWith('/uploads/')) {
        const filePath = path.substring(9); // Remove the /uploads/ prefix
        return `${API_BASE_URL}/uploads/serving.php?file=${filePath}`;
      }

      return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    },

    // Load attachment in the app
    loadAttachment: (url, filename) => {
      if (!url) {
        console.error('No URL provided for attachment');
        return;
      }

      console.log('Sending load-attachment IPC message:', url, filename);

      // Use a direct approach to send the IPC message
      try {
        ipcRenderer.send('load-attachment', { url, filename });
        console.log('IPC message sent successfully');
      } catch (error) {
        console.error('Error sending IPC message:', error);

        // Fallback: try to open in external browser
        try {
          window.open(url, '_blank');
          console.log('Fallback: opened in browser');
        } catch (browserError) {
          console.error('Error opening in browser:', browserError);
        }
      }
    },
  },

  // Message API
  message: {
    // Get conversation between two users
    getConversation: async (user1Id, user2Id) => {
      return makeRequest(`${API_BASE_URL}/messages/conversation/${user1Id}/${user2Id}`);
    },

    // Get recent conversations for a user
    getRecentConversations: async userId => {
      return makeRequest(`${API_BASE_URL}/messages/conversations/${userId}`);
    },

    // Send a message
    sendMessage: async messageData => {
      return makeRequest(`${API_BASE_URL}/messages`, 'POST', messageData);
    },

    // Send a message with attachments
    sendMessageWithAttachments: async formData => {
      try {
        const response = await fetch(`${API_BASE_URL}/messages/with-attachments`, {
          method: 'POST',
          body: formData, // FormData object with message data and files
        });

        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
          } catch (e) {
            errorMessage = `HTTP error! status: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        return {
          success: data.status === 'success' || data.success === true,
          data: data.data || null,
          message: data.message,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },

    // Mark messages as read
    markAsRead: async (senderId, receiverId) => {
      return makeRequest(`${API_BASE_URL}/messages/read/${senderId}/${receiverId}`, 'PUT');
    },

    // Get unread message count
    getUnreadCount: async userId => {
      return makeRequest(`${API_BASE_URL}/messages/unread/${userId}`);
    },

    // Update user online status
    updateUserStatus: async (userId, isOnline) => {
      return makeRequest(`${API_BASE_URL}/messages/status/${userId}`, 'PUT', {
        is_online: isOnline,
      });
    },

    // Get user online status
    getUserStatus: async userId => {
      return makeRequest(`${API_BASE_URL}/messages/status/${userId}`);
    },
  },
});
