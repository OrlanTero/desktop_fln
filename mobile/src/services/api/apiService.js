import apiClient from './apiConfig';

// API service functions
const apiService = {
  // User related API calls
  users: {
    getAll: () => 
      apiClient.get('/users')
        .then(response => ({
          data: {
            status: response.data.status,
            data: response.data.users || []
          }
        }))
        .catch(error => {
          console.error('Error fetching users:', error);
          return { data: { status: 'error', message: 'Failed to fetch users', data: [] } };
        }),
    getById: (id) => 
      apiClient.get(`/users/${id}`)
        .then(response => ({
          data: {
            status: response.data.status,
            data: response.data.user || {}
          }
        }))
        .catch(error => {
          console.error(`Error fetching user ${id}:`, error);
          return { data: { status: 'error', message: 'Failed to fetch user', data: {} } };
        }),
    create: (userData) => 
      apiClient.post('/users', userData)
        .then(response => ({
          data: response.data
        }))
        .catch(error => {
          console.error('Error creating user:', error);
          return { data: { status: 'error', message: 'Failed to create user' } };
        }),
    update: (id, userData) => 
      apiClient.put(`/users/${id}`, userData)
        .then(response => ({
          data: response.data
        }))
        .catch(error => {
          console.error(`Error updating user ${id}:`, error);
          return { data: { status: 'error', message: 'Failed to update user' } };
        }),
    uploadPhoto: (id, formData) => {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      return apiClient.post(`/users/${id}/photo`, formData, config)
        .then(response => ({
          data: response.data
        }))
        .catch(error => {
          console.error(`Error uploading photo for user ${id}:`, error);
          return { data: { status: 'error', message: 'Failed to upload photo' } };
        });
    },
    updatePassword: (id, passwordData) => 
      apiClient.put(`/users/${id}/password`, passwordData)
        .then(response => ({
          data: response.data
        }))
        .catch(error => {
          console.error(`Error updating password for user ${id}:`, error);
          return { data: { status: 'error', message: 'Failed to update password', data: {} } };
        }),
    delete: (id) => 
      apiClient.delete(`/users/${id}`)
        .then(response => ({
          data: response.data
        }))
        .catch(error => {
          console.error(`Error deleting user ${id}:`, error);
          return { data: { status: 'error', message: 'Failed to delete user' } };
        }),
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
    getAssignedByProjectAndLiaison: (projectId, liaisonId) => apiClient.get(`/job-orders/assigned/project/${projectId}/liaison/${liaisonId}`),
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
    deleteSubmissionAttachment: (attachmentId) => apiClient.delete(`/job-orders/submissions/attachments/${attachmentId}`),
  },

  // Project related API calls
  projects: {
    getAll: () => apiClient.get('/projects'),
    getById: (id) => apiClient.get(`/projects/${id}`),
    create: (projectData) => apiClient.post('/projects', projectData),
    update: (id, projectData) => apiClient.put(`/projects/${id}`, projectData),
    delete: (id) => apiClient.delete(`/projects/${id}`),
  },

  // Tasks related API calls
  tasks: {
    getAll: () => apiClient.get('/tasks').then(response => {
      console.log('Raw getAll tasks response:', response);
      return {
        data: {
          success: response.data.status === 'success',
          data: response.data.data || []
        }
      };
    }),
    getByLiaison: (liaisonId) => apiClient.get(`/tasks/liaison/${liaisonId}`).then(response => {
      console.log('Raw getByLiaison tasks response:', response);
      return {
        data: {
          success: response.data.status === 'success',
          data: response.data.data || []
        }
      };
    }),
    getById: (id) => apiClient.get(`/tasks/${id}`).then(response => {
      return {
        data: {
          success: response.data.status === 'success',
          data: response.data.data || {}
        }
      };
    }),
    create: (taskData) => apiClient.post('/tasks', taskData),
    update: (id, taskData) => apiClient.put(`/tasks/${id}`, taskData),
    updateStatus: (id, statusData) => apiClient.put(`/tasks/${id}/status`, statusData),
    delete: (id) => apiClient.delete(`/tasks/${id}`),
    submitCompletion: (formData) => {
      // Set the correct content type for form data with files
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      console.log('Submitting task completion with form data:', formData);
      
      // Log all form data entries
      if (formData && typeof formData.forEach === 'function') {
        formData.forEach((value, key) => {
          console.log(`Form data entry - ${key}:`, value);
        });
      }
      
      return apiClient.post('/tasks/submit-completion', formData, config).then(response => {
        console.log('Task submission response:', response);
        return {
          data: {
            success: response.data.status === 'success',
            data: response.data.data || {},
            message: response.data.message
          }
        };
      }).catch(error => {
        console.error('Task submission error:', error);
        throw error;
      });
    },
    updateSubmission: (formData) => {
      // Set the correct content type for form data with files
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      console.log('Updating task submission with form data:', formData);
      
      // Log all form data entries
      if (formData && typeof formData.forEach === 'function') {
        formData.forEach((value, key) => {
          console.log(`Form data entry - ${key}:`, value);
        });
      }
      
      return apiClient.post('/tasks/update-submission', formData, config).then(response => {
        console.log('Task update response:', response);
        return {
          data: {
            success: response.data.status === 'success',
            data: response.data.data || {},
            message: response.data.message
          }
        };
      }).catch(error => {
        console.error('Task update error:', error);
        throw error;
      });
    },
    getSubmissions: (taskId) => apiClient.get(`/tasks/${taskId}/submissions`).then(response => {
      return {
        data: {
          success: response.data.status === 'success',
          data: response.data.data || []
        }
      };
    }),
    getSubmissionById: (submissionId) => apiClient.get(`/tasks/submissions/${submissionId}`).then(response => {
      return {
        data: {
          success: response.data.status === 'success',
          data: response.data.data || {}
        }
      };
    }),
    getLiaisonSubmissions: (liaisonId) => apiClient.get(`/liaisons/${liaisonId}/task-submissions`).then(response => {
      return {
        data: {
          success: response.data.status === 'success',
          data: response.data.data || []
        }
      };
    }),
    updateSubmissionStatus: (submissionId, status) => apiClient.put(`/tasks/submissions/${submissionId}/status`, { status }).then(response => {
      return {
        data: {
          success: response.data.status === 'success',
          data: response.data.data || {}
        }
      };
    }),
    deleteSubmission: (submissionId) => apiClient.delete(`/tasks/submissions/${submissionId}`).then(response => {
      return {
        data: {
          success: response.data.status === 'success',
          data: response.data.data || {}
        }
      };
    }),
    deleteSubmissionAttachment: (attachmentId) => apiClient.delete(`/tasks/submissions/attachments/${attachmentId}`).then(response => {
      return {
        data: {
          success: response.data.status === 'success',
          data: response.data.data || {}
        }
      };
    }),
  },

  // Message related API calls
  messages: {
    getConversation: (user1Id, user2Id) => 
      apiClient.get(`/messages/conversation/${user1Id}/${user2Id}`)
        .then(response => ({
          success: response.data.status === 'success',
          data: response.data.data || response.data.messages || []
        }))
        .catch(error => {
          console.error('Error fetching conversation:', error);
          return { success: false, data: [] };
        }),
        
    getRecentConversations: (userId) => 
      apiClient.get(`/messages/conversations/${userId}`)
        .then(response => ({
          success: response.data.status === 'success',
          data: response.data.data || response.data.conversations || []
        }))
        .catch(error => {
          console.error('Error fetching conversations:', error);
          return { success: false, data: [] };
        }),
        
    sendMessage: (messageData) => {
      console.log('Sending message with data:', JSON.stringify(messageData));
      return apiClient.post('/messages', messageData)
        .then(response => {
          console.log('Send message response:', JSON.stringify(response.data));
          return {
            success: response.data.status === 'success',
            data: response.data.data || response.data.message || {}
          };
        })
        .catch(error => {
          console.error('Error sending message:', error);
          if (error.response) {
            console.error('Error response data:', JSON.stringify(error.response.data));
            console.error('Error response status:', error.response.status);
          }
          return { success: false, data: {} };
        });
    },
    
    sendMessageWithAttachments: (formData) => {
      console.log('Sending message with attachments');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      return apiClient.post('/messages/with-attachments', formData, config)
        .then(response => {
          console.log('Send message with attachments response:', JSON.stringify(response.data));
          return {
            success: response.data.status === 'success',
            data: response.data.data || response.data.message || {}
          };
        })
        .catch(error => {
          console.error('Error sending message with attachments:', error);
          if (error.response) {
            console.error('Error response data:', JSON.stringify(error.response.data));
            console.error('Error response status:', error.response.status);
          }
          return { success: false, data: {} };
        });
    },
    
    markAsRead: (senderId, receiverId) => 
      apiClient.put(`/messages/read/${senderId}/${receiverId}`)
        .then(response => ({
          success: response.data.status === 'success'
        }))
        .catch(error => {
          console.error('Error marking messages as read:', error);
          return { success: false };
        }),
        
    getUnreadCount: (userId) => 
      apiClient.get(`/messages/unread/${userId}`)
        .then(response => ({
          success: response.data.status === 'success',
          data: response.data.data || { unread_count: 0 }
        }))
        .catch(error => {
          console.error('Error getting unread count:', error);
          return { success: false, data: { unread_count: 0 } };
        }),
        
    updateUserStatus: (userId, isOnline) => 
      apiClient.put(`/messages/status/${userId}`, { is_online: isOnline })
        .then(response => ({
          success: response.data.status === 'success'
        }))
        .catch(error => {
          console.error('Error updating user status:', error);
          return { success: false };
        }),
        
    getUserStatus: (userId) => 
      apiClient.get(`/messages/status/${userId}`)
        .then(response => ({
          success: response.data.status === 'success',
          data: response.data.data || {}
        }))
        .catch(error => {
          console.error('Error getting user status:', error);
          return { success: false, data: {} };
        }),
  },

  // Add more API endpoints as needed
};

export default apiService;