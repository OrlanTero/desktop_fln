import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
  Assignment as RequirementIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

const Services = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryIdFromUrl = queryParams.get('category');

  const [services, setServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    priceRange: '',
    timeline: '',
  });

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add');
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({
    service_name: '',
    service_category_id: '',
    price: '',
    timeline: '',
    remarks: '',
    requirements: [],
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryIdFromUrl || '');

  useEffect(() => {
    fetchServiceCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchServicesByCategory(selectedCategoryId);
    } else {
      fetchAllServices();
    }
  }, [selectedCategoryId]);

  // Filter services based on search and filter criteria
  const filteredServices = services.filter(service => {
    const matchesSearch =
      filters.search === '' ||
      service.service_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (service.remarks && service.remarks.toLowerCase().includes(filters.search.toLowerCase()));

    const matchesPriceRange =
      filters.priceRange === '' ||
      (filters.priceRange === 'low' && service.price <= 1000) ||
      (filters.priceRange === 'medium' && service.price > 1000 && service.price <= 5000) ||
      (filters.priceRange === 'high' && service.price > 5000);

    const matchesTimeline =
      filters.timeline === '' ||
      service.timeline.toLowerCase().includes(filters.timeline.toLowerCase());

    return matchesSearch && matchesPriceRange && matchesTimeline;
  });

  // Get paginated data
  const paginatedServices = filteredServices.slice(
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
      priceRange: '',
      timeline: '',
    });
    setPage(0);
  };

  const fetchServiceCategories = async () => {
    try {
      const response = await window.api.serviceCategory.getAll();
      if (response.success) {
        setServiceCategories(response.data);
      } else {
        console.error('Failed to fetch service categories:', response.message);
      }
    } catch (err) {
      console.error('Error fetching service categories:', err);
    }
  };

  const fetchAllServices = async () => {
    setLoading(true);
    try {
      const response = await window.api.service.getAll();
      if (response.success) {
        setServices(response.data);
      } else {
        setError(response.message || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('An error occurred while fetching services');
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesByCategory = async categoryId => {
    setLoading(true);
    try {
      const response = await window.api.service.getByCategory(categoryId);
      if (response.success) {
        setServices(response.data);
      } else {
        setError(response.message || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('Error fetching services by category:', err);
      setError('An error occurred while fetching services');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = event => {
    const categoryId = event.target.value;
    setSelectedCategoryId(categoryId);

    // Update URL without reloading the page
    const newUrl = categoryId
      ? `${window.location.pathname}?category=${categoryId}`
      : window.location.pathname;
    window.history.pushState({}, '', newUrl);
  };

  const handleOpenDialog = (type, serviceData = null) => {
    setDialogType(type);
    if (serviceData) {
      setCurrentService(serviceData);
      setFormData({
        service_name: serviceData.service_name || '',
        service_category_id: serviceData.service_category_id || '',
        price: serviceData.price || '',
        timeline: serviceData.timeline || '',
        remarks: serviceData.remarks || '',
        requirements: serviceData.requirements
          ? serviceData.requirements.map(req => req.requirement)
          : [],
      });
    } else {
      setCurrentService(null);
      setFormData({
        service_name: '',
        service_category_id: selectedCategoryId || '',
        price: '',
        timeline: '',
        remarks: '',
        requirements: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewRequirement('');
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      });
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = index => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements.splice(index, 1);
    setFormData({
      ...formData,
      requirements: updatedRequirements,
    });
  };

  const handleSubmit = async () => {
    try {
      let response;

      if (dialogType === 'add') {
        response = await window.api.service.create(formData);
      } else if (dialogType === 'edit') {
        response = await window.api.service.update(currentService.service_id, formData);
      } else if (dialogType === 'delete') {
        response = await window.api.service.delete(currentService.service_id);
      }

      if (response.success) {
        setSnackbar({
          open: true,
          message: `Service ${
            dialogType === 'add' ? 'added' : dialogType === 'edit' ? 'updated' : 'deleted'
          } successfully`,
          severity: 'success',
        });
        if (selectedCategoryId) {
          fetchServicesByCategory(selectedCategoryId);
        } else {
          fetchAllServices();
        }
      } else {
        setSnackbar({
          open: true,
          message: response.message || `Failed to ${dialogType} service`,
          severity: 'error',
        });
      }
    } catch (err) {
      console.error(`Error ${dialogType}ing service:`, err);
      setSnackbar({
        open: true,
        message: `An error occurred while ${dialogType}ing service`,
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

  const handleMenu = event => {
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

  const getCategoryName = categoryId => {
    const category = serviceCategories.find(cat => cat.service_category_id === categoryId);
    return category ? category.service_category_name : 'Unknown';
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
    <Layout title="Services" userMenu={userMenu}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Services</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
          >
            Add Service
          </Button>
        </Box>

        {/* Category and Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={selectedCategoryId} onChange={handleCategoryChange} label="Category">
                  <MenuItem value="">All Categories</MenuItem>
                  {serviceCategories.map(category => (
                    <MenuItem
                      key={category.service_category_id}
                      value={category.service_category_id}
                    >
                      {category.service_category_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search services..."
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
              <FormControl fullWidth>
                <InputLabel>Price Range</InputLabel>
                <Select
                  name="priceRange"
                  value={filters.priceRange}
                  onChange={handleFilterChange}
                  label="Price Range"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low (≤ 1000)</MenuItem>
                  <MenuItem value="medium">Medium (1001-5000)</MenuItem>
                  <MenuItem value="high">High ({'>'}5000)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Timeline</InputLabel>
                <Select
                  name="timeline"
                  value={filters.timeline}
                  onChange={handleFilterChange}
                  label="Timeline"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="day">Daily</MenuItem>
                  <MenuItem value="week">Weekly</MenuItem>
                  <MenuItem value="month">Monthly</MenuItem>
                  <MenuItem value="quarter">Quarterly</MenuItem>
                  <MenuItem value="year">Yearly</MenuItem>
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
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Requirements</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No services found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServices.map(service => (
                  <TableRow key={service.service_id}>
                    <TableCell>{service.service_id}</TableCell>
                    <TableCell>{service.service_name}</TableCell>
                    <TableCell>{getCategoryName(service.service_category_id)}</TableCell>
                    <TableCell>{service.price}</TableCell>
                    <TableCell>{service.timeline}</TableCell>
                    <TableCell>
                      {service.requirements && service.requirements.length > 0 ? (
                        <Button
                          size="small"
                          startIcon={<RequirementIcon />}
                          onClick={() => handleOpenDialog('requirements', service)}
                        >
                          View ({service.requirements.length})
                        </Button>
                      ) : (
                        'None'
                      )}
                    </TableCell>
                    <TableCell>{service.remarks}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenDialog('edit', service)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDialog('delete', service)}>
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
            count={filteredServices.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Add/Edit Service Dialog */}
        <Dialog
          open={openDialog && (dialogType === 'add' || dialogType === 'edit')}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{dialogType === 'add' ? 'Add Service' : 'Edit Service'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  name="service_name"
                  label="Service Name"
                  type="text"
                  fullWidth
                  value={formData.service_name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="service-category-label">Service Category</InputLabel>
                  <Select
                    labelId="service-category-label"
                    name="service_category_id"
                    value={formData.service_category_id}
                    label="Service Category"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>Select a category</em>
                    </MenuItem>
                    {serviceCategories.map(category => (
                      <MenuItem
                        key={category.service_category_id}
                        value={category.service_category_id}
                      >
                        {category.service_category_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Unit Price"
                  name="unit_price"
                  type="number"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₱</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="timeline"
                  label="Timeline"
                  type="text"
                  fullWidth
                  value={formData.timeline}
                  onChange={handleInputChange}
                  placeholder="e.g., 2-3 weeks"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="remarks"
                  label="Remarks"
                  type="text"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.remarks}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Requirements
                </Typography>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add Requirement"
                    value={newRequirement}
                    onChange={e => setNewRequirement(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <Button variant="contained" onClick={handleAddRequirement} sx={{ ml: 1 }}>
                    Add
                  </Button>
                </Box>
                <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {formData.requirements.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography color="text.secondary">No requirements added</Typography>
                    </Box>
                  ) : (
                    <List>
                      {formData.requirements.map((req, index) => (
                        <React.Fragment key={index}>
                          <ListItem
                            secondaryAction={
                              <IconButton edge="end" onClick={() => handleRemoveRequirement(index)}>
                                <DeleteIcon />
                              </IconButton>
                            }
                          >
                            <ListItemText primary={req} />
                          </ListItem>
                          {index < formData.requirements.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Paper>
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

        {/* Delete Service Dialog */}
        <Dialog open={openDialog && dialogType === 'delete'} onClose={handleCloseDialog}>
          <DialogTitle>Delete Service</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the service "{currentService?.service_name}"? This
              action cannot be undone.
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

export default Services;
