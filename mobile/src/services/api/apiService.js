import apiClient from './apiConfig';

// API service functions
const apiService = {
  // User related API calls
  users: {
    getAll: () => apiClient.get('/users'),
    getById: (id) => apiClient.get(`/users/${id}`),
    create: (userData) => apiClient.post('/users', userData),
    update: (id, userData) => apiClient.put(`/users/${id}`, userData),
    updatePassword: (id, passwordData) => apiClient.put(`/users/${id}/password`, passwordData),
    delete: (id) => apiClient.delete(`/users/${id}`),
    login: (credentials) => {
      console.log('Login request with credentials:', JSON.stringify(credentials));
      return apiClient.post('/login', credentials)
        .then(response => {
          console.log('Login response:', response.data);
          return response;
        })
        .catch(error => {
          console.error('Login request failed:', error);
          throw error;
        });
    },
  },

  // Client related API calls
  clients: {
    getAll: () => apiClient.get('/clients'),
    getById: (id) => apiClient.get(`/clients/${id}`),
    create: (clientData) => apiClient.post('/clients', clientData),
    update: (id, clientData) => apiClient.put(`/clients/${id}`, clientData),
    delete: (id) => apiClient.delete(`/clients/${id}`),
  },

  // Client types related API calls
  clientTypes: {
    getAll: () => apiClient.get('/client-types'),
    getById: (id) => apiClient.get(`/client-types/${id}`),
    create: (typeData) => apiClient.post('/client-types', typeData),
    update: (id, typeData) => apiClient.put(`/client-types/${id}`, typeData),
    delete: (id) => apiClient.delete(`/client-types/${id}`),
  },

  // Service categories related API calls
  serviceCategories: {
    getAll: () => apiClient.get('/service-categories'),
    getById: (id) => apiClient.get(`/service-categories/${id}`),
    create: (categoryData) => apiClient.post('/service-categories', categoryData),
    update: (id, categoryData) => apiClient.put(`/service-categories/${id}`, categoryData),
    delete: (id) => apiClient.delete(`/service-categories/${id}`),
  },

  // Services related API calls
  services: {
    getAll: () => apiClient.get('/services'),
    getByCategory: (categoryId) => apiClient.get(`/services/category/${categoryId}`),
    getById: (id) => apiClient.get(`/services/${id}`),
    create: (serviceData) => apiClient.post('/services', serviceData),
    update: (id, serviceData) => apiClient.put(`/services/${id}`, serviceData),
    delete: (id) => apiClient.delete(`/services/${id}`),
    getRequirements: (id) => apiClient.get(`/services/${id}/requirements`),
    addRequirement: (id, requirementData) => apiClient.post(`/services/${id}/requirements`, requirementData),
    updateRequirement: (id, requirementData) => apiClient.put(`/requirements/${id}`, requirementData),
    deleteRequirement: (id) => apiClient.delete(`/requirements/${id}`),
  },

  // Job Orders related API calls
  jobOrders: {
    getAll: () => apiClient.get('/job-orders'),
    getByProject: (projectId) => apiClient.get(`/job-orders/project/${projectId}`),
    getByService: (serviceId, proposalId) => apiClient.get(`/job-orders/service/${serviceId}/proposal/${proposalId}`),
    create: (jobOrderData) => apiClient.post('/job-orders', jobOrderData),
    update: (id, jobOrderData) => apiClient.put(`/job-orders/${id}`, jobOrderData),
    delete: (id) => apiClient.delete(`/job-orders/${id}`),
    assign: (assignmentData) => apiClient.post('/job-orders/assign', assignmentData),
    getAssignedByProject: (projectId) => apiClient.get(`/job-orders/assigned/project/${projectId}`),
    getUnassignedByProject: (projectId) => apiClient.get(`/job-orders/unassigned/project/${projectId}`),
    updateAssignedStatus: (id, statusData) => apiClient.put(`/job-orders/assigned/${id}/status`, statusData),
    deleteAssignment: (id) => apiClient.delete(`/job-orders/assigned/${id}`),
    getById: (id) => apiClient.get(`/job-orders/${id}`),
    submitCompletion: (formData) => {
      // Set the correct content type for form data with files
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      return apiClient.post('/job-orders/submit-completion', formData, config);
    },
    getSubmissions: (jobOrderId) => apiClient.get(`/job-orders/${jobOrderId}/submissions`),
    getSubmissionById: (submissionId) => apiClient.get(`/job-orders/submissions/${submissionId}`),
    getLiaisonSubmissions: (liaisonId) => apiClient.get(`/liaisons/${liaisonId}/submissions`),
    updateSubmissionStatus: (submissionId, status) => apiClient.put(`/job-orders/submissions/${submissionId}/status`, { status }),
    deleteSubmission: (submissionId) => apiClient.delete(`/job-orders/submissions/${submissionId}`),
  },

  // Project related API calls
  projects: {
    getAll: () => apiClient.get('/projects'),
    getById: (id) => apiClient.get(`/projects/${id}`),
    create: (projectData) => apiClient.post('/projects', projectData),
    update: (id, projectData) => apiClient.put(`/projects/${id}`, projectData),
    delete: (id) => apiClient.delete(`/projects/${id}`),
  },

  // Add more API endpoints as needed
};

export default apiService;