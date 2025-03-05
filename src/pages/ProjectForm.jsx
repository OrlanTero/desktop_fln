import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { format, parse } from 'date-fns';
import Navigation from '../components/Navigation';

const ProjectForm = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // State for project data
  const [formData, setFormData] = useState({
    project_name: '',
    client_id: '',
    proposal_id: '',
    attn_to: '',
    start_date: null,
    end_date: null,
    description: '',
    priority: 'Medium',
    status: 'Not Started',
    total_amount: 0,
    paid_amount: 0,
    notes: ''
  });
  
  // State for services
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  
  // State for data loading
  const [clients, setClients] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Calculate totals
  const calculateSubtotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };
  
  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch clients
        const clientsResponse = await window.api.client.getAll();
        if (clientsResponse.success) {
          setClients(clientsResponse.data || []);
        }
        
        // Fetch proposals
        const proposalsResponse = await window.api.proposal.getAll();
        if (proposalsResponse.success) {
          // Filter only accepted proposals
          const acceptedProposals = proposalsResponse.data.filter(
            proposal => proposal.status === 'Accepted'
          );
          setProposals(acceptedProposals || []);
        }
        
        // Fetch service categories
        const categoriesResponse = await window.api.serviceCategory.getAll();
        if (categoriesResponse.success) {
          setServiceCategories(categoriesResponse.data || []);
        }
        
        // If in edit mode, fetch project data
        if (isEditMode) {
          const projectResponse = await window.api.project.getById(id);
          if (projectResponse.success && projectResponse.data) {
            const project = projectResponse.data;
            setFormData({
              ...project,
              start_date: project.start_date ? new Date(project.start_date) : null,
              end_date: project.end_date ? new Date(project.end_date) : null
            });
            
            // Fetch services for this project
            const servicesResponse = await window.api.proService.getByProject(id);
            if (servicesResponse.success) {
              setSelectedServices(servicesResponse.data || []);
            }
          } else {
            setError('Failed to load project data');
          }
        }
      } catch (err) {
        setError('Error loading data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode]);
  
  // Load services when category changes
  useEffect(() => {
    const fetchServices = async () => {
      if (!selectedCategory) {
        setServices([]);
        return;
      }
      
      try {
        const response = await window.api.service.getByCategory(selectedCategory);
        if (response.success) {
          setServices(response.data || []);
        } else {
          setError('Failed to load services');
        }
      } catch (err) {
        setError('Error loading services: ' + err.message);
      }
    };
    
    fetchServices();
  }, [selectedCategory]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle date changes
  const handleDateChange = (name, e) => {
    const dateValue = e.target.value ? parse(e.target.value, 'yyyy-MM-dd', new Date()) : null;
    setFormData({
      ...formData,
      [name]: dateValue
    });
  };
  
  // Handle proposal selection
  const handleProposalChange = async (e) => {
    const proposalId = e.target.value;
    setFormData({
      ...formData,
      proposal_id: proposalId
    });
    
    if (proposalId) {
      try {
        // Get proposal details
        const proposalResponse = await window.api.proposal.getById(proposalId);
        if (proposalResponse.success && proposalResponse.data) {
          const proposal = proposalResponse.data;
          
          // Update form with proposal data
          setFormData(prevData => ({
            ...prevData,
            proposal_id: proposalId,
            project_name: proposal.project_name,
            client_id: proposal.client_id,
            attn_to: proposal.attn_to,
            start_date: proposal.project_start ? new Date(proposal.project_start) : null,
            end_date: proposal.project_end ? new Date(proposal.project_end) : null,
            description: proposal.description || '',
            notes: proposal.notes || '',
            total_amount: proposal.total_amount || 0
          }));
          
          // Get services from proposal
          const servicesResponse = await window.api.proService.getByProposal(proposalId);
          if (servicesResponse.success) {
            setSelectedServices(servicesResponse.data || []);
          }
        }
      } catch (err) {
        setError('Error loading proposal data: ' + err.message);
      }
    }
  };
  
  // Add service to the list
  const handleAddService = () => {
    if (!selectedService || quantity <= 0 || unitPrice < 0) {
      setError('Please select a service, and enter valid quantity and price');
      return;
    }
    
    const serviceObj = services.find(s => s.service_id === selectedService);
    if (!serviceObj) return;
    
    // Calculate price with discount
    const totalPrice = quantity * unitPrice;
    const discountAmount = (totalPrice * discount) / 100;
    const finalPrice = totalPrice - discountAmount;
    
    const newService = {
      service_id: selectedService,
      service_name: serviceObj.service_name,
      service_category_id: selectedCategory,
      service_category_name: serviceCategories.find(c => c.service_category_id === selectedCategory)?.service_category_name || '',
      quantity: quantity,
      unit_price: unitPrice,
      discount_percentage: discount,
      price: finalPrice
    };
    
    setSelectedServices([...selectedServices, newService]);
    
    // Reset selection fields
    setSelectedService('');
    setQuantity(1);
    setUnitPrice(0);
    setDiscount(0);
  };
  
  // Remove service from the list
  const handleRemoveService = (index) => {
    const updatedServices = [...selectedServices];
    updatedServices.splice(index, 1);
    setSelectedServices(updatedServices);
  };
  
  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Format dates for API
      const formattedData = {
        ...formData,
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
        total_amount: calculateSubtotal(),
        created_by: localStorage.getItem('userId')
      };
      
      let projectId;
      
      // Create or update project
      if (isEditMode) {
        const response = await window.api.project.update(id, formattedData);
        if (!response.success) {
          throw new Error(response.message || 'Failed to update project');
        }
        projectId = id;
      } else {
        const response = await window.api.project.create(formattedData);
        if (!response.success) {
          throw new Error(response.message || 'Failed to create project');
        }
        projectId = response.data.project_id;
      }
      
      // If editing, delete existing services first
      if (isEditMode) {
        await window.api.proService.deleteByProject(projectId);
      }
      
      // Add services
      for (const service of selectedServices) {
        const serviceData = {
          project_id: projectId,
          service_id: service.service_id,
          pro_type: 'Project',
          quantity: service.quantity,
          unit_price: service.unit_price,
          discount_percentage: service.discount_percentage
        };
        
        await window.api.proService.create(serviceData);
      }
      
      // Update project total
      await window.api.project.update(projectId, { 
        total_amount: calculateSubtotal() 
      });
      
      setSuccess('Project saved successfully');
      
      // Navigate back to projects list after a short delay
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
      
    } catch (err) {
      setError('Error saving project: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/projects');
  };
  
  if (loading && !isEditMode) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Box sx={{ width: 240, flexShrink: 0 }}>
          <Navigation user={user} onLogout={onLogout} />
        </Box>
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
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
          {isEditMode ? 'Edit Project' : 'Create New Project'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {!isEditMode && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Create From Proposal (Optional)
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Accepted Proposal</InputLabel>
                <Select
                  name="proposal_id"
                  value={formData.proposal_id}
                  onChange={handleProposalChange}
                >
                  <MenuItem value="">
                    <em>None (Create from scratch)</em>
                  </MenuItem>
                  {proposals.map((proposal) => (
                    <MenuItem key={proposal.proposal_id} value={proposal.proposal_id}>
                      {proposal.proposal_name} - {proposal.client_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          )}
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Client</InputLabel>
                  <Select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    required
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.client_id} value={client.client_id}>
                        {client.client_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Attention To"
                  name="attn_to"
                  value={formData.attn_to}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="Not Started">Not Started</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  name="start_date"
                  value={formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateChange('start_date', e)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  name="end_date"
                  value={formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateChange('end_date', e)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
              
              {isEditMode && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Total Amount"
                      name="total_amount"
                      type="number"
                      value={formData.total_amount}
                      InputProps={{
                        readOnly: true,
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Paid Amount"
                      name="paid_amount"
                      type="number"
                      value={formData.paid_amount}
                      InputProps={{
                        readOnly: true,
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      margin="normal"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Services
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Service Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {serviceCategories.map((category) => (
                      <MenuItem key={category.service_category_id} value={category.service_category_id}>
                        {category.service_category_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Service</InputLabel>
                  <Select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    disabled={!selectedCategory}
                  >
                    {services.map((service) => (
                      <MenuItem key={service.service_id} value={service.service_id}>
                        {service.service_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  margin="normal"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Unit Price"
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Discount %"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddService}
                  disabled={!selectedService}
                >
                  Add Service
                </Button>
              </Grid>
            </Grid>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Discount</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No services added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedServices.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell>{service.service_category_name}</TableCell>
                        <TableCell>{service.service_name}</TableCell>
                        <TableCell align="right">{service.quantity}</TableCell>
                        <TableCell align="right">${service.unit_price.toFixed(2)}</TableCell>
                        <TableCell align="right">{service.discount_percentage}%</TableCell>
                        <TableCell align="right">${service.price.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveService(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    Total Services: {selectedServices.length}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h6">
                    Total: ${calculateSubtotal().toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update Project' : 'Create Project'}
            </Button>
          </Box>
        </form>
        
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

export default ProjectForm; 