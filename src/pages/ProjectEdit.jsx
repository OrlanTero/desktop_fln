import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../components/Layout';

const ProjectEdit = ({ user }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [project, setProject] = useState(null);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [jobOrders, setJobOrders] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [jobOrderDialogOpen, setJobOrderDialogOpen] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching project with ID:', id);

        const [projectResponse, clientsResponse, servicesResponse, jobOrdersResponse] =
          await Promise.all([
            window.api.project.getById(id),
            window.api.client.getAll(),
            window.api.proService.getByProject(id),
            window.api.jobOrders.getByProject(id),
          ]);

        console.log('Project response:', projectResponse);

        if (!projectResponse.success) {
          throw new Error(projectResponse.error || 'Failed to load project');
        }

        if (!projectResponse.data) {
          throw new Error('Project not found');
        }

        // Transform the project data to match the expected format
        const transformedProject = {
          ...projectResponse.data,
          project_id: projectResponse.data.id || projectResponse.data.project_id,
          id: projectResponse.data.id || projectResponse.data.project_id,
        };

        setProject(transformedProject);
        setClients(clientsResponse.data || []);
        setServices(servicesResponse.data || []);
        setJobOrders(jobOrdersResponse.data || []);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError(err.message || 'Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle form changes
  const handleChange = field => event => {
    setProject(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Handle service changes
  const handleServiceChange = field => event => {
    setSelectedService(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Handle job order changes
  const handleJobOrderChange = field => event => {
    setSelectedJobOrder(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Save project
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await window.api.project.update(id, project);
      if (response.success) {
        setSuccess('Project updated successfully');
      } else {
        setError('Failed to update project: ' + response.message);
      }
    } catch (err) {
      setError('Error updating project: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add service
  const handleAddService = async () => {
    try {
      setSaving(true);
      const response = await window.api.service.create({
        ...selectedService,
        project_id: id,
      });
      if (response.success) {
        setServices(prev => [...prev, response.data]);
        setServiceDialogOpen(false);
        setSelectedService(null);
        setSuccess('Service added successfully');
      } else {
        setError('Failed to add service: ' + response.message);
      }
    } catch (err) {
      setError('Error adding service: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add job order
  const handleAddJobOrder = async () => {
    try {
      setSaving(true);
      const response = await window.api.jobOrder.create({
        ...selectedJobOrder,
        project_id: id,
      });
      if (response.success) {
        setJobOrders(prev => [...prev, response.data]);
        setJobOrderDialogOpen(false);
        setSelectedJobOrder(null);
        setSuccess('Job order added successfully');
      } else {
        setError('Failed to add job order: ' + response.message);
      }
    } catch (err) {
      setError('Error adding job order: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete service
  const handleDeleteService = async serviceId => {
    try {
      setSaving(true);
      const response = await window.api.service.delete(serviceId);
      if (response.success) {
        setServices(prev => prev.filter(s => s.id !== serviceId));
        setSuccess('Service deleted successfully');
      } else {
        setError('Failed to delete service: ' + response.message);
      }
    } catch (err) {
      setError('Error deleting service: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete job order
  const handleDeleteJobOrder = async jobOrderId => {
    try {
      setSaving(true);
      const response = await window.api.jobOrder.delete(jobOrderId);
      if (response.success) {
        setJobOrders(prev => prev.filter(j => j.id !== jobOrderId));
        setSuccess('Job order deleted successfully');
      } else {
        setError('Failed to delete job order: ' + response.message);
      }
    } catch (err) {
      setError('Error deleting job order: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Edit Project" user={user}>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout title="Edit Project" user={user}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Project not found</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Project" user={user}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Project Details */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={project.project_name || ''}
                    onChange={handleChange('project_name')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Client</InputLabel>
                    <Select
                      value={project.client_id || ''}
                      onChange={handleChange('client_id')}
                      label="Client"
                    >
                      {clients.map(client => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.client_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={project.start_date || ''}
                    onChange={handleChange('start_date')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={project.due_date || ''}
                    onChange={handleChange('due_date')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    type="number"
                    value={project.total_amount || ''}
                    onChange={handleChange('total_amount')}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={project.status || ''}
                      onChange={handleChange('status')}
                      label="Status"
                    >
                      <MenuItem key="pending" value="PENDING">
                        Pending
                      </MenuItem>
                      <MenuItem key="in-progress" value="IN PROGRESS">
                        In Progress
                      </MenuItem>
                      <MenuItem key="on-hold" value="ON HOLD">
                        On Hold
                      </MenuItem>
                      <MenuItem key="completed" value="COMPLETED">
                        Completed
                      </MenuItem>
                      <MenuItem key="cancelled" value="CANCELLED">
                        Cancelled
                      </MenuItem>
                      <MenuItem key="ready-for-billing" value="READY_FOR_BILLING">
                        Ready for Billing
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={project.description || ''}
                    onChange={handleChange('description')}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Services */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Services</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedService({
                      service_name: '',
                      description: '',
                      amount: 0,
                      quantity: 1,
                    });
                    setServiceDialogOpen(true);
                  }}
                >
                  Add Service
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map(service => (
                      <TableRow key={service.id}>
                        <TableCell>{service.service_name}</TableCell>
                        <TableCell>{service.description}</TableCell>
                        <TableCell>{service.quantity}</TableCell>
                        <TableCell>₱{(service.amount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          ₱{((service.amount || 0) * (service.quantity || 1)).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleDeleteService(service.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Job Orders */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Job Orders</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedJobOrder({
                      job_order_number: '',
                      description: '',
                      status: 'PENDING',
                    });
                    setJobOrderDialogOpen(true);
                  }}
                >
                  Add Job Order
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Job Order Number</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobOrders.map(jobOrder => (
                      <TableRow key={jobOrder.id}>
                        <TableCell>{jobOrder.job_order_number || 'N/A'}</TableCell>
                        <TableCell>{jobOrder.description || 'No description'}</TableCell>
                        <TableCell>
                          <Chip
                            label={jobOrder.status}
                            color={
                              jobOrder.status === 'COMPLETED'
                                ? 'success'
                                : jobOrder.status === 'IN PROGRESS'
                                ? 'primary'
                                : jobOrder.status === 'PENDING'
                                ? 'warning'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleDeleteJobOrder(jobOrder.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Service Dialog */}
        <Dialog open={serviceDialogOpen} onClose={() => setServiceDialogOpen(false)}>
          <DialogTitle>Add Service</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Service Name"
                  value={selectedService?.service_name || ''}
                  onChange={handleServiceChange('service_name')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={selectedService?.description || ''}
                  onChange={handleServiceChange('description')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={selectedService?.quantity || 1}
                  onChange={handleServiceChange('quantity')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={selectedService?.amount || 0}
                  onChange={handleServiceChange('amount')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setServiceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddService} disabled={saving}>
              {saving ? <CircularProgress size={24} /> : 'Add Service'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Job Order Dialog */}
        <Dialog open={jobOrderDialogOpen} onClose={() => setJobOrderDialogOpen(false)}>
          <DialogTitle>Add Job Order</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Order Number"
                  value={selectedJobOrder?.job_order_number || ''}
                  onChange={handleJobOrderChange('job_order_number')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={selectedJobOrder?.description || ''}
                  onChange={handleJobOrderChange('description')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedJobOrder?.status || 'PENDING'}
                    onChange={handleJobOrderChange('status')}
                    label="Status"
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="IN PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setJobOrderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddJobOrder} disabled={saving}>
              {saving ? <CircularProgress size={24} /> : 'Add Job Order'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbars */}
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

export default ProjectEdit;
