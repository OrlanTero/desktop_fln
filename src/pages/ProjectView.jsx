import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import { format } from 'date-fns';

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [project, setProject] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  
  // Fetch project data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch project details
        const projectResponse = await window.api.project.getById(id);
        if (projectResponse.success && projectResponse.data) {
          setProject(projectResponse.data);
        } else {
          setError('Failed to load project details');
        }
        
        // Fetch services for this project
        const servicesResponse = await window.api.proService.getByProject(id);
        if (servicesResponse.success) {
          setServices(servicesResponse.data || []);
        } else {
          setError('Failed to load project services');
        }
      } catch (err) {
        setError('Error loading project data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Handle edit project
  const handleEdit = () => {
    navigate(`/projects/edit/${id}`);
  };
  
  // Handle back
  const handleBack = () => {
    navigate('/projects');
  };
  
  // Handle payment
  const handlePaymentClick = () => {
    setPaymentAmount(0);
    setPaymentDialogOpen(true);
  };
  
  const handlePaymentConfirm = async () => {
    if (!project || paymentAmount <= 0) return;
    
    setLoading(true);
    try {
      const response = await window.api.project.updatePaidAmount(
        project.project_id,
        parseFloat(paymentAmount)
      );
      
      if (response.success) {
        setSuccess(`Payment of $${paymentAmount} recorded successfully`);
        
        // Update local state
        setProject({
          ...project,
          paid_amount: parseFloat(project.paid_amount || 0) + parseFloat(paymentAmount)
        });
      } else {
        setError('Failed to record payment: ' + response.message);
      }
    } catch (err) {
      setError('Error recording payment: ' + err.message);
    } finally {
      setLoading(false);
      setPaymentDialogOpen(false);
      setPaymentAmount(0);
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
  
  // Get priority chip color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'success';
      case 'Medium':
        return 'info';
      case 'High':
        return 'warning';
      case 'Urgent':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Calculate payment status
  const getPaymentStatus = () => {
    if (!project) return 'Unknown';
    
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
  
  // Calculate remaining amount
  const getRemainingAmount = () => {
    if (!project) return 0;
    return Math.max(0, parseFloat(project.total_amount || 0) - parseFloat(project.paid_amount || 0));
  };
  
  if (loading && !project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Project not found or failed to load
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }
  
  const paymentStatus = getPaymentStatus();
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Projects
        </Button>
        <Box>
          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            onClick={handlePaymentClick}
            sx={{ mr: 1 }}
            disabled={paymentStatus === 'Fully Paid'}
          >
            Record Payment
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Project
          </Button>
        </Box>
      </Box>
      
      <Typography variant="h4" gutterBottom>
        {project.project_name}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Project Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Client
            </Typography>
            <Typography variant="body1" gutterBottom>
              {project.client_name}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Attention To
            </Typography>
            <Typography variant="body1" gutterBottom>
              {project.attn_to || 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip 
              label={project.status} 
              color={getStatusColor(project.status)} 
              size="small" 
              sx={{ mt: 0.5 }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Priority
            </Typography>
            <Chip 
              label={project.priority} 
              color={getPriorityColor(project.priority)} 
              size="small" 
              sx={{ mt: 0.5 }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Start Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(project.start_date)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              End Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(project.end_date)}
            </Typography>
          </Grid>
          
          {project.proposal_id && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Created From Proposal
              </Typography>
              <Typography variant="body1" gutterBottom>
                {project.proposal_name || `Proposal #${project.proposal_id}`}
              </Typography>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-line' }}>
              {project.description || 'No description provided'}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Notes
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-line' }}>
              {project.notes || 'No notes provided'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Financial Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h5" color="primary">
                ${parseFloat(project.total_amount || 0).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Paid Amount
              </Typography>
              <Typography variant="h5" color="success.main">
                ${parseFloat(project.paid_amount || 0).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Remaining Amount
              </Typography>
              <Typography variant="h5" color="error">
                ${getRemainingAmount().toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ mr: 1 }}>
                Payment Status:
              </Typography>
              <Chip 
                label={paymentStatus} 
                color={getPaymentStatusColor(paymentStatus)} 
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Services
        </Typography>
        
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
              </TableRow>
            </TableHead>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No services found for this project
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell>{service.service_category_name}</TableCell>
                    <TableCell>{service.service_name}</TableCell>
                    <TableCell align="right">{service.quantity}</TableCell>
                    <TableCell align="right">${parseFloat(service.unit_price).toFixed(2)}</TableCell>
                    <TableCell align="right">{service.discount_percentage}%</TableCell>
                    <TableCell align="right">${parseFloat(service.price).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
              <TableRow>
                <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>
                  Total:
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  ${parseFloat(project.total_amount || 0).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
      >
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Record a payment for project "{project.project_name}".
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Total Amount: ${parseFloat(project.total_amount || 0).toFixed(2)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Paid Amount: ${parseFloat(project.paid_amount || 0).toFixed(2)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Remaining: ${getRemainingAmount().toFixed(2)}
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
            disabled={loading || paymentAmount <= 0 || paymentAmount > getRemainingAmount()}
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
  );
};

export default ProjectView; 