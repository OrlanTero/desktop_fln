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
  FormControlLabel,
  Checkbox,
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
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';
import ProposalDocumentNew from '../components/ProposalDocumentNew';
import JobOrderList from '../components/JobOrderList';
import EmailProposalForm from '../components/EmailProposalForm';

const ProposalForm = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // Add step state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Proposal Details', 'Document Preview', 'Send Email'];
  
  // Add company info state
  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    address: '',
    phone: '',
    email: '',
  });
  
  // Add document preview state
  const [documentPreview, setDocumentPreview] = useState(null);
  
  // State for proposal data
  const [formData, setFormData] = useState({
    proposal_name: '',
    proposal_reference: '',
    client_id: '',
    project_name: '',
    project_start: null,
    project_end: null,
    has_downpayment: false,
    downpayment_amount: 0,
    valid_until: null,
    notes: '',
    status: 'Draft',
    attn_to: ''
  });
  
  // Add state to track if document has been uploaded
  const [documentUploaded, setDocumentUploaded] = useState(false);
  
  // State for services
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  
  // State for data loading
  const [clients, setClients] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [currentProposalId, setCurrentProposalId] = useState(null);
  
  // Inside the ProposalForm component, add new state for selected service details
  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);
  const [jobOrderError, setJobOrderError] = useState(null);
  
  // Add local job orders state
  const [localJobOrders, setLocalJobOrders] = useState({});
  
  // Add state for document base64
  const [documentBase64, setDocumentBase64] = useState(null);
  
  // Calculate totals
  const calculateSubtotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };
  
  const calculateDownpayment = () => {
    return formData.has_downpayment ? formData.downpayment_amount : 0;
  };

  const handleDocumentGenerated = (document) => {
    setDocumentBase64(document.base64);
    setDocumentUploaded(true);
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
        
        // Fetch service categories
        const categoriesResponse = await window.api.serviceCategory.getAll();
        if (categoriesResponse.success) {
          setServiceCategories(categoriesResponse.data || []);
        }
        
        // If in edit mode, fetch proposal data
        if (isEditMode) {
          const proposalResponse = await window.api.proposal.getById(id);
          if (proposalResponse.success && proposalResponse.data) {
            const proposal = proposalResponse.data;
            setFormData({
              ...proposal,
              project_start: proposal.project_start ? new Date(proposal.project_start) : null,
              project_end: proposal.project_end ? new Date(proposal.project_end) : null,
              valid_until: proposal.valid_until ? new Date(proposal.valid_until) : null,
              has_downpayment: Boolean(proposal.has_downpayment)
            });
            
            // Fetch services for this proposal
            const servicesResponse = await window.api.proService.getByProposal(id);
            if (servicesResponse.success) {
              setSelectedServices(servicesResponse.data || []);
            }
          } else {
            setError('Failed to load proposal data');
          }
        } else {
          // Generate proposal reference for new proposals
          const year = new Date().getFullYear();
          const lastProposalResponse = await window.api.proposal.getLastReference();
          let increment = 1;
          
          if (lastProposalResponse.success && lastProposalResponse.data) {
            const lastRef = lastProposalResponse.data;
            const lastIncrement = parseInt(lastRef.split('-')[2]);
            increment = lastIncrement + 1;
          }
          
          const proposalReference = `PRO-${year}-${String(increment).padStart(4, '0')}`;
          setFormData(prev => ({
            ...prev,
            proposal_reference: proposalReference
          }));
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
  
  // Load company info
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await window.api.companyInfo.get();
        if (response.success) {
          setCompanyInfo(response.data);
        }
      } catch (err) {
        setError('Error loading company info: ' + err.message);
      }
    };
    
    fetchCompanyInfo();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
    const removedService = updatedServices[index];
    updatedServices.splice(index, 1);
    setSelectedServices(updatedServices);

    // Also remove any associated job orders
    if (removedService) {
      setLocalJobOrders(prev => {
        const updated = { ...prev };
        delete updated[removedService.service_id];
        return updated;
      });
    }
  };
  
  // Handle next step
  const handleNext = async () => {
    if (activeStep === 0) {
      // Save the proposal before moving to document preview
      setLoading(true);
      try {
        // Format dates for API
        const formattedData = {
          ...formData,
          project_start: formData.project_start ? format(formData.project_start, 'yyyy-MM-dd') : null,
          project_end: formData.project_end ? format(formData.project_end, 'yyyy-MM-dd') : null,
          valid_until: formData.valid_until ? format(formData.valid_until, 'yyyy-MM-dd') : null,
          total_amount: calculateSubtotal(),
          status: 'Draft'
        };

        let proposalId;
        
        // Create or update proposal
        if (isEditMode) {
          const response = await window.api.proposal.update(id, formattedData);
          if (!response.success) {
            throw new Error(response.message || 'Failed to update proposal');
          }
          proposalId = id;
        } else {
          const response = await window.api.proposal.create(formattedData);
          console.log('Create proposal response:', response);
          
          if (!response.success) {
            throw new Error(response.message || 'Failed to create proposal');
          }
          proposalId = response.data.proposal_id;
          console.log('Saved proposal ID:', proposalId);

        }
        
        // Update formData with the proposal_id
        setFormData(prev => ({
          ...prev,
          proposal_id: proposalId
        }));
        
        // If editing, delete existing services first
        if (isEditMode) {
          await window.api.proService.deleteByProposal(proposalId);
        }
        
        // Add services
        for (const service of selectedServices) {
          const serviceData = {
            proposal_id: proposalId,
            service_id: service.service_id,
            quantity: service.quantity,
            unit_price: service.unit_price,
            discount: service.discount,
            price: service.price
          };
          
          await window.api.proService.create(serviceData);
        }
        
        setSuccess('Proposal saved successfully');
        setActiveStep((prevStep) => prevStep + 1);
        setCurrentProposalId(proposalId);
      } catch (err) {
        setError('Error saving proposal: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 1) {
      // Before moving to email step, ensure we have the document in base64
      try {
        const response = await window.api.proposal.getDocument(currentProposalId);
        if (!response.success) {
          throw new Error(response.message || 'Failed to get document');
        }
        setDocumentBase64(response.data.base64);
        setActiveStep((prevStep) => prevStep + 1);
      } catch (err) {
        setError('Error getting document: ' + err.message);
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    // Reset document uploaded state when going back to form
    setDocumentUploaded(false);
  };

  // Handle save as draft
  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      const formattedData = {
        ...formData,
        project_start: formData.project_start ? format(formData.project_start, 'yyyy-MM-dd') : null,
        project_end: formData.project_end ? format(formData.project_end, 'yyyy-MM-dd') : null,
        valid_until: formData.valid_until ? format(formData.valid_until, 'yyyy-MM-dd') : null,
        total_amount: calculateSubtotal(),
        status: 'Draft'
      };
      
      const response = await window.api.proposal.saveAsDraft(formattedData);
      if (response.success) {
        setSuccess('Proposal saved as draft');
        setTimeout(() => {
          navigate('/proposals');
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to save draft');
      }
    } catch (err) {
      setError('Error saving draft: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Submit the form
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
    } catch (err) {

    }
    setLoading(true);
    
    try {
      // Format dates for API
      const formattedData = {
        ...formData,
        project_start: formData.project_start ? format(formData.project_start, 'yyyy-MM-dd') : null,
        project_end: formData.project_end ? format(formData.project_end, 'yyyy-MM-dd') : null,
        valid_until: formData.valid_until ? format(formData.valid_until, 'yyyy-MM-dd') : null,
        total_amount: calculateSubtotal()
      };
      
      
      // Create or update proposal
      if (isEditMode) {
        const response = await window.api.proposal.update(currentProposalId, formattedData);
        if (!response.success) {
          throw new Error(response.message || 'Failed to update proposal');
        }
      } 
      
      // If editing, delete existing services first
      if (isEditMode) {
        await window.api.proService.deleteByProposal(currentProposalId);
      }
      
      // Add services and their job orders
      for (const service of selectedServices) {
        // Create service
        const serviceData = {
          proposal_id: currentProposalId,
          service_id: service.service_id,
          quantity: service.quantity,
          unit_price: service.unit_price,
          price: service.price,
          discount_percentage: service.discount_percentage || 0,
          pro_type: 'Proposal'
        };
        
        const serviceResponse = await window.api.proService.create(serviceData);
        if (!serviceResponse.success) {
          throw new Error('Failed to add service: ' + serviceResponse.message);
        }

        // Add job orders for this service
        const jobOrders = localJobOrders[service.service_id] || [];
        for (const jobOrder of jobOrders) {
          const jobOrderData = {
            ...jobOrder,
            service_id: service.service_id,
            proposal_id: currentProposalId
          };
          
          await window.api.jobOrders.create(jobOrderData);
         
        }
      }
      
      // Update proposal total
      const totalResponse = await window.api.proService.calculateProposalTotal(currentProposalId);
      if (totalResponse.success) {
        await window.api.proposal.update(currentProposalId, { 
          total_amount: totalResponse.data.total 
        });
      }
      
      setSuccess('Proposal saved successfully');
      
      // Navigate back to proposals list after a short delay
      setTimeout(() => {
        navigate('/proposals');
      }, 2000);
      
    } catch (err) {
      setError('Error saving proposal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/proposals');
  };
  
  // Add this function to handle job order management
  const handleManageJobOrders = (service) => {
    // Set the selected service for job orders management
    setSelectedServiceDetails(service);
    
    // Initialize local job orders for this service if not exists
    if (!localJobOrders[service.service_id]) {
      setLocalJobOrders(prev => ({
        ...prev,
        [service.service_id]: []
      }));
    }
  };
  
  // Add handlers for job order operations
  const handleJobOrderUpdate = (serviceId, updatedJobOrders) => {
    setLocalJobOrders(prev => ({
      ...prev,
      [serviceId]: updatedJobOrders
    }));
  };
  
  // Modify the services table to include a button to manage job orders
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
            <React.Fragment key={index}>
              <TableRow>
                <TableCell>{service.service_name}</TableCell>
                <TableCell align="right">{service.quantity}</TableCell>
                <TableCell align="right">${service.unit_price}</TableCell>
                <TableCell align="right">{service.discount_percentage}%</TableCell>
                <TableCell align="right">${service.price}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <IconButton 
                      onClick={() => handleRemoveService(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleManageJobOrders(service)}
                      disabled={loading}
                    >
                      Manage Job Orders
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Update the renderJobOrders function
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
            proposalId={formData.proposal_id || 'temp'}
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
  
  // Render the document preview step
  const renderDocumentPreview = () => {
    // Add job orders to services data
    const servicesWithJobOrders = selectedServices.map(service => ({
      ...service,
      jobOrders: localJobOrders[service.service_id] || []
    }));

    return (
      <Box sx={{ mt: 3 }}>
        <ProposalDocumentNew
          companyInfo={companyInfo}
          proposalData={formData}
          clientName={clients.find(c => c.client_id === formData.client_id)?.client_name || ''}
          services={servicesWithJobOrders}
          proposal_id={currentProposalId}
          onDocumentGenerated={handleDocumentGenerated}
        />
      </Box>
    );
  };
  
  // Add email sent handler
  const handleEmailSent = () => {
    setSuccess('Email sent successfully');
    // navigate('/proposals');
    handleSubmit();
  };

  // Update the render logic to include email form
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
  return (
          // Step 1: Proposal Form
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Proposal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Proposal Name"
                    name="proposal_name"
                    value={formData.proposal_name}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Proposal Reference"
                    name="proposal_reference"
                    value={formData.proposal_reference}
                    InputProps={{
                      readOnly: true,
                    }}
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
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="Draft">Draft</MenuItem>
                      <MenuItem value="Sent">Sent</MenuItem>
                      <MenuItem value="Accepted">Accepted</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Valid Until"
                        type="date"
                        name="valid_until"
                        value={formData.valid_until ? format(formData.valid_until, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleDateChange('valid_until', e)}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
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
                  <TextField
                    fullWidth
                    label="Project Start Date"
                    type="date"
                    name="project_start"
                    value={formData.project_start ? format(formData.project_start, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleDateChange('project_start', e)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Project End Date"
                    type="date"
                    name="project_end"
                    value={formData.project_end ? format(formData.project_end, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleDateChange('project_end', e)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
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
                    rows={4}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="has_downpayment"
                        checked={formData.has_downpayment}
                        onChange={handleChange}
                      />
                    }
                    label="Requires Downpayment"
                  />
                </Grid>
                
                {formData.has_downpayment && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Downpayment Amount"
                      name="downpayment_amount"
                      type="number"
                      value={formData.downpayment_amount}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                      }}
                      margin="normal"
                    />
                  </Grid>
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
                      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
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
              
              {selectedServices.length > 0 && renderServicesTable()}
              {selectedServiceDetails && renderJobOrders()}
              
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">
                      Subtotal: ₱{calculateSubtotal().toFixed(2)}
                    </Typography>
                    {formData.has_downpayment && (
                      <Typography variant="subtitle1">
                        Downpayment: ₱{calculateDownpayment().toFixed(2)}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6">
                      Total: ₱{calculateSubtotal().toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSaveAsDraft}
                disabled={loading}
              >
                Save as Draft
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
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
                  disabled={loading || selectedServices.length === 0}
                  endIcon={<PreviewIcon />}
                >
                  {loading ? <CircularProgress size={24} /> : 'Preview Document'}
                </Button>
              </Box>
            </Box>
          </form>
        );
      case 1:
        return renderDocumentPreview();
      case 2:
        return (
          <EmailProposalForm
            proposalData={{
              ...formData,
              documentBase64: documentBase64,
            }}
            onEmailSent={handleEmailSent}
          />
        );
      default:
        return null;
    }
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
          {isEditMode ? 'Edit Proposal' : 'Create New Proposal'}
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent()}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={handleBack}
            disabled={activeStep === 0 || loading}
              >
                Back
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
            {activeStep === steps.length - 1 ? null : (
                <Button
                  variant="contained"
                  color="primary"
                onClick={handleNext}
                disabled={loading || (activeStep === 0 && selectedServices.length === 0)}
                >
                {loading ? <CircularProgress size={24} /> : 'Next'}
                </Button>
            )}
              </Box>
            </Box>
        
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

export default ProposalForm; 