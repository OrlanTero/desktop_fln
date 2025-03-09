import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
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
  Divider,
  FormHelperText,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PauseCircle as PauseCircleIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  AttachFile as AttachFileIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Search as SearchIcon,
  Filter as FilterIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import Navigation from '../components/Navigation';

const Tasks = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // State
  const [tasks, setTasks] = useState([]);
  const [liaisons, setLiaisons] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    liaison_id: '',
    service_id: '',
    description: '',
    status: 'PENDING',
    due_date: null
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({
    liaison_id: '',
    description: ''
  });
  
  // Add new state variables
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [approveRejectDialogOpen, setApproveRejectDialogOpen] = useState(false);
  const [approveRejectAction, setApproveRejectAction] = useState('');
  
  // Add filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    liaison: '',
    service: '',
    dateRange: '',
  });
  
  // Fetch tasks, liaisons, services, and service categories on component mount
  useEffect(() => {
    fetchTasks();
    fetchLiaisons();
    fetchServices();
    fetchServiceCategories();
  }, []);
  
  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await window.api.task.getAll();
      console.log(response);
      if (response.success) {
        setTasks(response.data || []);
      } else {
        setError('Failed to fetch tasks. Please try again.');
        console.error('Error fetching tasks:', response.message);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
      setLoading(false);
      console.error('Error fetching tasks:', err);
    }
  };
  
  // Fetch liaisons (users) from API
  const fetchLiaisons = async () => {
    try {
      const response = await window.api.user.getAllByRole('liaison');
      if (response.success) {
        setLiaisons(response.data || []);
      } else {
        console.error('Error fetching liaisons:', response.message);
      }
    } catch (err) {
      console.error('Error fetching liaisons:', err);
    }
  };
  
  // Fetch services from API
  const fetchServices = async () => {
    try {
      const response = await window.api.service.getAll();
      if (response.success) {
        setServices(response.data || []);
      } else {
        console.error('Error fetching services:', response.message);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };
  
  // Fetch service categories from API
  const fetchServiceCategories = async () => {
    try {
      const response = await window.api.serviceCategory.getAll();
      if (response.success) {
        setServiceCategories(response.data || []);
      } else {
        console.error('Error fetching service categories:', response.message);
      }
    } catch (err) {
      console.error('Error fetching service categories:', err);
    }
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for the field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      due_date: date ? format(date, 'yyyy-MM-dd') : null
    });
  };
  
  // Validate form
  const validateForm = () => {
    let valid = true;
    const errors = {
      liaison_id: '',
      description: ''
    };
    
    if (!formData.liaison_id) {
      errors.liaison_id = 'Liaison is required';
      valid = false;
    }
    
    if (!formData.description) {
      errors.description = 'Description is required';
      valid = false;
    }
    
    setFormErrors(errors);
    return valid;
  };
  
  // Handle create dialog open
  const handleCreateDialogOpen = () => {
    setFormData({
      liaison_id: '',
      service_id: '',
      description: '',
      status: 'PENDING',
      due_date: null
    });
    setFormErrors({
      liaison_id: '',
      description: ''
    });
    setCreateDialogOpen(true);
  };
  
  // Handle create task
  const handleCreateTask = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await window.api.task.create(formData);

      console.log(response);
      if (response.success) {
        setCreateDialogOpen(false);
        setSuccess('Task created successfully');
        fetchTasks();
      } else {
        setError('Failed to create task: ' + response.message);
      }
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    }
  };
  
  // Handle edit dialog open
  const handleEditDialogOpen = (task) => {
    setSelectedTask(task);
    setFormData({
      liaison_id: task.liaison_id,
      service_id: task.service_id || '',
      description: task.description,
      status: task.status,
      due_date: task.due_date
    });
    setFormErrors({
      liaison_id: '',
      description: ''
    });
    setEditDialogOpen(true);
  };
  
  // Handle edit task
  const handleEditTask = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await window.api.task.update(selectedTask.id, formData);
      if (response.success) {
        setEditDialogOpen(false);
        setSuccess('Task updated successfully');
        fetchTasks();
      } else {
        setError('Failed to update task: ' + response.message);
      }
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
    }
  };
  
  // Handle delete dialog open
  const handleDeleteDialogOpen = (task) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };
  
  // Handle delete task
  const handleDeleteTask = async () => {
    try {
      const response = await window.api.task.delete(selectedTask.id);
      if (response.success) {
        setDeleteDialogOpen(false);
        setSuccess('Task deleted successfully');
        fetchTasks();
      } else {
        setError('Failed to delete task: ' + response.message);
      }
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    }
  };
  
  // Handle status dialog open
  const handleStatusDialogOpen = (task, status) => {
    setSelectedTask(task);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };
  
  // Handle status change
  const handleStatusChange = async () => {
    console.log(selectedTask, newStatus)
    try {
      const response = await window.api.task.updateStatus(selectedTask.id, { status: newStatus });

      console.log(response);
      if (response.success) {
        setStatusDialogOpen(false);
        setSuccess('Task status updated successfully');
        fetchTasks();
      } else {
        setError('Failed to update task status: ' + response.message);
      }
    } catch (err) {
      setError('Failed to update task status. Please try again.');
      console.error('Error updating task status:', err);
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'warning',
          icon: <PauseCircleIcon />
        };
      case 'IN_PROGRESS':
        return {
          color: 'info',
          icon: <AssignmentIcon />
        };
      case 'COMPLETED':
        return {
          color: 'success',
          icon: <CheckCircleIcon />
        };
      case 'CANCELLED':
        return {
          color: 'error',
          icon: <CancelIcon />
        };
      case 'SUBMITTED':
        return {
          color: 'primary',
          icon: <VisibilityIcon />
        };
      default:
        return {
          color: 'default',
          icon: null
        };
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      return dateString;
    }
  };
  
  // Get service name
  const getServiceName = (serviceId) => {
    if (!serviceId) return 'No service';
    
    const service = services.find(s => s.service_id === serviceId);
    return service ? service.service_name : 'Unknown service';
  };
  
  // Get service category name
  const getServiceCategoryName = (serviceId) => {
    if (!serviceId) return '';
    
    const service = services.find(s => s.service_id === serviceId);
    return service ? service.service_category_name : '';
  };
  
  // Get liaison name
  const getLiaisonName = (liaisonId) => {
    const liaison = liaisons.find(l => l.id === liaisonId);
    return liaison ? liaison.name : 'Unknown liaison';
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setError(null);
    setSuccess(null);
  };
  
  // Handle view submission dialog open
  const handleViewSubmissionDialogOpen = async (task) => {
    setSelectedTask(task);
    setSubmissionLoading(true);
    setSubmissionDialogOpen(true);
    
    try {
      // Get the task details with submission data
      const response = await window.api.task.getById(task.id);
      
      console.log(response);
      
      if (response.success && response.data) {
        // Check if there's submission data
        if (response.data.submission) {
          // Get the latest submission if it's an array
          let submissionData;
          if (Array.isArray(response.data.submission.data) && response.data.submission.data.length > 0) {
            submissionData = response.data.submission.data[response.data.submission.data.length - 1];
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
                  attachment.full_url = `http://localhost:4005${attachment.file_url.startsWith('/') ? '' : '/'}${attachment.file_url}`;
                } else {
                  attachment.full_url = attachment.file_url;
                }
              } else if (attachment.file_path) {
                // Ensure the URL is absolute
                if (!attachment.file_path.startsWith('http')) {
                  attachment.full_url = `http://localhost:4005${attachment.file_path.startsWith('/') ? '' : '/'}${attachment.file_path}`;
                } else {
                  attachment.full_url = attachment.file_path;
                }
              }
              return attachment;
            });
          }
          
          setSubmissionData(submissionData);
        } else {
          setError('No submission data found for this task.');
        }
      } else {
        setError('Failed to fetch task details: ' + (response.message || 'Unknown error'));
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
  const handleApproveRejectDialogOpen = (action) => {
    setApproveRejectAction(action);
    setApproveRejectDialogOpen(true);
  };
  
  // Handle approve/reject submission
  const handleApproveRejectSubmission = async () => {
    try {
      if (!submissionData || !selectedTask) {
        setError('No submission data found.');
        return;
      }
      
      // Update task status based on approval/rejection
      let newTaskStatus = selectedTask.status; // Keep current status by default
      
      if (approveRejectAction === 'REJECT') {
        // If rejected, set task status back to IN_PROGRESS
        newTaskStatus = 'IN_PROGRESS';
      } else if (approveRejectAction === 'APPROVE') {
        // If approved, keep as SUBMITTED or potentially change to COMPLETED
        // Depending on your business logic
        newTaskStatus = 'COMPLETED';
      }
      
      // Update the task status
      const taskResponse = await window.api.task.updateStatus(selectedTask.id, { status: newTaskStatus });
      
      if (taskResponse.success) {
        // If there's a submission ID, try to update its status too (if the API supports it)
        if (submissionData.id) {
          try {
            // This is optional and depends on if your API supports this endpoint
            await window.api.task.updateSubmissionStatus(
              submissionData.id, 
              approveRejectAction === 'APPROVE' ? 'APPROVED' : 'REJECTED'
            );
          } catch (err) {
            console.log('Submission status update not supported or failed:', err);
            // Continue anyway since we've already updated the task status
          }
        }
        
        setApproveRejectDialogOpen(false);
        setSubmissionDialogOpen(false);
        setSuccess(`Submission ${approveRejectAction === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
        fetchTasks();
      } else {
        setError('Failed to update task status: ' + (taskResponse.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Failed to process submission. Please try again.');
      console.error('Error processing submission:', err);
    }
  };
  
  // Calculate total expenses
  const calculateTotalExpenses = (expenses) => {
    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) return 0;
    
    return expenses.reduce((total, expense) => {
      const amount = parseFloat(expense.amount);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0).toFixed(2);
  };
  
  // Calculate status counts
  const calculateStatusCounts = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'PENDING').length,
      inProgress: tasks.filter(task => task.status === 'IN_PROGRESS').length,
      completed: tasks.filter(task => task.status === 'COMPLETED').length,
      cancelled: tasks.filter(task => task.status === 'CANCELLED').length,
      submitted: tasks.filter(task => task.status === 'SUBMITTED').length
    };
  };

  // Add getFilteredAndSortedTasks function
  const getFilteredAndSortedTasks = () => {
    // First, filter the tasks
    const filtered = tasks.filter(task => {
      const matchesSearch = filters.search === '' || 
        task.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        getServiceName(task.service_id).toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === '' || task.status === filters.status;
      
      const matchesLiaison = filters.liaison === '' || task.liaison_id === filters.liaison;
      
      const matchesService = filters.service === '' || task.service_id === filters.service;
      
      const matchesDateRange = filters.dateRange === '' || (() => {
        const taskDate = new Date(task.created_at);
        const today = new Date();
        switch (filters.dateRange) {
          case 'today':
            return taskDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date(today.setDate(today.getDate() - 7));
            return taskDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
            return taskDate >= monthAgo;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesLiaison && matchesService && matchesDateRange;
    });

    // Then, sort by status priority
    return filtered.sort((a, b) => {
      const statusPriority = {
        'PENDING': 0,
        'IN_PROGRESS': 1,
        'ON_HOLD': 2,
        'CANCELLED': 3,
        'COMPLETED': 4
      };
      
      return (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
    });
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      liaison: '',
      service: '',
      dateRange: '',
    });
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ width: 240, flexShrink: 0 }}>
        <Navigation user={user} onLogout={onLogout} />
      </Box>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto', height: '100%' }}>
        <Typography variant="h4" gutterBottom>
          Tasks
        </Typography>
        
        {/* Add status count cards */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
                <Typography variant="h6" color="textSecondary">Total</Typography>
                <Typography variant="h4">{calculateStatusCounts().total}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                <Typography variant="h6" color="warning.main">Pending</Typography>
                <Typography variant="h4">{calculateStatusCounts().pending}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                <Typography variant="h6" color="primary.main">In Progress</Typography>
                <Typography variant="h4">{calculateStatusCounts().inProgress}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff8e1' }}>
                <Typography variant="h6" color="warning.dark">On Hold</Typography>
                <Typography variant="h4">{calculateStatusCounts().onHold}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="h6" color="success.main">Completed</Typography>
                <Typography variant="h4">{calculateStatusCounts().completed}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                <Typography variant="h6" color="error.main">Cancelled</Typography>
                <Typography variant="h4">{calculateStatusCounts().cancelled}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {/* Add filter controls */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search tasks..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="ON_HOLD">On Hold</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Liaison</InputLabel>
                <Select
                  name="liaison"
                  value={filters.liaison}
                  onChange={handleFilterChange}
                  label="Liaison"
                >
                  <MenuItem value="">All</MenuItem>
                  {liaisons.map((liaison) => (
                    <MenuItem key={liaison.id} value={liaison.id}>
                      {liaison.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Service</InputLabel>
                <Select
                  name="service"
                  value={filters.service}
                  onChange={handleFilterChange}
                  label="Service"
                >
                  <MenuItem value="">All</MenuItem>
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.service_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  label="Date Range"
                >
                  <MenuItem value="">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleResetFilters}
                startIcon={<FilterIcon />}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
          >
            Add New Task
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {getFilteredAndSortedTasks().map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                        {task.description.length > 50 ? `${task.description.substring(0, 50)}...` : task.description}
                      </Typography>
                      <Chip
                        label={task.status}
                        color={getStatusColor(task.status).color}
                        icon={getStatusColor(task.status).icon}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Liaison:</strong> {task.liaison_name}
                    </Typography>
                    
                    {task.service_id && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Service:</strong> {task.service_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Category:</strong> {task.service_category_name}
                        </Typography>
                      </>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Due Date:</strong> {formatDate(task.due_date)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      <strong>Created:</strong> {formatDate(task.created_at)}
                    </Typography>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditDialogOpen(task)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteDialogOpen(task)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                    
                    {/* Add View button for SUBMITTED tasks */}
                    {task.status === 'SUBMITTED' && (
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewSubmissionDialogOpen(task)}
                        title="View Submission"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    )}
                    
                    {task.status !== 'COMPLETED' && task.status !== 'SUBMITTED' && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleStatusDialogOpen(task, 'COMPLETED')}
                        title="Mark as Completed"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}
                    
                    {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && task.status !== 'SUBMITTED' && (
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleStatusDialogOpen(task, 'IN_PROGRESS')}
                        title="Mark as In Progress"
                      >
                        <AssignmentIcon />
                      </IconButton>
                    )}
                    
                    {task.status !== 'CANCELLED' && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleStatusDialogOpen(task, 'CANCELLED')}
                        title="Cancel Task"
                      >
                        <CancelIcon />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Create Task Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }} error={!!formErrors.liaison_id}>
                <InputLabel id="liaison-label">Liaison</InputLabel>
                <Select
                  labelId="liaison-label"
                  id="liaison_id"
                  name="liaison_id"
                  value={formData.liaison_id}
                  onChange={handleInputChange}
                  label="Liaison"
                >
                  {liaisons.map((liaison) => (
                    <MenuItem key={liaison.id} value={liaison.id}>
                      {liaison.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.liaison_id && <FormHelperText>{formErrors.liaison_id}</FormHelperText>}
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="service-label">Service (Optional)</InputLabel>
                <Select
                  labelId="service-label"
                  id="service_id"
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleInputChange}
                  label="Service (Optional)"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {serviceCategories.map((category) => [
                    <MenuItem key={`category-${category.service_category_id}`} disabled divider>
                      {category.service_category_name}
                    </MenuItem>,
                    ...services
                      .filter((service) => service.service_category_id === category.service_category_id)
                      .map((service) => (
                        <MenuItem key={service.service_id} value={service.service_id}>
                          &nbsp;&nbsp;{service.service_name}
                        </MenuItem>
                      ))
                  ])}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="normal"
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date (Optional)"
                  value={formData.due_date ? new Date(formData.due_date) : null}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Edit Task Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }} error={!!formErrors.liaison_id}>
                <InputLabel id="edit-liaison-label">Liaison</InputLabel>
                <Select
                  labelId="edit-liaison-label"
                  id="edit_liaison_id"
                  name="liaison_id"
                  value={formData.liaison_id}
                  onChange={handleInputChange}
                  label="Liaison"
                >
                  {liaisons.map((liaison) => (
                    <MenuItem key={liaison.id} value={liaison.id}>
                      {liaison.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.liaison_id && <FormHelperText>{formErrors.liaison_id}</FormHelperText>}
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="edit-service-label">Service (Optional)</InputLabel>
                <Select
                  labelId="edit-service-label"
                  id="edit_service_id"
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleInputChange}
                  label="Service (Optional)"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {serviceCategories.map((category) => [
                    <MenuItem key={`category-${category.service_category_id}`} disabled divider>
                      {category.service_category_name}
                    </MenuItem>,
                    ...services
                      .filter((service) => service.service_category_id === category.service_category_id)
                      .map((service) => (
                        <MenuItem key={service.service_id} value={service.service_id}>
                          &nbsp;&nbsp;{service.service_name}
                        </MenuItem>
                      ))
                  ])}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="normal"
                id="edit_description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="edit-status-label">Status</InputLabel>
                <Select
                  labelId="edit-status-label"
                  id="edit_status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date (Optional)"
                  value={formData.due_date ? new Date(formData.due_date) : null}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditTask} variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Task Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteTask} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Status Change Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
          <DialogTitle>Change Task Status</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to change the status of this task to {newStatus.replace('_', ' ')}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleStatusChange} variant="contained" color="primary">
              Confirm
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
            Task Submission Details
            <IconButton
              aria-label="close"
              onClick={handleSubmissionDialogClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
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
                {/* Task Info */}
                <Typography variant="h6" gutterBottom>
                  Task Information
                </Typography>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Description:</strong> {selectedTask?.description}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Status:</strong> {selectedTask?.status}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Liaison:</strong> {selectedTask?.liaison_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Due Date:</strong> {formatDate(selectedTask?.due_date)}
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
                  {submissionData.expenses && Array.isArray(submissionData.expenses) && submissionData.expenses.length > 0 ? (
                    <>
                      <Box sx={{ mb: 2 }}>
                        {submissionData.expenses.map((expense, index) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1">{expense.description}</Typography>
                            <Typography variant="body1">${parseFloat(expense.amount || 0).toFixed(2)}</Typography>
                          </Box>
                        ))}
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="h6">Total</Typography>
                        <Typography variant="h6">${calculateTotalExpenses(submissionData.expenses)}</Typography>
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
                  {submissionData.attachments && Array.isArray(submissionData.attachments) && submissionData.attachments.length > 0 ? (
                    <Grid container spacing={2}>
                      {submissionData.attachments.map((attachment, index) => {
                        // Use the full_url property that was set in handleViewSubmissionDialogOpen
                        const imageUrl = attachment.full_url || '';
                        
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
                                
                                {attachment.file_type && attachment.file_type.startsWith('image/') && imageUrl && (
                                  <Box sx={{ mt: 1, mb: 1 }}>
                                    <img 
                                      src={imageUrl} 
                                      alt={attachment.filename || 'Image attachment'}
                                      style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
                                      onError={(e) => {
                                        console.error('Image failed to load:', imageUrl);
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </Box>
                                )}
                                
                                {imageUrl && (
                                  <Button 
                                    variant="outlined" 
                                    size="small" 
                                    sx={{ mt: 1 }}
                                    onClick={() => {
                                      // Create a new browser window directly
                                      const viewerWindow = window.open('', '_blank', 'width=800,height=600');
                                      
                                      if (viewerWindow) {
                                        // Get the filename from the attachment or extract it from the URL
                                        const filename = attachment.filename || imageUrl.split('/').pop() || 'Attachment';
                                        console.log('Opening attachment in new window:', imageUrl, filename);
                                        
                                        // Write HTML content directly to the new window
                                        viewerWindow.document.write(`
                                          <!DOCTYPE html>
                                          <html>
                                            <head>
                                              <title>${filename}</title>
                                              <style>
                                                body {
                                                  margin: 0;
                                                  padding: 0;
                                                  background-color: #2c2c2c;
                                                  display: flex;
                                                  flex-direction: column;
                                                  height: 100vh;
                                                  font-family: Arial, sans-serif;
                                                }
                                                .image-container {
                                                  flex: 1;
                                                  display: flex;
                                                  justify-content: center;
                                                  align-items: center;
                                                  overflow: auto;
                                                }
                                                img {
                                                  max-width: 100%;
                                                  max-height: 100%;
                                                  object-fit: contain;
                                                }
                                                .toolbar {
                                                  background-color: #333;
                                                  color: white;
                                                  padding: 10px;
                                                  text-align: center;
                                                }
                                                button {
                                                  background-color: #4CAF50;
                                                  border: none;
                                                  color: white;
                                                  padding: 8px 16px;
                                                  text-align: center;
                                                  text-decoration: none;
                                                  display: inline-block;
                                                  font-size: 14px;
                                                  margin: 4px 2px;
                                                  cursor: pointer;
                                                  border-radius: 4px;
                                                }
                                                .error-message {
                                                  color: red;
                                                  background-color: #ffeeee;
                                                  padding: 20px;
                                                  border-radius: 5px;
                                                  margin: 20px;
                                                  text-align: center;
                                                  display: none;
                                                }
                                              </style>
                                            </head>
                                            <body>
                                              <div class="image-container">
                                                <img src="${imageUrl}" alt="${filename}" onerror="document.getElementById('error-message').style.display='block';">
                                                <div id="error-message" class="error-message">
                                                  <h3>Error Loading Image</h3>
                                                  <p>The image could not be loaded. It might not exist or you might not have permission to view it.</p>
                                                  <p>URL: ${imageUrl}</p>
                                                </div>
                                              </div>
                                              <div class="toolbar">
                                                <button onclick="window.print()">Print</button>
                                                <button onclick="window.close()">Close</button>
                                              </div>
                                              <script>
                                                // Add event listener to handle image load errors
                                                document.querySelector('img').addEventListener('error', function() {
                                                  document.getElementById('error-message').style.display = 'block';
                                                  this.style.display = 'none';
                                                });
                                              </script>
                                            </body>
                                          </html>
                                        `);
                                        viewerWindow.document.close();
                                      } else {
                                        console.error('Failed to open new window');
                                        // Fallback: try to open in the same window
                                        window.open(imageUrl, '_blank');
                                      }
                                    }}
                                  >
                                    View
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
            <Button 
              onClick={handleSubmissionDialogClose} 
              variant="outlined"
            >
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
                : 'Are you sure you want to reject this submission? This will change the task status back to IN_PROGRESS.'}
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
        
        {/* Snackbars for success and error messages */}
        <Snackbar open={!!success} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
        
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Tasks; 