import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Tabs,
  Tab,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  RestoreFromTrash as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  Info as InfoIcon,
  DeleteOutline as TrashIcon,
  History as HistoryIcon,
  CalendarToday as DateIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import isValid from 'date-fns/isValid';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bin-tabpanel-${index}`}
      aria-labelledby={`bin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for deleted items
const mockDeletedItems = [
  // Projects
  {
    id: 1,
    type: 'project',
    name: 'Legacy Website Redesign',
    client: 'ABC Corp',
    description: 'Website redesign project for ABC Corp',
    deletedBy: 'Admin User',
    deletedAt: '2023-11-15T10:30:00.000Z',
    originalId: 101
  },
  {
    id: 2,
    type: 'project',
    name: 'Mobile App Prototype',
    client: 'XYZ Inc',
    description: 'Mobile app prototype for internal use',
    deletedBy: 'Project Manager',
    deletedAt: '2023-11-18T14:15:00.000Z',
    originalId: 102
  },
  
  // Tasks
  {
    id: 3,
    type: 'task',
    name: 'Database Migration',
    project: 'CRM System Update',
    assignee: 'Developer 1',
    deletedBy: 'Project Manager',
    deletedAt: '2023-11-20T09:45:00.000Z',
    originalId: 201
  },
  {
    id: 4,
    type: 'task',
    name: 'API Documentation',
    project: 'Payment Gateway Integration',
    assignee: 'Developer 2',
    deletedBy: 'Admin User',
    deletedAt: '2023-11-22T16:30:00.000Z',
    originalId: 202
  },
  
  // Proposals
  {
    id: 5,
    type: 'proposal',
    name: 'Marketing Campaign Proposal',
    client: 'Marketing Pro',
    value: 5000,
    deletedBy: 'Marketing Specialist',
    deletedAt: '2023-11-10T11:20:00.000Z',
    originalId: 301
  },
  {
    id: 6,
    type: 'proposal',
    name: 'Website Maintenance Proposal',
    client: 'Small Business LLC',
    value: 2500,
    deletedBy: 'Admin User',
    deletedAt: '2023-11-12T13:40:00.000Z',
    originalId: 302
  },
  
  // Clients
  {
    id: 7,
    type: 'client',
    name: 'Old Client Inc.',
    contact: 'John Old',
    email: 'john@oldclient.com',
    deletedBy: 'Admin User',
    deletedAt: '2023-11-05T10:15:00.000Z',
    originalId: 401
  },
  {
    id: 8,
    type: 'client',
    name: 'Inactive Services Ltd.',
    contact: 'Jane Inactive',
    email: 'jane@inactiveservices.com',
    deletedBy: 'Admin User',
    deletedAt: '2023-11-08T09:30:00.000Z',
    originalId: 402
  },
  
  // Accounts
  {
    id: 9,
    type: 'account',
    name: 'Former Employee',
    email: 'former@flnservices.com',
    role: 'Staff',
    deletedBy: 'Admin User',
    deletedAt: '2023-10-30T15:45:00.000Z',
    originalId: 501
  },
  {
    id: 10,
    type: 'account',
    name: 'Temporary Contractor',
    email: 'temp@flnservices.com',
    role: 'Contractor',
    deletedBy: 'Admin User',
    deletedAt: '2023-11-02T11:20:00.000Z',
    originalId: 502
  },
  
  // Job Orders
  {
    id: 11,
    type: 'jobOrder',
    name: 'Cancelled Feature Implementation',
    project: 'E-commerce Platform',
    assignee: 'Developer Team',
    deletedBy: 'Project Manager',
    deletedAt: '2023-11-25T14:10:00.000Z',
    originalId: 601
  },
  {
    id: 12,
    type: 'jobOrder',
    name: 'Outdated Design Revisions',
    project: 'Corporate Website',
    assignee: 'Design Team',
    deletedBy: 'Designer',
    deletedAt: '2023-11-27T10:05:00.000Z',
    originalId: 602
  },
];

// Format date-time
const formatDateTime = (dateString) => {
  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, 'MMM d, yyyy h:mm a');
    }
    return dateString;
  } catch (error) {
    return dateString;
  }
};

// Get color for type chip
const getTypeColor = (type) => {
  switch (type) {
    case 'project':
      return 'primary';
    case 'task':
      return 'info';
    case 'proposal':
      return 'secondary';
    case 'client':
      return 'success';
    case 'account':
      return 'warning';
    case 'jobOrder':
      return 'error';
    default:
      return 'default';
  }
};

