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
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SearchIcon from '@mui/icons-material/Search';
import Layout from '../components/Layout';
import { format } from 'date-fns';

const Proposals = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // State
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  
  // Fetch proposals on component mount
  useEffect(() => {
    fetchProposals();
  }, []);
  
  // Filter proposals when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProposals(proposals);
    } else {
      const filtered = proposals.filter(proposal => 
        proposal.proposal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.proposal_reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProposals(filtered);
    }
  }, [searchTerm, proposals]);
  
  // Fetch proposals from API
  const fetchProposals = async () => {
    setLoading(true);
    try {
      // Check if API is properly initialized
      if (!window.api || !window.api.proposal) {
        console.error('API not properly initialized');
        setError('API not properly initialized. Please restart the application.');
        setLoading(false);
        return;
      }
      
      const response = await window.api.proposal.getAll();

      if (response && response.success) {
        setProposals(response.data || []);
        setFilteredProposals(response.data || []);
      } else {
        setError('Failed to load proposals: ' + (response?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error in fetchProposals:', err);
      setError('Error loading proposals: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle create new proposal
  const handleCreateProposal = () => {
    navigate('/proposals/new');
  };
  
  // Handle edit proposal
  const handleEditProposal = (id) => {
    navigate(`/proposals/edit/${id}`);
  };
  
  // Handle view proposal
  const handleViewProposal = (id) => {
    navigate(`/proposals/view/${id}`);
  };
  
  // Handle delete proposal
  const handleDeleteClick = (proposal) => {
    setSelectedProposal(proposal);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedProposal) return;
    
    setLoading(true);
    try {
      // First delete all services associated with this proposal
      await window.api.proService.deleteByProposal(selectedProposal.proposal_id);
      
      // Then delete the proposal
      const response = await window.api.proposal.delete(selectedProposal.proposal_id);
      if (response.success) {
        setSuccess('Proposal deleted successfully');
        fetchProposals();
      } else {
        setError('Failed to delete proposal: ' + response.message);
      }
    } catch (err) {
      setError('Error deleting proposal: ' + err.message);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedProposal(null);
    }
  };
  
  // Handle convert to project
  const handleConvertClick = (proposal) => {
    if (proposal.status.toLowerCase() !== 'accepted') {
      setError('Only accepted proposals can be converted to projects');
      return;
    } 

    const proposalData = proposals.find(p => p.proposal_id === proposal.proposal_id);


    // Navigate to project form with proposal data
    navigate('/projects/new', { 
      state: { 
        proposalData: proposalData,
        isConversion: true
      }
    });
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'default';
      case 'Sent':
        return 'primary';
      case 'Accepted':
        return 'success';
      case 'Rejected':
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
  
  if (loading && proposals.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Layout user={user} onLogout={onLogout}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Proposals
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateProposal}
          >
            Create New Proposal
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search proposals by name, client, or reference..."
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
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Reference</TableCell>
                <TableCell>Proposal Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Project Name</TableCell>
                <TableCell>Valid Until</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {loading ? 'Loading proposals...' : 'No proposals found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProposals.map((proposal) => (
                  <TableRow key={proposal.proposal_id}>
                    <TableCell>{proposal.proposal_reference}</TableCell>
                    <TableCell>{proposal.proposal_name}</TableCell>
                    <TableCell>{proposal.client_name}</TableCell>
                    <TableCell>{proposal.project_name}</TableCell>
                    <TableCell>{formatDate(proposal.valid_until)}</TableCell>
                    <TableCell align="right">${parseFloat(proposal.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={proposal.status} 
                        color={getStatusColor(proposal.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewProposal(proposal.proposal_id)}
                        title="View Proposal"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleEditProposal(proposal.proposal_id)}
                        title="Edit Proposal"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="success"
                        onClick={() => handleConvertClick(proposal)}
                        title="Convert to Project"
                      disabled={  proposal.status.toLowerCase() !== 'accepted'}
                      >
                        <EngineeringIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(proposal)}
                        title="Delete Proposal"
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
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Proposal</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the proposal "{selectedProposal?.proposal_name}"? This action cannot be undone.
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
    </Layout>
  );
};

export default Proposals; 