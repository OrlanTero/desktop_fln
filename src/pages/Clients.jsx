import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  Avatar,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

const Clients = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [clientTypes, setClientTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'delete'
  const [currentClient, setCurrentClient] = useState(null);
  const [formData, setFormData] = useState({
    client_name: '',
    company: '',
    branch: '',
    address: '',
    address2: '',
    tax_type: '',
    account_for: '',
    rdo: '',
    email_address: '',
    description: '',
    client_type_id: '',
    status: 'active',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchClients();
    fetchClientTypes();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
      const response = await window.api.client.getAll();
      if (response.success) {
        setClients(response.data);
      } else {
        setError(response.message || 'Failed to fetch clients');
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('An error occurred while fetching clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientTypes = async () => {
    try {
      // Replace with your actual API call
      const response = await window.api.clientType.getAll();
      if (response.success) {
        setClientTypes(response.data);
      }
    } catch (err) {
      console.error('Error fetching client types:', err);
    }
  };

  const handleOpenDialog = (type, clientData = null) => {
    setDialogType(type);
    if (clientData) {
      setCurrentClient(clientData);
      setFormData({
        client_name: clientData.client_name || '',
        company: clientData.company || '',
        branch: clientData.branch || '',
        address: clientData.address || '',
        address2: clientData.address2 || '',
        tax_type: clientData.tax_type || '',
        account_for: clientData.account_for || '',
        rdo: clientData.rdo || '',
        email_address: clientData.email_address || '',
        description: clientData.description || '',
        client_type_id: clientData.client_type_id || '',
        status: clientData.status || 'active',
      });
    } else {
      setCurrentClient(null);
      setFormData({
        client_name: '',
        company: '',
        branch: '',
        address: '',
        address2: '',
        tax_type: '',
        account_for: '',
        rdo: '',
        email_address: '',
        description: '',
        client_type_id: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      let response;
      
      if (dialogType === 'add') {
        response = await window.api.client.create(formData);
      } else if (dialogType === 'edit') {
        response = await window.api.client.update(currentClient.client_id, formData);
      } else if (dialogType === 'delete') {
        response = await window.api.client.delete(currentClient.client_id);
      }
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: `Client ${dialogType === 'add' ? 'added' : dialogType === 'edit' ? 'updated' : 'deleted'} successfully`,
          severity: 'success',
        });
        fetchClients();
      } else {
        setSnackbar({
          open: true,
          message: response.message || `Failed to ${dialogType} client`,
          severity: 'error',
        });
      }
    } catch (err) {
      console.error(`Error ${dialogType}ing client:`, err);
      setSnackbar({
        open: true,
        message: `An error occurred while ${dialogType}ing client`,
        severity: 'error',
      });
    } finally {
      handleCloseDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    if (onLogout) onLogout();
    navigate('/login');
  };

  // Get client type name by ID
  const getClientTypeName = (typeId) => {
    const clientType = clientTypes.find(type => type.type_id === typeId);
    return clientType ? clientType.name : 'Unknown';
  };

  // User profile menu in the top right
  const userMenu = (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ mr: 2 }}>
        {user?.name || 'User'}
      </Typography>
      <Avatar
        onClick={handleMenu}
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
        onClose={handleClose}
      >
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Layout title="Clients" userMenu={userMenu}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Clients</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
          >
            Add Client
          </Button>
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
                <TableCell>ID</TableCell>
                <TableCell>Client Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Client Type</TableCell>
                <TableCell>Status</TableCell>
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
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.client_id}>
                    <TableCell>{client.client_id}</TableCell>
                    <TableCell>{client.client_name}</TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>{client.email_address}</TableCell>
                    <TableCell>{getClientTypeName(client.client_type_id)}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: client.status === 'active' ? 'success.light' : 'error.light',
                          color: 'white',
                        }}
                      >
                        {client.status}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog('edit', client)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDialog('delete', client)}
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

        {/* Add/Edit Client Dialog */}
        <Dialog 
          open={openDialog && dialogType !== 'delete'} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{dialogType === 'add' ? 'Add Client' : 'Edit Client'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  name="client_name"
                  label="Client Name"
                  type="text"
                  fullWidth
                  value={formData.client_name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="company"
                  label="Company"
                  type="text"
                  fullWidth
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="branch"
                  label="Branch"
                  type="text"
                  fullWidth
                  value={formData.branch}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email_address"
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={formData.email_address}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Address"
                  type="text"
                  fullWidth
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address2"
                  label="Address Line 2"
                  type="text"
                  fullWidth
                  value={formData.address2}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="tax_type"
                  label="Tax Type"
                  type="text"
                  fullWidth
                  value={formData.tax_type}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="account_for"
                  label="Account For"
                  type="text"
                  fullWidth
                  value={formData.account_for}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="rdo"
                  label="RDO"
                  type="text"
                  fullWidth
                  value={formData.rdo}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="client-type-label">Client Type</InputLabel>
                  <Select
                    labelId="client-type-label"
                    name="client_type_id"
                    value={formData.client_type_id}
                    label="Client Type"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {clientTypes.map((type) => (
                      <MenuItem key={type.type_id} value={type.type_id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  type="text"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} color="primary">
              {dialogType === 'add' ? 'Add' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Client Dialog */}
        <Dialog open={openDialog && dialogType === 'delete'} onClose={handleCloseDialog}>
          <DialogTitle>Delete Client</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the client "{currentClient?.client_name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default Clients; 