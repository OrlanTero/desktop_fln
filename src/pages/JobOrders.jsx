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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PauseCircle as PauseCircleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import Navigation from '../components/Navigation';
import { format } from 'date-fns';

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
    liaison_id: ''
  });
  
  // Services state
  const [services, setServices] = useState([]);
  
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
  const fetchJobOrdersByProject = async (projectId) => {
    setLoading(true);
    try {
      console.log('Fetching job orders for project:', projectId);
      
      // Try to get unassigned and assigned job orders
      try {
        const [unassignedResponse, assignedResponse] = await Promise.all([
          window.api.jobOrders.getUnassignedByProject(projectId),
          window.api.jobOrders.getAssignedByProject(projectId)
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
        console.error('Error fetching unassigned/assigned job orders, falling back to getByProject:', err);
        
        // Fall back to regular getByProject endpoint
        const response = await window.api.jobOrders.getByProject(projectId);
        console.log('Regular job orders response:', response);
        
        if (response && response.success) {
          // Split job orders into unassigned and assigned based on is_assigned field
          const unassigned = response.data.filter(job => !job.is_assigned || job.is_assigned === '0');
          const assigned = response.data.filter(job => job.is_assigned === '1' || job.is_assigned === 1);
          
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
      liaison_id: ''
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
  const handleEditDialogOpen = (jobOrder) => {
    setSelectedJobOrder(jobOrder);
    setFormData({
      project_id: jobOrder.project_id,
      service_id: jobOrder.service_id,
      description: jobOrder.description,
      status: jobOrder.status,
      progress: jobOrder.progress || 0,
      due_date: jobOrder.due_date,
      assigned_to: jobOrder.assigned_to,
      liaison_id: jobOrder.liaison_id
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
  const handleDeleteDialogOpen = (jobOrder) => {
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
        status: newStatus
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
  const handleAssignDialogOpen = (jobOrder) => {
    setSelectedJobOrder(jobOrder);
    setFormData({
      ...formData,
      liaison_id: ''
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
      console.log('Assigning job order:', selectedJobOrder.job_order_id, 'to liaison:', formData.liaison_id);
      
      const assignmentData = {
        job_order_id: selectedJobOrder.job_order_id,
        liaison_id: formData.liaison_id,
        status: 'In Progress',
        notes: 'Assigned from job orders page'
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
  
  // Get status chip color
  const getStatusColor = (status) => {
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
      default:
        return 'default';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  // Get service name by ID
  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId || s.service_id === serviceId);
    return service ? service.service_name : 'Unknown Service';
  };
  
  if (loading && projects.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ width: 240, flexShrink: 0 }}>
        <Navigation user={user} onLogout={onLogout} />
      </Box>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto', height: '100%' }}>
        <Typography variant="h4" gutterBottom>
          Job Orders
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
            disabled={projects.length === 0}
          >
            Create New Job Order
          </Button>
        </Box>
        
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
                
                {(!unassignedJobOrders || unassignedJobOrders.length === 0) && 
                 (!assignedJobOrders || assignedJobOrders.length === 0) ? (
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
                      
                      {!unassignedJobOrders || unassignedJobOrders.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="body1">No unassigned job orders found</Typography>
                        </Paper>
                      ) : (
                        <Grid container spacing={3}>
                          {unassignedJobOrders.map((jobOrder) => (
                            <Grid item xs={12} sm={6} md={4} key={jobOrder.id}>
                              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                                      Estimated Fee: ${parseFloat(jobOrder.estimated_fee || 0).toFixed(2)}
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
                      
                      {!assignedJobOrders || assignedJobOrders.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="body1">No assigned job orders found</Typography>
                        </Paper>
                      ) : (
                        <Grid container spacing={3}>
                          {assignedJobOrders.map((jobOrder) => (
                            <Grid item xs={12} sm={6} md={4} key={jobOrder.id}>
                              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                                      Progress: {jobOrder.progress || 0}%
                                    </Typography>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={jobOrder.progress || 0} 
                                      sx={{ height: 8, borderRadius: 5 }}
                                    />
                                  </Box>
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
                                  {jobOrder.status !== 'COMPLETED' && (
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => handleStatusDialogOpen(jobOrder, 'COMPLETED')}
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
                    {projects.map((project) => (
                      <MenuItem key={project.id || project.project_id} value={project.id || project.project_id}>
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
                    {services.map((service) => (
                      <MenuItem key={service.id || service.service_id} value={service.id || service.service_id}>
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
                    inputProps: { min: 0, max: 100 }
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
                    {projects.map((project) => (
                      <MenuItem key={project.id || project.project_id} value={project.id || project.project_id}>
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
                    {services.map((service) => (
                      <MenuItem key={service.id || service.service_id} value={service.id || service.service_id}>
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
                    inputProps: { min: 0, max: 100 }
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
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
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
        <Dialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
        >
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
        <Dialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
        >
          <DialogTitle>Assign Job Order</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Select a liaison to assign this job order to.
            </DialogContentText>
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
                  {liaisons.map((liaison) => (
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
        
        {/* Snackbars for notifications */}
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar
          open={Boolean(success)}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
        >
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default JobOrders; 