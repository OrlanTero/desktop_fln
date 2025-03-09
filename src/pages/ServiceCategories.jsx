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
  TablePagination,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

const ServiceCategories = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
  });
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    service_category_name: '',
    priority_number: 0,
    description: '',
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchServiceCategories();
  }, []);

  // Filter service categories based on search
  const filteredCategories = serviceCategories.filter(category => {
    const matchesSearch = filters.search === '' || 
      category.service_category_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(filters.search.toLowerCase()));
    
    return matchesSearch;
  });

  // Get paginated data
  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page when filters change
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
    });
    setPage(0);
  };

  const fetchServiceCategories = async () => {
    setLoading(true);
    try {
      const response = await window.api.serviceCategory.getAll();
      if (response.success) {
        setServiceCategories(response.data);
      } else {
        setError(response.message || 'Failed to fetch service categories');
      }
    } catch (err) {
      console.error('Error fetching service categories:', err);
      setError('An error occurred while fetching service categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type, categoryData = null) => {
    setDialogType(type);
    if (categoryData) {
      setCurrentCategory(categoryData);
      setFormData({
        service_category_name: categoryData.service_category_name || '',
        priority_number: categoryData.priority_number || 0,
        description: categoryData.description || '',
      });
    } else {
      setCurrentCategory(null);
      setFormData({
        service_category_name: '',
        priority_number: 0,
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
      
      // Add user ID to the form data
      const submitData = {
        ...formData,
        added_by_id: user?.id
      };
      
      if (dialogType === 'add') {
        response = await window.api.serviceCategory.create(submitData);
      } else if (dialogType === 'edit') {
        response = await window.api.serviceCategory.update(currentCategory.service_category_id, submitData);
      } else if (dialogType === 'delete') {
        response = await window.api.serviceCategory.delete(currentCategory.service_category_id);
      }
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: `Service category ${dialogType === 'add' ? 'added' : dialogType === 'edit' ? 'updated' : 'deleted'} successfully`,
          severity: 'success',
        });
        fetchServiceCategories();
      } else {
        setSnackbar({
          open: true,
          message: response.message || `Failed to ${dialogType} service category`,
          severity: 'error',
        });
      }
    } catch (err) {
      console.error(`Error ${dialogType}ing service category:`, err);
      setSnackbar({
        open: true,
        message: `An error occurred while ${dialogType}ing service category`,
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

  const handleViewServices = (categoryId) => {
    navigate(`/services?category=${categoryId}`);
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
    <Layout title="Service Categories" userMenu={userMenu}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Service Categories</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
          >
            Add Service Category
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={10}>
              <TextField
                fullWidth
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search service categories..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
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
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Added By</TableCell>
                <TableCell>Created At</TableCell>
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
              ) : paginatedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No service categories found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((category) => (
                  <TableRow key={category.service_category_id}>
                    <TableCell>{category.service_category_id}</TableCell>
                    <TableCell>{category.service_category_name}</TableCell>
                    <TableCell>{category.priority_number}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{category.added_by_name}</TableCell>
                    <TableCell>{new Date(category.created_at).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog('edit', category)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDialog('delete', category)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCategories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Add/Edit Service Category Dialog */}
        <Dialog open={openDialog && dialogType !== 'delete'} onClose={handleCloseDialog}>
          <DialogTitle>{dialogType === 'add' ? 'Add Service Category' : 'Edit Service Category'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="service_category_name"
              label="Category Name"
              type="text"
              fullWidth
              value={formData.service_category_name}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="priority_number"
              label="Priority Number"
              type="number"
              fullWidth
              value={formData.priority_number}
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

        {/* Delete Service Category Dialog */}
        <Dialog open={openDialog && dialogType === 'delete'} onClose={handleCloseDialog}>
          <DialogTitle>Delete Service Category</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the service category "{currentCategory?.service_category_name}"? This action cannot be undone.
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

export default ServiceCategories; 