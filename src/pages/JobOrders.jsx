import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PauseCircle as PauseCircleIcon,
  Assignment as AssignmentIcon,
  AttachFile as AttachFileIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config/api';

const JobOrders = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState([]);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [jobOrders, setJobOrders] = useState([]);
  const [unassignedJobOrders, setUnassignedJobOrders] = useState([]);
  const [assignedJobOrders, setAssignedJobOrders] = useState([]);
  const [liaisons, setLiaisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    project_id: '',
    service_id: '',
    description: '',
    status: 'PENDING',
    progress: 0,
    due_date: '',
    assigned_to: '',
    liaison_id: '',
  });

  // Services state
  const [services, setServices] = useState([]);

  // Add new state variables for submission review
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [approveRejectDialogOpen, setApproveRejectDialogOpen] = useState(false);
  const [approveRejectAction, setApproveRejectAction] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    liaison: '',
    dateRange: '',
  });

  // Fetch projects and services on component mount
  useEffect(() => {
    fetchProjects();
    fetchServices();
    fetchLiaisons();
  }, []);

  // Fetch job orders when selected project changes
  useEffect(() => {
    if (projects.length > 0) {
      const projectId = projects[selectedProjectIndex]?.id;
      if (projectId) {
        fetchJobOrdersByProject(projectId);
      }
    }
  }, [selectedProjectIndex, projects]);

  // Fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await window.api.project.getAll();
      if (response && response.success) {
        setProjects(response.data || []);
      } else {
        setError('Failed to load projects: ' + (response?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error in fetchProjects:', err);
      setError('Error loading projects: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch services from API
  const fetchServices = async () => {
    try {
      const response = await window.api.service.getAll();
      if (response && response.success) {
        setServices(response.data || []);
      } else {
        console.error('Failed to load services:', response?.message);
      }
    } catch (err) {
      console.error('Error in fetchServices:', err);
    }
  };

  // Fetch liaisons from API
  const fetchLiaisons = async () => {
    try {
      const response = await window.api.user.getAll();
      console.log('Liaisons response:', response);

      if (response && response.success) {
        // Filter users with liaison role
        const liaisonUsers = response.data.filter(user => user.role === 'liaison');
        console.log('Filtered liaisons:', liaisonUsers);
        setLiaisons(liaisonUsers || []);
      } else {
        console.error('Failed to load liaisons:', response?.message);
      }
    } catch (err) {
      console.error('Error in fetchLiaisons:', err);
    }
  };

  // Fetch job orders by project
  const fetchJobOrdersByProject = async projectId => {
    setLoading(true);
    try {
      console.log('Fetching job orders for project:', projectId);

      // Try to get unassigned and assigned job orders
      try {
        const [unassignedResponse, assignedResponse] = await Promise.all([
          window.api.jobOrders.getUnassignedByProject(projectId),
          window.api.jobOrders.getAssignedByProject(projectId),
        ]);

        console.log('Unassigned response:', unassignedResponse);
        console.log('Assigned response:', assignedResponse);

        if (unassignedResponse && unassignedResponse.success) {
          setUnassignedJobOrders(unassignedResponse.data || []);
        } else {
          console.error('Failed to load unassigned job orders:', unassignedResponse?.message);
          setUnassignedJobOrders([]);
        }

        if (assignedResponse && assignedResponse.success) {
          setAssignedJobOrders(assignedResponse.data || []);
        } else {
          console.error('Failed to load assigned job orders:', assignedResponse?.message);
          setAssignedJobOrders([]);
        }

        // Set jobOrders to empty array since we're using unassignedJobOrders and assignedJobOrders
        setJobOrders([]);
      } catch (err) {
        console.error(
          'Error fetching unassigned/assigned job orders, falling back to getByProject:',
          err
        );

        // Fall back to regular getByProject endpoint
        const response = await window.api.jobOrders.getByProject(projectId);
        console.log('Regular job orders response:', response);

        if (response && response.success) {
          // Split job orders into unassigned and assigned based on is_assigned field
          const unassigned = response.data.filter(
            job => !job.is_assigned || job.is_assigned === '0'
          );
          const assigned = response.data.filter(
            job => job.is_assigned === '1' || job.is_assigned === 1
          );

          setJobOrders([]);
          setUnassignedJobOrders(unassigned);
          setAssignedJobOrders(assigned);
        } else {
          console.error('Failed to load job orders:', response?.message);
          setJobOrders([]);
          setUnassignedJobOrders([]);
          setAssignedJobOrders([]);
          setError('Failed to load job orders: ' + (response?.message || 'Unknown error'));
        }
      }
    } catch (err) {
      console.error('Error in fetchJobOrdersByProject:', err);
      setError('Error loading job orders: ' + (err?.message || 'Unknown error'));
      setJobOrders([]);
      setUnassignedJobOrders([]);
      setAssignedJobOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedProjectIndex(newValue);
  };

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle create dialog open
  const handleCreateDialogOpen = () => {
    setFormData({
      project_id: projects[selectedProjectIndex]?.id || '',
      service_id: '',
      description: '',
      status: 'PENDING',
      progress: 0,
      due_date: '',
      assigned_to: '',
      liaison_id: '',
    });
    setCreateDialogOpen(true);
  };

  // Handle create job order
  const handleCreateJobOrder = async () => {
    setLoading(true);
    try {
      const response = await window.api.jobOrders.create(formData);
      if (response && response.success) {
        setSuccess('Job order created successfully');
        setCreateDialogOpen(false);
        fetchJobOrdersByProject(formData.project_id);
      } else {
        setError('Failed to create job order: ' + (response?.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Error creating job order: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle edit dialog open
  const handleEditDialogOpen = jobOrder => {
    setSelectedJobOrder(jobOrder);
    setFormData({
      project_id: jobOrder.project_id,
      service_id: jobOrder.service_id,
      description: jobOrder.description,
      status: jobOrder.status,
      progress: jobOrder.progress || 0,
      due_date: jobOrder.due_date,
      assigned_to: jobOrder.assigned_to,
      liaison_id: jobOrder.liaison_id,
    });
    setEditDialogOpen(true);
  };

  // Handle edit job order
  const handleEditJobOrder = async () => {
    if (!selectedJobOrder) return;

    setLoading(true);
    try {
      const response = await window.api.jobOrders.update(selectedJobOrder.id, formData);
      if (response && response.success) {
        setSuccess('Job order updated successfully');
        setEditDialogOpen(false);
        fetchJobOrdersByProject(formData.project_id);
      } else {
        setError('Failed to update job order: ' + (response?.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Error updating job order: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = jobOrder => {
    setSelectedJobOrder(jobOrder);
    setDeleteDialogOpen(true);
  };

  // Handle delete job order
  const handleDeleteJobOrder = async () => {
    if (!selectedJobOrder) return;

    setLoading(true);
    try {
      const response = await window.api.jobOrders.delete(selectedJobOrder.id);
      if (response && response.success) {
        setSuccess('Job order deleted successfully');
        setDeleteDialogOpen(false);
        fetchJobOrdersByProject(selectedJobOrder.project_id);
      } else {
        setError('Failed to delete job order: ' + (response?.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Error deleting job order: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle status dialog open
  const handleStatusDialogOpen = (jobOrder, status) => {
    setSelectedJobOrder(jobOrder);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedJobOrder || !newStatus) return;

    setLoading(true);
    try {
      const response = await window.api.jobOrders.update(selectedJobOrder.id, {
        ...selectedJobOrder,
        status: newStatus,
      });

      if (response && response.success) {
        setSuccess(`Job order status updated to ${newStatus}`);
        setStatusDialogOpen(false);
        fetchJobOrdersByProject(projects[selectedProjectIndex]?.id);
      } else {
        setError('Failed to update job order status: ' + (response?.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Error updating job order status: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle assign dialog open
  const handleAssignDialogOpen = jobOrder => {
    setSelectedJobOrder(jobOrder);
    setFormData({
      ...formData,
      liaison_id: '',
    });
    setAssignDialogOpen(true);
  };

  // Handle assign job order
  const handleAssignJobOrder = async () => {
    if (!selectedJobOrder || !formData.liaison_id) {
      setError('Please select a liaison');
      return;
    }

    setLoading(true);
    try {
      console.log(
        'Assigning job order:',
        selectedJobOrder.job_order_id,
        'to liaison:',
        formData.liaison_id
      );

      const assignmentData = {
        job_order_id: selectedJobOrder.job_order_id,
        liaison_id: formData.liaison_id,
        status: 'In Progress',
        notes: 'Assigned from job orders page',
      };

      console.log('Assignment data:', assignmentData);

      const response = await window.api.jobOrders.assign(assignmentData);
      console.log('Assign response:', response);

      if (response && response.success) {
        setSuccess('Job order assigned successfully');
        setAssignDialogOpen(false);
        fetchJobOrdersByProject(projects[selectedProjectIndex]?.id);
      } else {
        setError('Failed to assign job order: ' + (response?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error in handleAssignJobOrder:', err);
      setError('Error assigning job order: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to ensure URLs use the correct API base URL
  const ensureCorrectApiUrl = url => {
    if (!url) return '';
    if (url.includes('localhost:4005')) {
      return url.replace('http://localhost:4005', API_BASE_URL);
    }
    return url;
  };

  // Handle view submission dialog open
  const handleViewSubmissionDialogOpen = async jobOrder => {
    setSelectedJobOrder(jobOrder);
    setSubmissionLoading(true);
    setSubmissionDialogOpen(true);

    try {
      // Get the job order details with submission data
      const response = await window.api.jobOrders.getById(jobOrder.job_order_id);

      console.log('Job order details response:', response);

      if (response.success && response.data) {
        // Check if there's submission data
        if (response.data.submission) {
          // Get the latest submission if it's an array
          let submissionData;
          if (
            Array.isArray(response.data.submission.data) &&
            response.data.submission.data.length > 0
          ) {
            submissionData =
              response.data.submission.data[response.data.submission.data.length - 1];
          } else {
            submissionData = response.data.submission;
          }

          // Parse expenses data if it's a JSON string
          if (submissionData.expenses_data && typeof submissionData.expenses_data === 'string') {
            try {
              submissionData.expenses = JSON.parse(submissionData.expenses_data);
            } catch (e) {
              console.error('Error parsing expenses data:', e);
              submissionData.expenses = [];
            }
          }

          // Process attachments to ensure URLs are properly formatted
          if (submissionData.attachments && Array.isArray(submissionData.attachments)) {
            submissionData.attachments = submissionData.attachments.map(attachment => {
              // Use the API method to get the full URL
              if (attachment.file_url) {
                // Ensure the URL is absolute
                if (!attachment.file_url.startsWith('http')) {
                  attachment.full_url = `${API_BASE_URL}${
                    attachment.file_url.startsWith('/') ? '' : '/'
                  }${attachment.file_url}`;
                } else {
                  // If the URL is already absolute but contains localhost:4005, replace it with API_BASE_URL
                  if (attachment.file_url.includes('localhost:4005')) {
                    attachment.full_url = attachment.file_url.replace(
                      'http://localhost:4005',
                      API_BASE_URL
                    );
                  } else {
                    attachment.full_url = attachment.file_url;
                  }
                }
              } else if (attachment.file_path) {
                // Ensure the URL is absolute
                if (!attachment.file_path.startsWith('http')) {
                  attachment.full_url = `${API_BASE_URL}${
                    attachment.file_path.startsWith('/') ? '' : '/'
                  }${attachment.file_path}`;
                } else {
                  // If the URL is already absolute but contains localhost:4005, replace it with API_BASE_URL
                  if (attachment.file_path.includes('localhost:4005')) {
                    attachment.full_url = attachment.file_path.replace(
                      'http://localhost:4005',
                      API_BASE_URL
                    );
                  } else {
                    attachment.full_url = attachment.file_path;
                  }
                }
              }
              return attachment;
            });
          }

          setSubmissionData(submissionData);
        } else {
          setError('No submission data found for this job order.');
        }
      } else {
        setError('Failed to fetch job order details: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Failed to fetch submission data. Please try again.');
      console.error('Error fetching submission data:', err);
    }

    setSubmissionLoading(false);
  };

  // Handle submission dialog close
  const handleSubmissionDialogClose = () => {
    setSubmissionDialogOpen(false);
    setSubmissionData(null);
  };

  // Handle approve/reject dialog open
  const handleApproveRejectDialogOpen = action => {
    setApproveRejectAction(action);
    setApproveRejectDialogOpen(true);
  };

  // Handle approve/reject submission
  const handleApproveRejectSubmission = async () => {
    try {
      if (!submissionData || !selectedJobOrder) {
        setError('No submission data found.');
        return;
      }

      // Update job order status based on approval/rejection
      let newStatus = selectedJobOrder.status; // Keep current status by default

      if (approveRejectAction === 'REJECT') {
        // If rejected, set job order status back to IN PROGRESS
        newStatus = 'IN PROGRESS';
      } else if (approveRejectAction === 'APPROVE') {
        // If approved, set to COMPLETED
        newStatus = 'COMPLETED';
      }

      // Update the job order status
      const jobOrderResponse = await window.api.jobOrders.update(selectedJobOrder.job_order_id, {
        status: newStatus,
      });

      console.log(jobOrderResponse);
      if (jobOrderResponse.success) {
        // If there's a submission ID, try to update its status too (if the API supports it)
        if (submissionData.id) {
          try {
            // This is optional and depends on if your API supports this endpoint
            await window.api.jobOrders.updateSubmissionStatus(
              submissionData.id,
              approveRejectAction === 'APPROVE' ? 'APPROVED' : 'REJECTED'
            );
          } catch (err) {
            console.log('Submission status update not supported or failed:', err);
            // Continue anyway since we've already updated the job order status
          }
        }

        setApproveRejectDialogOpen(false);
        setSubmissionDialogOpen(false);
        setSuccess(
          `Submission ${approveRejectAction === 'APPROVE' ? 'approved' : 'rejected'} successfully`
        );

        // Refresh job orders
        const projectId = projects[selectedProjectIndex]?.id;
        if (projectId) {
          fetchJobOrdersByProject(projectId);
        }
      } else {
        setError(
          'Failed to update job order status: ' + (jobOrderResponse.message || 'Unknown error')
        );
      }
    } catch (err) {
      setError('Failed to process submission. Please try again.');
      console.error('Error processing submission:', err);
    }
  };

  // Calculate total expenses
  const calculateTotalExpenses = expenses => {
    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) return 0;

    return expenses
      .reduce((total, expense) => {
        const amount = parseFloat(expense.amount);
        return total + (isNaN(amount) ? 0 : amount);
      }, 0)
      .toFixed(2);
  };

  // Get status chip color
  const getStatusColor = status => {
    const normalizedStatus = status ? status.toUpperCase() : '';

    switch (normalizedStatus) {
      case 'PENDING':
        return 'default';
      case 'IN PROGRESS':
        return 'primary';
      case 'ON HOLD':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'SUBMITTED':
        return 'info';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get service name by ID
  const getServiceName = serviceId => {
    const service = services.find(s => s.id === serviceId || s.service_id === serviceId);
    return service ? service.service_name : 'Unknown Service';
  };

  // Calculate overall completion percentage
  const calculateOverallProgress = () => {
    const allJobOrders = [...unassignedJobOrders, ...assignedJobOrders];
    if (allJobOrders.length === 0) return 0;

    const completedCount = allJobOrders.filter(job => job.status === 'COMPLETED').length;

    return Math.round((completedCount / allJobOrders.length) * 100);
  };

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    const allJobOrders = [...unassignedJobOrders, ...assignedJobOrders];
    const incompleteTasks = allJobOrders.filter(
      job => job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && job.due_date
    );

    if (incompleteTasks.length === 0) return null;

    const today = new Date();
    const daysRemaining = incompleteTasks.map(job => {
      const dueDate = new Date(job.due_date);
      const diffTime = dueDate - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });

    return Math.min(...daysRemaining);
  };

  // Calculate status counts
  const calculateStatusCounts = () => {
    const allJobOrders = [...unassignedJobOrders, ...assignedJobOrders];
    return {
      total: allJobOrders.length,
      pending: allJobOrders.filter(job => job.status === 'PENDING').length,
      inProgress: allJobOrders.filter(job => job.status === 'IN PROGRESS').length,
      onHold: allJobOrders.filter(job => job.status === 'ON HOLD').length,
      completed: allJobOrders.filter(job => job.status === 'COMPLETED').length,
      cancelled: allJobOrders.filter(job => job.status === 'CANCELLED').length,
      submitted: allJobOrders.filter(job => job.status === 'SUBMITTED').length,
    };
  };

  // Sort and filter job orders
  const getFilteredAndSortedJobOrders = jobOrders => {
    // First, filter the job orders
    const filtered = jobOrders.filter(job => {
      const matchesSearch =
        filters.search === '' ||
        job.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.service_name?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === '' || job.status === filters.status;

      const matchesLiaison = filters.liaison === '' || job.liaison_id === filters.liaison;

      const matchesDateRange =
        filters.dateRange === '' ||
        (() => {
          const jobDate = new Date(job.created_at);
          const today = new Date();
          switch (filters.dateRange) {
            case 'today':
              return jobDate.toDateString() === today.toDateString();
            case 'week':
              const weekAgo = new Date(today.setDate(today.getDate() - 7));
              return jobDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
              return jobDate >= monthAgo;
            default:
              return true;
          }
        })();

      return matchesSearch && matchesStatus && matchesLiaison && matchesDateRange;
    });

    // Then, sort by status priority
    return filtered.sort((a, b) => {
      const statusPriority = {
        PENDING: 0,
        IN_PROGRESS: 1,
        ON_HOLD: 2,
        CANCELLED: 3,
        COMPLETED: 4,
      };

      return (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
    });
  };

  // Get filtered and sorted job orders
  const filteredUnassignedJobOrders = getFilteredAndSortedJobOrders(unassignedJobOrders);
  const filteredAssignedJobOrders = getFilteredAndSortedJobOrders(assignedJobOrders);

  // Handle filter changes
  const handleFilterChange = event => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      liaison: '',
      dateRange: '',
    });
  };

  if (loading && projects.length === 0) {
    return (
      <Layout title="Job Orders" showBreadcrumbs={false}>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Job Orders" showBreadcrumbs={false}>
      <PageHeader
        title="Job Orders"
        subtitle="Manage and track all job orders across projects"
        actionButton={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
          >
            Create Job Order
          </Button>
        }
      />

      <Box>
        {/* Overall Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Overall Progress</Typography>
            <Typography variant="h6">{calculateOverallProgress()}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={calculateOverallProgress()}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4CAF50',
              },
            }}
          />
        </Box>

        {/* Days Remaining */}
        {calculateDaysRemaining() !== null && (
          <Typography
            variant="subtitle1"
            color={calculateDaysRemaining() < 0 ? 'error' : 'textSecondary'}
            sx={{ mb: 3 }}
          >
            {calculateDaysRemaining() < 0
              ? `Overdue by ${Math.abs(calculateDaysRemaining())} days`
              : `${calculateDaysRemaining()} days remaining until next due date`}
          </Typography>
        )}

        {/* Rest of the existing content */}
        {projects.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">No projects available</Typography>
            <Typography variant="body2" color="textSecondary">
              Create a project first to add job orders.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => navigate('/projects/new')}
            >
              Create Project
            </Button>
          </Paper>
        ) : (
          <>
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={selectedProjectIndex}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                {projects.map((project, index) => (
                  <Tab key={project.id || project.project_id} label={project.project_name} />
                ))}
              </Tabs>
            </Paper>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    {projects[selectedProjectIndex]?.project_name} - Job Orders
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Client: {projects[selectedProjectIndex]?.client_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {projects[selectedProjectIndex]?.status}
                  </Typography>
                </Box>

                {(!filteredUnassignedJobOrders || filteredUnassignedJobOrders.length === 0) &&
                (!filteredAssignedJobOrders || filteredAssignedJobOrders.length === 0) ? (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">No job orders found</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Create a new job order for this project.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={handleCreateDialogOpen}
                    >
                      Create Job Order
                    </Button>
                  </Paper>
                ) : (
                  <>
                    {/* Unassigned Job Orders Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Unassigned Job Orders
                      </Typography>

                      {!filteredUnassignedJobOrders || filteredUnassignedJobOrders.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="body1">No unassigned job orders found</Typography>
                        </Paper>
                      ) : (
                        <Grid container spacing={3}>
                          {filteredUnassignedJobOrders.map(jobOrder => (
                            <Grid item xs={12} sm={6} md={4} key={jobOrder.id}>
                              <Card
                                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                              >
                                <CardContent sx={{ flexGrow: 1 }}>
                                  <Box
                                    sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                                  >
                                    <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                                      {getServiceName(jobOrder.service_id)}
                                    </Typography>
                                    <Chip
                                      label={jobOrder.status}
                                      color={getStatusColor(jobOrder.status)}
                                      size="small"
                                    />
                                  </Box>
                                  <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Due: {formatDate(jobOrder.due_date)}
                                  </Typography>
                                  <Divider sx={{ my: 1 }} />
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    {jobOrder.description}
                                  </Typography>
                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                      Estimated Fee: ₱
                                      {parseFloat(jobOrder.estimated_fee || 0).toFixed(2)}
                                    </Typography>
                                  </Box>
                                </CardContent>
                                <CardActions>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditDialogOpen(jobOrder)}
                                    title="Edit Job Order"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteDialogOpen(jobOrder)}
                                    title="Delete Job Order"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleAssignDialogOpen(jobOrder)}
                                    title="Assign Job Order"
                                  >
                                    <AssignmentIcon />
                                  </IconButton>
                                </CardActions>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>

                    {/* Assigned Job Orders Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Assigned Job Orders
                      </Typography>

                      {!filteredAssignedJobOrders || filteredAssignedJobOrders.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="body1">No assigned job orders found</Typography>
                        </Paper>
                      ) : (
                        <Grid container spacing={3}>
                          {filteredAssignedJobOrders.map(jobOrder => (
                            <Grid item xs={12} sm={6} md={4} key={jobOrder.id}>
                              <Card
                                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                              >
                                <CardContent sx={{ flexGrow: 1 }}>
                                  <Box
                                    sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                                  >
                                    <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                                      {getServiceName(jobOrder.service_id)}
                                    </Typography>
                                    <Chip
                                      label={jobOrder.status}
                                      color={getStatusColor(jobOrder.status)}
                                      size="small"
                                    />
                                  </Box>
                                  <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Due: {formatDate(jobOrder.due_date)}
                                  </Typography>
                                  <Divider sx={{ my: 1 }} />
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    {jobOrder.description}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                    Assigned to: {jobOrder.liaison_name || 'Unknown'}
                                  </Typography>
                                </CardContent>
                                <CardActions>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditDialogOpen(jobOrder)}
                                    title="Edit Job Order"
                                  >
                                    <EditIcon />
                                  </IconButton>

                                  {/* Add View button for SUBMITTED job orders */}
                                  {jobOrder.status === 'SUBMITTED' && (
                                    <IconButton
                                      size="small"
                                      color="info"
                                      onClick={() => handleViewSubmissionDialogOpen(jobOrder)}
                                      title="View Submission"
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                  )}

                                  {jobOrder.status !== 'COMPLETED' &&
                                    jobOrder.status !== 'SUBMITTED' && (
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={() =>
                                          handleStatusDialogOpen(jobOrder, 'COMPLETED')
                                        }
                                        title="Mark as Completed"
                                      >
                                        <CheckCircleIcon />
                                      </IconButton>
                                    )}

                                  {jobOrder.status !== 'ON HOLD' && (
                                    <IconButton
                                      size="small"
                                      color="warning"
                                      onClick={() => handleStatusDialogOpen(jobOrder, 'ON HOLD')}
                                      title="Put On Hold"
                                    >
                                      <PauseCircleIcon />
                                    </IconButton>
                                  )}
                                </CardActions>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Create Job Order Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create New Job Order</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="project-label">Project</InputLabel>
                  <Select
                    labelId="project-label"
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleInputChange}
                    label="Project"
                  >
                    {projects.map(project => (
                      <MenuItem
                        key={project.id || project.project_id}
                        value={project.id || project.project_id}
                      >
                        {project.project_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="service-label">Service</InputLabel>
                  <Select
                    labelId="service-label"
                    name="service_id"
                    value={formData.service_id}
                    onChange={handleInputChange}
                    label="Service"
                  >
                    {services.map(service => (
                      <MenuItem
                        key={service.id || service.service_id}
                        value={service.id || service.service_id}
                      >
                        {service.service_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="IN PROGRESS">In Progress</MenuItem>
                    <MenuItem value="ON HOLD">On Hold</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  name="progress"
                  label="Progress (%)"
                  type="number"
                  value={formData.progress}
                  onChange={handleInputChange}
                  InputProps={{
                    inputProps: { min: 0, max: 100 },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  name="due_date"
                  label="Due Date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="assigned_to"
                  label="Assigned To"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleCreateJobOrder}
              color="primary"
              disabled={loading || !formData.project_id || !formData.service_id}
            >
              {loading ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Job Order Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Job Order</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="project-label">Project</InputLabel>
                  <Select
                    labelId="project-label"
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleInputChange}
                    label="Project"
                  >
                    {projects.map(project => (
                      <MenuItem
                        key={project.id || project.project_id}
                        value={project.id || project.project_id}
                      >
                        {project.project_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="service-label">Service</InputLabel>
                  <Select
                    labelId="service-label"
                    name="service_id"
                    value={formData.service_id}
                    onChange={handleInputChange}
                    label="Service"
                  >
                    {services.map(service => (
                      <MenuItem
                        key={service.id || service.service_id}
                        value={service.id || service.service_id}
                      >
                        {service.service_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="IN PROGRESS">In Progress</MenuItem>
                    <MenuItem value="ON HOLD">On Hold</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  name="progress"
                  label="Progress (%)"
                  type="number"
                  value={formData.progress}
                  onChange={handleInputChange}
                  InputProps={{
                    inputProps: { min: 0, max: 100 },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  name="due_date"
                  label="Due Date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="assigned_to"
                  label="Assigned To"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleEditJobOrder}
              color="primary"
              disabled={loading || !formData.project_id || !formData.service_id}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Job Order</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this job order? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteJobOrder} color="error" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Change Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
          <DialogTitle>Change Job Order Status</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to change the status to "{newStatus}"?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleStatusChange} color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Job Order Dialog */}
        <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
          <DialogTitle>Assign Job Order</DialogTitle>
          <DialogContent>
            <DialogContentText>Select a liaison to assign this job order to.</DialogContentText>
            {liaisons.length === 0 ? (
              <Typography color="error" sx={{ mt: 2 }}>
                No liaisons available. Please add users with liaison role first.
              </Typography>
            ) : (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="liaison-label">Liaison</InputLabel>
                <Select
                  labelId="liaison-label"
                  name="liaison_id"
                  value={formData.liaison_id}
                  onChange={handleInputChange}
                  label="Liaison"
                >
                  {liaisons.map(liaison => (
                    <MenuItem key={liaison.id} value={liaison.id}>
                      {liaison.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleAssignJobOrder}
              color="primary"
              disabled={loading || !formData.liaison_id || liaisons.length === 0}
            >
              {loading ? <CircularProgress size={24} /> : 'Assign'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Submission View Dialog */}
        <Dialog
          open={submissionDialogOpen}
          onClose={handleSubmissionDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Job Order Submission Details
            <IconButton
              aria-label="close"
              onClick={handleSubmissionDialogClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme => theme.palette.grey[500],
              }}
            >
              <CancelIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            {submissionLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : submissionData ? (
              <Box>
                {/* Job Order Info */}
                <Typography variant="h6" gutterBottom>
                  Job Order Information
                </Typography>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Service:</strong> {getServiceName(selectedJobOrder?.service_id)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Description:</strong> {selectedJobOrder?.description}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Status:</strong> {selectedJobOrder?.status}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Assigned to:</strong> {selectedJobOrder?.liaison_name || 'Unknown'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Due Date:</strong> {formatDate(selectedJobOrder?.due_date)}
                  </Typography>
                </Paper>

                {/* Notes */}
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="body1">
                    {submissionData.notes || 'No notes provided.'}
                  </Typography>
                </Paper>

                {/* Expenses */}
                <Typography variant="h6" gutterBottom>
                  Expenses
                </Typography>
                <Paper sx={{ p: 2, mb: 3 }}>
                  {submissionData.expenses &&
                  Array.isArray(submissionData.expenses) &&
                  submissionData.expenses.length > 0 ? (
                    <>
                      <Box sx={{ mb: 2 }}>
                        {submissionData.expenses.map((expense, index) => (
                          <Box
                            key={index}
                            sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                          >
                            <Typography variant="body1">{expense.description}</Typography>
                            <Typography variant="body1">
                              ₱{parseFloat(expense.amount || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="h6">Total</Typography>
                        <Typography variant="h6">
                          ₱{calculateTotalExpenses(submissionData.expenses)}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body1">No expenses reported.</Typography>
                  )}
                </Paper>

                {/* Attachments */}
                <Typography variant="h6" gutterBottom>
                  Attachments
                </Typography>
                <Paper sx={{ p: 2 }}>
                  {submissionData.attachments &&
                  Array.isArray(submissionData.attachments) &&
                  submissionData.attachments.length > 0 ? (
                    <Grid container spacing={2}>
                      {submissionData.attachments.map((attachment, index) => {
                        // Use the full_url property that was set in handleViewSubmissionDialogOpen
                        const imageUrl = ensureCorrectApiUrl(attachment.full_url || '');

                        return (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <AttachFileIcon sx={{ mr: 1 }} />
                                  <Typography variant="body1" noWrap>
                                    {attachment.filename || attachment.file_path || 'Attachment'}
                                  </Typography>
                                </Box>

                                {attachment.file_type &&
                                  attachment.file_type.startsWith('image/') &&
                                  imageUrl && (
                                    <Box sx={{ mt: 1, mb: 1 }}>
                                      <img
                                        src={imageUrl}
                                        alt={attachment.filename || 'Image attachment'}
                                        style={{
                                          maxWidth: '100%',
                                          maxHeight: '150px',
                                          objectFit: 'contain',
                                        }}
                                        onError={e => {
                                          console.error('Image failed to load:', imageUrl);
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    </Box>
                                  )}

                                {imageUrl && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    sx={{ mt: 1 }}
                                    onClick={() => {
                                      // Open the image in a new tab with the correct URL
                                      window.open(ensureCorrectApiUrl(imageUrl), '_blank');
                                    }}
                                  >
                                    Open
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Typography variant="body1">No attachments provided.</Typography>
                  )}
                </Paper>
              </Box>
            ) : (
              <Typography variant="body1">No submission data available.</Typography>
            )}
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
            <Button onClick={handleSubmissionDialogClose} variant="outlined">
              Close
            </Button>

            <Box>
              <Button
                onClick={() => handleApproveRejectDialogOpen('REJECT')}
                variant="contained"
                color="error"
                startIcon={<ThumbDownIcon />}
                sx={{ mr: 1 }}
              >
                Reject
              </Button>

              <Button
                onClick={() => handleApproveRejectDialogOpen('APPROVE')}
                variant="contained"
                color="success"
                startIcon={<ThumbUpIcon />}
              >
                Approve
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Approve/Reject Confirmation Dialog */}
        <Dialog open={approveRejectDialogOpen} onClose={() => setApproveRejectDialogOpen(false)}>
          <DialogTitle>
            {approveRejectAction === 'APPROVE' ? 'Approve Submission' : 'Reject Submission'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {approveRejectAction === 'APPROVE'
                ? 'Are you sure you want to approve this submission?'
                : 'Are you sure you want to reject this submission? This will change the job order status back to IN_PROGRESS.'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApproveRejectDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleApproveRejectSubmission}
              variant="contained"
              color={approveRejectAction === 'APPROVE' ? 'success' : 'error'}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbars for notifications */}
        <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>

        <Snackbar open={Boolean(success)} autoHideDuration={6000} onClose={() => setSuccess(null)}>
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default JobOrders;
