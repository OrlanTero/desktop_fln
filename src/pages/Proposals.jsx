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
  Avatar,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Send as SendIcon,
  Transform as ConvertIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { format } from 'date-fns';

const Proposals = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // State
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    client: '',
    dateRange: '',
  });

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

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

  // Fetch proposals on component mount
  useEffect(() => {
    fetchProposals();
    fetchClients();
  }, []);

  // Filter proposals based on search and filter criteria
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch =
      filters.search === '' ||
      proposal.proposal_reference.toLowerCase().includes(filters.search.toLowerCase()) ||
      proposal.client_name.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === '' || proposal.status === filters.status;

    const matchesClient = filters.client === '' || proposal.client_id === filters.client;

    const matchesDateRange =
      filters.dateRange === '' ||
      (() => {
        const proposalDate = new Date(proposal.created_at);
        const today = new Date();
        switch (filters.dateRange) {
          case 'today':
            return proposalDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date(today.setDate(today.getDate() - 7));
            return proposalDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
            return proposalDate >= monthAgo;
          default:
            return true;
        }
      })();

    return matchesSearch && matchesStatus && matchesClient && matchesDateRange;
  });

  // Get paginated data
  const paginatedProposals = filteredProposals.slice(
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
    });
    setPage(0);
  };

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
  const handleEditProposal = id => {
    navigate(`/proposals/edit/${id}`);
  };

  // Handle view proposal
  const handleViewProposal = id => {
    navigate(`/proposals/view/${id}`);
  };

  // Handle delete proposal
  const handleDeleteClick = proposal => {
    setSelectedProposal(proposal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProposal) return;

    setLoading(true);
    try {
      // First delete all services associated with this proposal
      await window.api.proService.deleteByProposal(selectedProposal.id);

      // Then delete the proposal
      const response = await window.api.proposal.delete(selectedProposal.id);
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
  const handleConvertClick = proposal => {
    if (proposal.status.toLowerCase() !== 'accepted') {
      setError('Only accepted proposals can be converted to projects');
      return;
    }

    const proposalData = proposals.find(p => p.id === proposal.id);

    // Navigate to project form with proposal data
    navigate('/projects/new', {
      state: {
        proposalData: proposalData,
        isConversion: true,
      },
    });
  };

  // Get status chip color
  const getStatusColor = status => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'SENT':
        return 'info';
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'CONVERTED':
        return 'primary';
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

  if (loading && proposals.length === 0) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Proposals</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateProposal}
          >
            Create Proposal
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
                placeholder="Search proposals..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="SENT">Sent</MenuItem>
                  <MenuItem value="ACCEPTED">Accepted</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="CONVERTED">Converted</MenuItem>
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
            <Grid item xs={12} sm={2}>
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
                <TableCell>Reference</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedProposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No proposals found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProposals.map(proposal => (
                  <TableRow key={proposal.id}>
                    <TableCell>{proposal.proposal_reference}</TableCell>
                    <TableCell>{proposal.client_name}</TableCell>
                    <TableCell>₱{parseFloat(proposal.total_amount || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={proposal.status}
                        color={getStatusColor(proposal.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(proposal.created_at).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleViewProposal(proposal.id)}>
                        <ViewIcon />
                      </IconButton>
                      {proposal.status === 'DRAFT' && (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditProposal(proposal.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={() => handleSendProposal(proposal.id)}
                          >
                            <SendIcon />
                          </IconButton>
                        </>
                      )}
                      {proposal.status === 'ACCEPTED' && (
                        <IconButton color="primary" onClick={() => handleConvertClick(proposal)}>
                          <ConvertIcon />
                        </IconButton>
                      )}
                      {proposal.status === 'DRAFT' && (
                        <IconButton color="error" onClick={() => handleDeleteClick(proposal)}>
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
            count={filteredProposals.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Proposal</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the proposal "{selectedProposal?.proposal_name}"? This
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

export default Proposals;
