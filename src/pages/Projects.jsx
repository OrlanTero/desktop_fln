import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Navigation from '../components/Navigation';
import { format } from 'date-fns';

const Projects = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // State
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProject, setMenuProject] = useState(null);
  
  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);
  
  // Filter projects when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project => 
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchTerm, projects]);
  
  // Fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Check if API is properly initialized
      if (!window.api || !window.api.project) {
        console.error('API not properly initialized');
        setError('API not properly initialized. Please restart the application.');
        setLoading(false);
        return;
      }
      
      const response = await window.api.project.getAll();
      if (response && response.success) {
        setProjects(response.data || []);
        setFilteredProjects(response.data || []);
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
  
  // Handle create new project
  const handleCreateProject = () => {
    navigate('/projects/new');
  };
  
  // Handle edit project
  const handleEditProject = (id) => {
    navigate(`/projects/edit/${id}`);
  };
  
  // Handle view project
  const handleViewProject = (id) => {
    navigate(`/projects/view/${id}`);
  };
  
  // Handle delete project
  const handleDeleteClick = (project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      // First delete all services associated with this project
      await window.api.proService.deleteByProject(selectedProject.project_id);
      
      // Then delete the project
      const response = await window.api.project.delete(selectedProject.project_id);
      if (response.success) {
        setSuccess('Project deleted successfully');
        fetchProjects();
      } else {
        setError('Failed to delete project: ' + response.message);
      }
    } catch (err) {
      setError('Error deleting project: ' + err.message);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    }
  };
  
  // Handle status change
  const handleStatusClick = (project, status) => {
    setSelectedProject(project);
    setNewStatus(status);
    setStatusDialogOpen(true);
    handleMenuClose();
  };
  
  const handleStatusConfirm = async () => {
    if (!selectedProject || !newStatus) return;
    
    setLoading(true);
    try {
      const response = await window.api.project.updateStatus(
        selectedProject.project_id,
        newStatus
      );
      
      if (response.success) {
        setSuccess(`Project status updated to ${newStatus}`);
        fetchProjects();
      } else {
        setError('Failed to update project status: ' + response.message);
      }
    } catch (err) {
      setError('Error updating project status: ' + err.message);
    } finally {
      setLoading(false);
      setStatusDialogOpen(false);
      setSelectedProject(null);
      setNewStatus('');
    }
  };
  
  // Handle payment
  const handlePaymentClick = (project) => {
    setSelectedProject(project);
    setPaymentAmount(0);
    setPaymentDialogOpen(true);
    handleMenuClose();
  };
  
  const handlePaymentConfirm = async () => {
    if (!selectedProject || paymentAmount <= 0) return;
    
    setLoading(true);
    try {
      const response = await window.api.project.updatePaidAmount(
        selectedProject.project_id,
        parseFloat(selectedProject.paid_amount || 0) + parseFloat(paymentAmount)
      );
      
      if (response.success) {
        setSuccess(`Payment of $${paymentAmount} recorded successfully`);
        fetchProjects();
      } else {
        setError('Failed to record payment: ' + response.message);
      }
    } catch (err) {
      setError('Error recording payment: ' + err.message);
    } finally {
      setLoading(false);
      setPaymentDialogOpen(false);
      setSelectedProject(null);
      setPaymentAmount(0);
    }
  };
  
  // Menu handlers
  const handleMenuOpen = (event, project) => {
    setAnchorEl(event.currentTarget);
    setMenuProject(project);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuProject(null);
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'default';
      case 'In Progress':
        return 'primary';
      case 'On Hold':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Cancelled':
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
  
  // Calculate payment status
  const getPaymentStatus = (project) => {
    const total = parseFloat(project.total_amount || 0);
    const paid = parseFloat(project.paid_amount || 0);
    
    if (paid === 0) return 'Not Paid';
    if (paid < total) return 'Partially Paid';
    return 'Fully Paid';
  };
  
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Not Paid':
        return 'error';
      case 'Partially Paid':
        return 'warning';
      case 'Fully Paid':
        return 'success';
      default:
        return 'default';
    }
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
          Projects
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
          >
            Create New Project
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search projects by name or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell align="right">Paid Amount</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {loading ? 'Loading projects...' : 'No projects found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => {
                    const paymentStatus = getPaymentStatus(project);
                    
                    return (
                      <TableRow key={project.project_id}>
                        <TableCell>{project.project_name}</TableCell>
                        <TableCell>{project.client_name}</TableCell>
                        <TableCell>{formatDate(project.start_date)}</TableCell>
                        <TableCell>{formatDate(project.end_date)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={project.status} 
                            color={getStatusColor(project.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">${parseFloat(project.total_amount || 0).toFixed(2)}</TableCell>
                        <TableCell align="right">${parseFloat(project.paid_amount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={paymentStatus} 
                            color={getPaymentStatusColor(paymentStatus)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewProject(project.project_id)}
                            title="View Project"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleEditProject(project.project_id)}
                            title="Edit Project"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="default"
                            onClick={(e) => handleMenuOpen(e, project)}
                            title="More Actions"
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(project)}
                            title="Delete Project"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handlePaymentClick(menuProject)}>
            <ListItemIcon>
              <PaymentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Record Payment</ListItemText>
          </MenuItem>
          <MenuItem disabled={menuProject?.status === 'In Progress'} onClick={() => handleStatusClick(menuProject, 'In Progress')}>
            <ListItemIcon>
              <AssignmentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as In Progress</ListItemText>
          </MenuItem>
          <MenuItem disabled={menuProject?.status === 'On Hold'} onClick={() => handleStatusClick(menuProject, 'On Hold')}>
            <ListItemIcon>
              <PauseCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Put On Hold</ListItemText>
          </MenuItem>
          <MenuItem disabled={menuProject?.status === 'Completed'} onClick={() => handleStatusClick(menuProject, 'Completed')}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Completed</ListItemText>
          </MenuItem>
          <MenuItem disabled={menuProject?.status === 'Cancelled'} onClick={() => handleStatusClick(menuProject, 'Cancelled')}>
            <ListItemIcon>
              <CancelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cancel Project</ListItemText>
          </MenuItem>
        </Menu>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Project</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the project "{selectedProject?.project_name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Status Change Dialog */}
        <Dialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
        >
          <DialogTitle>Change Project Status</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to change the status of project "{selectedProject?.project_name}" to "{newStatus}"?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleStatusConfirm} color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Payment Dialog */}
        <Dialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
        >
          <DialogTitle>Record Payment</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Record a payment for project "{selectedProject?.project_name}".
            </DialogContentText>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Total Amount: ${parseFloat(selectedProject?.total_amount || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Paid Amount: ${parseFloat(selectedProject?.paid_amount || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Remaining: ${(parseFloat(selectedProject?.total_amount || 0) - parseFloat(selectedProject?.paid_amount || 0)).toFixed(2)}
              </Typography>
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="Payment Amount"
              type="number"
              fullWidth
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentConfirm} 
              color="primary" 
              disabled={loading || paymentAmount <= 0}
            >
              {loading ? <CircularProgress size={24} /> : 'Record Payment'}
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

export default Projects; 