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
  ListItemText,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  Grid,
  TablePagination,
  LinearProgress,
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
import Layout from '../components/Layout';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import {
  Send as SendIcon,
  FilterList as FilterIcon,
  Task as TaskIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const Projects = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
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

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    client: '',
    dateRange: '',
    progressRange: '',
  });

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      const response = await window.api.client.getAll();
      if (response && response.success) {
        setClients(response.data || []);
      } else {
        setError('Failed to load clients: ' + (response?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error in fetchClients:', err);
      setError('Error loading clients: ' + (err?.message || 'Unknown error'));
    }
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  // Filter projects based on search and filter criteria
  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      filters.search === '' ||
      project.project_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.client_name.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === '' || project.status === filters.status;

    const matchesClient = filters.client === '' || project.client_id === filters.client;

    const matchesDateRange =
      filters.dateRange === '' ||
      (() => {
        const projectDate = new Date(project.created_at);
        const today = new Date();
        switch (filters.dateRange) {
          case 'today':
            return projectDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date(today.setDate(today.getDate() - 7));
            return projectDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
            return projectDate >= monthAgo;
          default:
            return true;
        }
      })();

    const matchesProgress =
      filters.progressRange === '' ||
      (() => {
        const progress = (project.completed_tasks / project.total_tasks) * 100;
        switch (filters.progressRange) {
          case 'not-started':
            return progress === 0;
          case 'in-progress':
            return progress > 0 && progress < 100;
          case 'completed':
            return progress === 100;
          default:
            return true;
        }
      })();

    return matchesSearch && matchesStatus && matchesClient && matchesDateRange && matchesProgress;
  });

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
  const handleEditProject = id => {
    navigate(`/projects/edit/${id}`);
  };

  // Handle view project
  const handleViewProject = id => {
    navigate(`/projects/view/${id}`);
  };

  // Handle delete project
  const handleDeleteClick = project => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      // Use selectedProject.id instead of selectedProject.project_id
      const projectId = selectedProject.id || selectedProject.project_id;

      // First delete all services associated with this project
      await window.api.proService.deleteByProject(projectId);

      // Then delete the project
      const response = await window.api.project.delete(projectId);
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
    console.log('handleStatusClick - project:', project);
    console.log('handleStatusClick - status:', status);
    setSelectedProject(project);
    setNewStatus(status);
    setStatusDialogOpen(true);
    handleMenuClose();
  };

  const handleStatusConfirm = async () => {
    console.log('handleStatusConfirm - selectedProject:', selectedProject);
    console.log('handleStatusConfirm - newStatus:', newStatus);
    if (!selectedProject || !newStatus) return;

    setLoading(true);
    try {
      // Use selectedProject.id instead of selectedProject.project_id
      const projectId = selectedProject.id || selectedProject.project_id;
      console.log('Calling updateStatus with:', projectId, { status: newStatus });
      const response = await window.api.project.updateStatus(projectId, { status: newStatus });

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
  const handlePaymentClick = project => {
    setSelectedProject(project);
    setPaymentAmount(0);
    setPaymentDialogOpen(true);
    handleMenuClose();
  };

  const handlePaymentConfirm = async () => {
    if (!selectedProject || paymentAmount <= 0) return;

    setLoading(true);
    try {
      // Use selectedProject.id instead of selectedProject.project_id
      const projectId = selectedProject.id || selectedProject.project_id;
      const response = await window.api.project.updatePaidAmount(
        projectId,
        parseFloat(paymentAmount)
      );

      if (response.success) {
        setSuccess(`Payment of ₱${paymentAmount} recorded successfully`);
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
    console.log('handleMenuOpen - project:', project);
    setAnchorEl(event.currentTarget);
    setMenuProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuProject(null);
  };

  // Get status chip color
  const getStatusColor = status => {
    // Normalize status to uppercase for comparison
    const normalizedStatus = status ? status.toUpperCase() : '';

    switch (normalizedStatus) {
      case 'NOT STARTED':
      case 'PENDING':
        return 'warning';
      case 'IN PROGRESS':
        return 'info';
      case 'ON HOLD':
        return 'default';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
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

  // Calculate payment status
  const getPaymentStatus = project => {
    const total = parseFloat(project.total_amount || 0);
    const paid = parseFloat(project.paid_amount || 0);

    if (paid === 0) return 'Not Paid';
    if (paid < total) return 'Partially Paid';
    return 'Fully Paid';
  };

  const getPaymentStatusColor = status => {
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

  // Add progress calculation function
  const calculateProgress = project => {
    // If no tasks, return 0
    if (!project.total_tasks || project.total_tasks === 0) return 0;

    // If completed_tasks is undefined, treat as 0
    const completedTasks = project.completed_tasks || 0;

    // Calculate percentage
    return Math.round((completedTasks / project.total_tasks) * 100);
  };

  // Get paginated data
  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter changes
  const handleFilterChange = event => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setPage(0); // Reset to first page when filters change
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      client: '',
      dateRange: '',
      progressRange: '',
    });
    setPage(0);
  };

  const handleLogout = () => {
    handleMenuClose();
    if (onLogout) onLogout();
    navigate('/login');
  };

  // User menu component
  const userMenu = (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ mr: 2 }}>
        {user?.name || 'User'}
      </Typography>
      <Avatar
        onClick={handleMenuOpen}
        sx={{ cursor: 'pointer' }}
        src={user?.photo_url}
        alt={user?.name || 'User'}
      >
        {!user?.photo_url && <AccountCircle />}
      </Avatar>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );

  if (loading && projects.length === 0) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Layout title="Projects" userMenu={userMenu}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Projects</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
          >
            Create Project
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search projects..."
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
                  <MenuItem value="IN PROGRESS">In Progress</MenuItem>
                  <MenuItem value="ON HOLD">On Hold</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Client</InputLabel>
                <Select
                  name="client"
                  value={filters.client}
                  onChange={handleFilterChange}
                  label="Client"
                >
                  <MenuItem value="">All</MenuItem>
                  {clients.map(client => (
                    <MenuItem key={client.client_id} value={client.client_id}>
                      {client.client_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Progress</InputLabel>
                <Select
                  name="progressRange"
                  value={filters.progressRange}
                  onChange={handleFilterChange}
                  label="Progress"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="not-started">Not Started</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProjects.map(project => (
                  <TableRow key={project.project_id}>
                    <TableCell>{project.project_name}</TableCell>
                    <TableCell>{project.client_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={project.status}
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(project)}
                          sx={{ flexGrow: 1 }}
                        />
                        <Typography variant="body2">{calculateProgress(project)}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(project.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(project.due_date).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewTasks(project.project_id)}
                      >
                        <TaskIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewTimeline(project.project_id)}
                      >
                        <TimelineIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={() => handleOpenDialog('edit', project)}>
                        <EditIcon />
                      </IconButton>
                      {project.status !== 'COMPLETED' && project.status !== 'CANCELLED' && (
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDialog('delete', project)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProjects.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Actions Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handlePaymentClick(menuProject)}>
            <ListItemIcon>
              <PaymentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Record Payment</ListItemText>
          </MenuItem>
          <MenuItem
            disabled={menuProject?.status?.toUpperCase() === 'IN PROGRESS'}
            onClick={() => handleStatusClick(menuProject, 'IN PROGRESS')}
          >
            <ListItemIcon>
              <AssignmentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as In Progress</ListItemText>
          </MenuItem>
          <MenuItem
            disabled={menuProject?.status?.toUpperCase() === 'ON HOLD'}
            onClick={() => handleStatusClick(menuProject, 'ON HOLD')}
          >
            <ListItemIcon>
              <PauseCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Put On Hold</ListItemText>
          </MenuItem>
          <MenuItem
            disabled={menuProject?.status?.toUpperCase() === 'COMPLETED'}
            onClick={() => handleStatusClick(menuProject, 'COMPLETED')}
          >
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Completed</ListItemText>
          </MenuItem>
          <MenuItem
            disabled={menuProject?.status?.toUpperCase() === 'CANCELLED'}
            onClick={() => handleStatusClick(menuProject, 'CANCELLED')}
          >
            <ListItemIcon>
              <CancelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cancel Project</ListItemText>
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the project "{selectedProject?.project_name}"? This
              action cannot be undone.
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
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
          <DialogTitle>Change Project Status</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to change the status of project "{selectedProject?.project_name}
              " to "{newStatus}"?
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
        <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Record a payment for project "{selectedProject?.project_name}".
            </DialogContentText>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Total Amount: ₱{parseFloat(selectedProject?.total_amount || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Paid Amount: ₱{parseFloat(selectedProject?.paid_amount || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Remaining: ₱
                {(
                  parseFloat(selectedProject?.total_amount || 0) -
                  parseFloat(selectedProject?.paid_amount || 0)
                ).toFixed(2)}
              </Typography>
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="Payment Amount"
              type="number"
              fullWidth
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₱</InputAdornment>,
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

export default Projects;
