import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import Layout from '../components/Layout';
import JobOrderList from '../components/JobOrderList';

const ProjectForm = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);
  const isConversion = location.state?.isConversion;
  const proposalData = location.state?.proposalData;
  
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
  
  // Add job order related state
  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);
  const [jobOrderError, setJobOrderError] = useState(null);
  const [localJobOrders, setLocalJobOrders] = useState({});
  
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
            proposal => proposal.status.toLowerCase() === 'accepted'
          );
          setProposals(acceptedProposals || []);
        }
        
        // Fetch service categories
        const categoriesResponse = await window.api.serviceCategory.getAll();
        if (categoriesResponse.success) {
          setServiceCategories(categoriesResponse.data || []);
        }
        
        // If converting from proposal
        if (isConversion && proposalData) {
          setFormData({
            project_name: proposalData.project_name || '',
            client_id: proposalData.client_id || '',
            proposal_id: proposalData.proposal_id || '',
            attn_to: proposalData.attn_to || '',
            start_date: proposalData.project_start ? new Date(proposalData.project_start) : null,
            end_date: proposalData.project_end ? new Date(proposalData.project_end) : null,
            description: proposalData.description || '',
            priority: 'Medium',
            status: 'Not Started',
            total_amount: proposalData.total_amount || 0,
            paid_amount: 0,
            notes: proposalData.notes || ''
          });

          // Fetch services from proposal
          const servicesResponse = await window.api.proService.getByProposal(proposalData.id);
          if (servicesResponse.success) {
            const services = servicesResponse.data.map(service => ({
              ...service,
              price: service.quantity * service.unit_price * (1 - service.discount_percentage / 100)
            }));
            setSelectedServices(services);

            // Fetch job orders for each service
            const jobOrdersMap = {};
            for (const service of services) {
              const jobOrdersResponse = await window.api.jobOrders.getByService(service.service_id, proposalData.id);
              console.log(jobOrdersResponse)
              if (jobOrdersResponse.success) {
                jobOrdersMap[service.service_id] = jobOrdersResponse.data || [];
              }
            }
            setLocalJobOrders(jobOrdersMap);
          }
        }
        // If in edit mode
        else if (isEditMode) {
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
          }
        }
      } catch (err) {
        setError('Error loading data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode, isConversion, proposalData]);
  
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
  
  // Add job order management functions
  const handleManageJobOrders = (service) => {
    setSelectedServiceDetails(service);
    
    if (!localJobOrders[service.service_id]) {
      setLocalJobOrders(prev => ({
        ...prev,
        [service.service_id]: []
      }));
    }
  };
  
  const handleJobOrderUpdate = (serviceId, updatedJobOrders) => {
    setLocalJobOrders(prev => ({
      ...prev,
      [serviceId]: updatedJobOrders
    }));
  };
  
  // Update handleSubmit to include job orders
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Create project first
      const projectData = {
        ...formData,
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
        total_amount: calculateSubtotal(),
        status: 'Pending'
      };

      if (proposalData) {
        projectData.proposal_id = proposalData.id
      }
      
      console.log(projectData, proposalData);
      let projectId;
      if (isEditMode) {
        const response = await window.api.project.update(id, projectData);
        if (!response.success) {
          throw new Error('Failed to update project: ' + response.message);
        }
        projectId = id;
      } else {
        const response = await window.api.project.create(projectData);

        console.log(response)

        if (!response.success) {
          throw new Error('Failed to create project: ' + response.message);
        }
        projectId = response.data; // Make sure this matches the API response structure
      }

      // Add services with the new project_id
      for (const service of selectedServices) {
        const serviceData = {
          project_id: projectId,
          service_id: service.service_id,
          quantity: service.quantity,
          unit_price: service.unit_price,
          price: service.price,
          discount_percentage: service.discount_percentage || 0,
          pro_type: 'Project'
        };

        
        const serviceResponse = await window.api.proService.create(serviceData);
        if (!serviceResponse.success) {
          throw new Error('Failed to add service: ' + serviceResponse.message);
        }

        // Get the created service ID from the response
        const createdServiceId = serviceResponse.data.pro_service_id;
        
        // Add job orders for this service using the new service ID
        const jobOrders = localJobOrders[service.service_id] || [];
        for (const jobOrder of jobOrders) {
          const jobOrderData = {
            description: jobOrder.description,
            estimated_fee: jobOrder.estimated_fee,
            service_id: createdServiceId,
            project_id: projectId,
            proposal_id: proposalData ? proposalData.id : null,
            status: 'Pending'
          };

          console.log(jobOrderData)
          
          const jobOrderResponse = await window.api.jobOrders.create(jobOrderData);
          console.log(jobOrderResponse)
          if (!jobOrderResponse.success) {
            throw new Error('Failed to create job order: ' + jobOrderResponse.message);
          }
        }
      }
      
      // If this is a conversion, update the proposal status
      if (isConversion && proposalData) {
        const updateResponse =await window.api.proposal.updateOnlyStatus(proposalData.id, 'Converted' );
        console.log(updateResponse)
      }
      
      setSuccess('Project saved successfully');
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
      
    } catch (err) {
      setError('Error saving project: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Add job orders UI component
  const renderJobOrders = () => {
    if (!selectedServiceDetails) {
      return null;
    }

    return (
      <Box mt={3}>
        {jobOrderError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setJobOrderError(null)}>
            {jobOrderError}
          </Alert>
        )}
        <Paper sx={{ p: 2 }}>
          <JobOrderList
            serviceId={selectedServiceDetails.service_id}
            projectId={id || 'temp'}
            serviceName={selectedServiceDetails.service_name}
            jobOrders={localJobOrders[selectedServiceDetails.service_id] || []}
            onUpdate={(updatedJobOrders) => handleJobOrderUpdate(selectedServiceDetails.service_id, updatedJobOrders)}
          />
          <Box mt={2}>
            <Button
              variant="outlined"
              onClick={() => setSelectedServiceDetails(null)}
            >
              Close Job Orders
            </Button>
        </Box>
        </Paper>
      </Box>
    );
  };
  
  // Update the services table to include job order management
  const renderServicesTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Service</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Unit Price</TableCell>
            <TableCell align="right">Discount (%)</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedServices.map((service, index) => (
            <TableRow key={index}>
              <TableCell>{service.service_name}</TableCell>
              <TableCell align="right">{service.quantity}</TableCell>
              <TableCell align="right">{service.unit_price}</TableCell>
              <TableCell align="right">{service.discount_percentage || 0}</TableCell>
              <TableCell align="right">{service.price}</TableCell>
              <TableCell align="center">
                <IconButton
                  color="primary"
                  onClick={() => handleManageJobOrders(service)}
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveService(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  return (
    <Layout user={user} onLogout={onLogout}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? 'Edit Project' : isConversion ? 'Convert Proposal to Project' : 'Create New Project'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Client</InputLabel>
                  <Select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    disabled={isConversion}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.client_id} value={client.client_id}>
                        {client.client_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Attention To"
                  name="attn_to"
                  value={formData.attn_to}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  name="start_date"
                  value={formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateChange('start_date', e)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  name="end_date"
                  value={formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateChange('end_date', e)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Services
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
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
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Service</InputLabel>
                  <Select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                  >
                    {services.map((service) => (
                      <MenuItem key={service.service_id} value={service.service_id}>
                        {service.service_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Unit Price (₱)"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Discount (%)"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAddService}
                  startIcon={<AddIcon />}
                  sx={{ height: '100%' }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
            
            {renderServicesTable()}
          </Paper>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/projects')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Saving...' : 'Save Project'}
            </Button>
          </Box>
        </form>
        
        {renderJobOrders()}
        
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
    </Layout>
  );
};

export default ProjectForm; 