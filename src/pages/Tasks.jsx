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
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PauseCircle as PauseCircleIcon,
  Assignment as AssignmentIcon
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
  
  return (
    <Box sx={{ display: 'flex' }}>
      <Navigation drawerWidth={240} />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Tasks
        </Typography>
        
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
            {tasks.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">No tasks found. Create a new task to get started.</Typography>
                </Paper>
              </Grid>
            ) : (
              tasks.map((task) => (
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
                      
                      {task.status !== 'COMPLETED' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleStatusDialogOpen(task, 'COMPLETED')}
                          title="Mark as Completed"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      
                      {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
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
              ))
            )}
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