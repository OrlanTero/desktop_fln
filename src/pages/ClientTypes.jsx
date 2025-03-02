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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

const ClientTypes = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [clientTypes, setClientTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'delete'
  const [currentClientType, setCurrentClientType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchClientTypes();
  }, []);

  const fetchClientTypes = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
      const response = await window.api.clientType.getAll();
      if (response.success) {
        setClientTypes(response.data);
      } else {
        setError(response.message || 'Failed to fetch client types');
      }
    } catch (err) {
      console.error('Error fetching client types:', err);
      setError('An error occurred while fetching client types');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type, clientTypeData = null) => {
    setDialogType(type);
    if (clientTypeData) {
      setCurrentClientType(clientTypeData);
      setFormData({
        name: clientTypeData.name || '',
        description: clientTypeData.description || '',
      });
    } else {
      setCurrentClientType(null);
      setFormData({
        name: '',
        description: '',
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
        response = await window.api.clientType.create(formData);
      } else if (dialogType === 'edit') {
        response = await window.api.clientType.update(currentClientType.type_id, formData);
      } else if (dialogType === 'delete') {
        response = await window.api.clientType.delete(currentClientType.type_id);
      }
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: `Client type ${dialogType === 'add' ? 'added' : dialogType === 'edit' ? 'updated' : 'deleted'} successfully`,
          severity: 'success',
        });
        fetchClientTypes();
      } else {
        setSnackbar({
          open: true,
          message: response.message || `Failed to ${dialogType} client type`,
          severity: 'error',
        });
      }
    } catch (err) {
      console.error(`Error ${dialogType}ing client type:`, err);
      setSnackbar({
        open: true,
        message: `An error occurred while ${dialogType}ing client type`,
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
    <Layout title="Client Types" userMenu={userMenu}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Client Types</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
          >
            Add Client Type
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
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
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
              ) : clientTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No client types found
                  </TableCell>
                </TableRow>
              ) : (
                clientTypes.map((clientType) => (
                  <TableRow key={clientType.type_id}>
                    <TableCell>{clientType.type_id}</TableCell>
                    <TableCell>{clientType.name}</TableCell>
                    <TableCell>{clientType.description}</TableCell>
                    <TableCell>{new Date(clientType.created_at).toLocaleString()}</TableCell>
                    <TableCell>{new Date(clientType.updated_at).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog('edit', clientType)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDialog('delete', clientType)}
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

        {/* Add/Edit Client Type Dialog */}
        <Dialog open={openDialog && dialogType !== 'delete'} onClose={handleCloseDialog}>
          <DialogTitle>{dialogType === 'add' ? 'Add Client Type' : 'Edit Client Type'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} color="primary">
              {dialogType === 'add' ? 'Add' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Client Type Dialog */}
        <Dialog open={openDialog && dialogType === 'delete'} onClose={handleCloseDialog}>
          <DialogTitle>Delete Client Type</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the client type "{currentClientType?.name}"? This action cannot be undone.
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

export default ClientTypes; 