const Bin = ({ user, onLogout }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Dialog states
  const [restoreDialog, setRestoreDialog] = useState({
    open: false,
    item: null
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null
  });
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    // Simulate API call to fetch deleted items
    setLoading(true);
    setTimeout(() => {
      setItems(mockDeletedItems);
      setLoading(false);
    }, 1000);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    setLoading(true);
    // In a real app, you would fetch fresh data here
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDateFilter('all');
    setStartDate(null);
    setEndDate(null);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRestoreClick = (item) => {
    setRestoreDialog({
      open: true,
      item
    });
  };

  const handleDeleteForeverClick = (item) => {
    setDeleteDialog({
      open: true,
      item
    });
  };

  const handleRestoreConfirm = () => {
    // In a real app, you would call an API to restore the item
    const itemToRestore = restoreDialog.item;
    
    // Remove the item from the deleted items list
    setItems(items.filter(item => item.id !== itemToRestore.id));
    
    // Close dialog and show success message
    setRestoreDialog({ open: false, item: null });
    setSnackbar({
      open: true,
      message: `${itemToRestore.name} has been restored successfully.`,
      severity: 'success'
    });
  };

  const handleDeleteForeverConfirm = () => {
    // In a real app, you would call an API to permanently delete the item
    const itemToDelete = deleteDialog.item;
    
    // Remove the item from the deleted items list
    setItems(items.filter(item => item.id !== itemToDelete.id));
    
    // Close dialog and show success message
    setDeleteDialog({ open: false, item: null });
    setSnackbar({
      open: true,
      message: `${itemToDelete.name} has been permanently deleted.`,
      severity: 'info'
    });
  };

  // Apply filters to items
  const getFilteredItems = () => {
    let filtered = items;

    // Type filter based on tab
    if (tabValue > 0) {
      const typeMap = {
        1: 'project',
        2: 'task',
        3: 'proposal',
        4: 'client',
        5: 'account',
        6: 'jobOrder'
      };
      
      filtered = filtered.filter(item => item.type === typeMap[tabValue]);
    }
    
    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Type filter (for dropdown)
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      if (dateFilter === 'today') {
        cutoffDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      }
      
      filtered = filtered.filter(item => {
        const deletedDate = parseISO(item.deletedAt);
        return deletedDate >= cutoffDate;
      });
    }
    
    // Custom date range
    if (startDate && endDate) {
      filtered = filtered.filter(item => {
        const deletedDate = parseISO(item.deletedAt);
        return deletedDate >= startDate && deletedDate <= endDate;
      });
    }
    
    return filtered;
  };

  const filteredItems = getFilteredItems();
  
  // Paginate the filtered items
  const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Helper function to render the items table
  function renderItemsTable(items, tabTitle = '') {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (items.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TrashIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No deleted items found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {tabTitle ? `There are no deleted ${tabTitle.toLowerCase()} in the recycle bin.` : 'The recycle bin is empty.'}
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="deleted items table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Deleted By</TableCell>
              <TableCell>Deleted Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Typography variant="subtitle2">{item.name}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    color={getTypeColor(item.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {item.type === 'project' && (
                    <Typography variant="body2">Client: {item.client}</Typography>
                  )}
                  {item.type === 'task' && (
                    <Typography variant="body2">Project: {item.project}, Assignee: {item.assignee}</Typography>
                  )}
                  {item.type === 'proposal' && (
                    <Typography variant="body2">Client: {item.client}, Value: ${item.value}</Typography>
                  )}
                  {item.type === 'client' && (
                    <Typography variant="body2">Contact: {item.contact}, Email: {item.email}</Typography>
                  )}
                  {item.type === 'account' && (
                    <Typography variant="body2">Email: {item.email}, Role: {item.role}</Typography>
                  )}
                  {item.type === 'jobOrder' && (
                    <Typography variant="body2">Project: {item.project}, Assignee: {item.assignee}</Typography>
                  )}
                </TableCell>
                <TableCell>{item.deletedBy}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DateIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    {formatDateTime(item.deletedAt)}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Restore">
                    <IconButton
                      color="primary"
                      onClick={() => handleRestoreClick(item)}
                    >
                      <RestoreIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Permanently">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteForeverClick(item)}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Layout title="Recycle Bin">
      <PageHeader
        title="Recycle Bin"
        subtitle="View and manage deleted items from your system"
        actionButton={
          <Button
            variant="contained"
            color="primary"
            startIcon={<FilterIcon />}
            onClick={toggleFilters}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        }
      />

      {/* Filters Section */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Filter Deleted Items
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search"
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
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Item Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Item Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="project">Projects</MenuItem>
                  <MenuItem value="task">Tasks</MenuItem>
                  <MenuItem value="proposal">Proposals</MenuItem>
                  <MenuItem value="client">Clients</MenuItem>
                  <MenuItem value="account">Accounts</MenuItem>
                  <MenuItem value="jobOrder">Job Orders</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date Range"
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {dateFilter === 'custom' && (
              <>
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="From Date"
                      value={startDate}
                      onChange={(newDate) => setStartDate(newDate)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="To Date"
                      value={endDate}
                      onChange={(newDate) => setEndDate(newDate)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="bin tabs"
        >
          <Tab label="All Items" id="bin-tab-0" />
          <Tab label="Projects" id="bin-tab-1" />
          <Tab label="Tasks" id="bin-tab-2" />
          <Tab label="Proposals" id="bin-tab-3" />
          <Tab label="Clients" id="bin-tab-4" />
          <Tab label="Accounts" id="bin-tab-5" />
          <Tab label="Job Orders" id="bin-tab-6" />
        </Tabs>
      </Box>

      {/* Actions Toolbar */}
      <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {filteredItems.length} deleted {filteredItems.length === 1 ? 'item' : 'items'} found
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Deleted Items Table */}
      <TabPanel value={tabValue} index={0}>
        {renderItemsTable(paginatedItems)}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {renderItemsTable(paginatedItems, 'Projects')}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {renderItemsTable(paginatedItems, 'Tasks')}
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        {renderItemsTable(paginatedItems, 'Proposals')}
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        {renderItemsTable(paginatedItems, 'Clients')}
      </TabPanel>
      
      <TabPanel value={tabValue} index={5}>
        {renderItemsTable(paginatedItems, 'Accounts')}
      </TabPanel>
      
      <TabPanel value={tabValue} index={6}>
        {renderItemsTable(paginatedItems, 'Job Orders')}
      </TabPanel>

      {/* Pagination */}
      {filteredItems.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreDialog.open}
        onClose={() => setRestoreDialog({ open: false, item: null })}
      >
        <DialogTitle>Restore Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore "{restoreDialog.item?.name}"? This will make the item available in your system again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialog({ open: false, item: null })}>
            Cancel
          </Button>
          <Button onClick={handleRestoreConfirm} variant="contained" color="primary">
            Restore
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
      >
        <DialogTitle>Permanent Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete "{deleteDialog.item?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteForeverConfirm} variant="contained" color="error">
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Bin; 