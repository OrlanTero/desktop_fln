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
import Navigation from '../components/Navigation';
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
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
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

        const dataa =(response.data || []).filter(proposal => proposal.status.toLowerCase() === 'accepted');
        setProposals(dataa)
        setFilteredProposals(dataa);
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
  
  // Handle view proposal
  const handleViewProposal = (id) => {
    navigate(`/proposals/view/${id}`);
  };
  

  
  // Handle convert to project
  const handleConvertClick = (proposal) => {
    if (proposal.status.toLowerCase() !== 'accepted') {
      setError('Only accepted proposals can be converted to projects');
      return;
    }
    
    setSelectedProposal(proposal);
    setConvertDialogOpen(true);
  };
  
  const handleConvertConfirm = async () => {
    if (!selectedProposal) return;
    
    setLoading(true);
    try {
      // Create project from proposal data
      const projectData = {
        project_name: selectedProposal.project_name || selectedProposal.proposal_name,
        client_id: selectedProposal.client_id,
        proposal_id: selectedProposal.proposal_id,
        attn_to: selectedProposal.attn_to,
        description: selectedProposal.description,
        notes: selectedProposal.notes,
        total_amount: selectedProposal.total_amount,
        status: 'pending',
        priority: 'medium'
      };

      const response = await window.api.project.create(projectData);
      
      if (response.status === 'success') {
        // Copy services from proposal to project
        await window.api.proService.copyToProject(selectedProposal.proposal_id);
        
        // Update proposal status to converted
        await window.api.proposal.updateStatus(selectedProposal.proposal_id, { status: 'Converted' });
        
        setSuccess('Proposal converted to project successfully');
        fetchProposals();
      } else {
        setError('Failed to convert proposal to project: ' + response.message);
      }
    } catch (err) {
      console.error('Error converting proposal to project:', err);
      setError('Error converting proposal to project: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
      setConvertDialogOpen(false);
      setSelectedProposal(null);
    }
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
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ width: 240, flexShrink: 0 }}>
        <Navigation user={user} onLogout={onLogout} />
      </Box>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto', height: '100%' }}>
        <Typography variant="h4" gutterBottom>
          Proposal Conversion
        </Typography>
        
       
        
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
                        color="success"
                        onClick={() => handleConvertClick(proposal)}
                        title="Convert to Project"
                      disabled={  proposal.status.toLowerCase() !== 'accepted'}
                      >
                        <EngineeringIcon />
                      </IconButton>
                    
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
      
        
        {/* Convert to Project Dialog */}
        <Dialog
          open={convertDialogOpen}
          onClose={() => setConvertDialogOpen(false)}
        >
          <DialogTitle>Convert to Project</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to convert the proposal "{selectedProposal?.proposal_name}" to a project? This will create a new project with all the services from this proposal.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConvertDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConvertConfirm} color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Convert'}
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

export default Proposals; 