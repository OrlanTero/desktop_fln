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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as DownloadIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Assignment as ActionIcon,
  CalendarToday as DateIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import isValid from 'date-fns/isValid';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

// Mock data for activity logs
const mockLogs = [
  {
    id: 1,
    userId: 1,
    username: 'Admin User',
    action: 'Login',
    entity: 'System',
    entityId: null,
    details: 'User logged in successfully',
    ipAddress: '192.168.1.1',
    timestamp: '2023-11-28T08:30:00.000Z',
    severity: 'info'
  },
  {
    id: 2,
    userId: 1,
    username: 'Admin User',
    action: 'Create',
    entity: 'Project',
    entityId: 5,
    details: 'Created new project "Website Redesign"',
    ipAddress: '192.168.1.1',
    timestamp: '2023-11-28T09:15:00.000Z',
    severity: 'info'
  },
  {
    id: 3,
    userId: 2,
    username: 'Project Manager',
    action: 'Update',
    entity: 'Task',
    entityId: 12,
    details: 'Updated task status to "In Progress"',
    ipAddress: '192.168.1.2',
    timestamp: '2023-11-28T10:45:00.000Z',
    severity: 'info'
  },
  {
    id: 4,
    userId: 3,
    username: 'Developer 1',
    action: 'Create',
    entity: 'Job Order',
    entityId: 8,
    details: 'Created new job order "Backend Development"',
    ipAddress: '192.168.1.3',
    timestamp: '2023-11-28T11:30:00.000Z',
    severity: 'info'
  },
  {
    id: 5,
    userId: 1,
    username: 'Admin User',
    action: 'Delete',
    entity: 'Client',
    entityId: 3,
    details: 'Deleted client "Old Client Inc."',
    ipAddress: '192.168.1.1',
    timestamp: '2023-11-28T13:20:00.000Z',
    severity: 'warning'
  },
  {
    id: 6,
    userId: 2,
    username: 'Project Manager',
    action: 'Update',
    entity: 'Proposal',
    entityId: 7,
    details: 'Updated proposal status to "Approved"',
    ipAddress: '192.168.1.2',
    timestamp: '2023-11-28T14:10:00.000Z',
    severity: 'info'
  },
  {
    id: 7,
    userId: 4,
    username: 'Designer',
    action: 'Upload',
    entity: 'Project',
    entityId: 5,
    details: 'Uploaded design assets for project',
    ipAddress: '192.168.1.4',
    timestamp: '2023-11-28T15:30:00.000Z',
    severity: 'info'
  },
  {
    id: 8,
    userId: 1,
    username: 'Admin User',
    action: 'Error',
    entity: 'System',
    entityId: null,
    details: 'Failed database backup attempt',
    ipAddress: '192.168.1.1',
    timestamp: '2023-11-28T16:45:00.000Z',
    severity: 'error'
  },
  {
    id: 9,
    userId: 3,
    username: 'Developer 1',
    action: 'Complete',
    entity: 'Task',
    entityId: 15,
    details: 'Marked task "Database Setup" as completed',
    ipAddress: '192.168.1.3',
    timestamp: '2023-11-28T17:15:00.000Z',
    severity: 'success'
  },
  {
    id: 10,
    userId: 1,
    username: 'Admin User',
    action: 'Settings',
    entity: 'System',
    entityId: null,
    details: 'Updated system email settings',
    ipAddress: '192.168.1.1',
    timestamp: '2023-11-28T18:00:00.000Z',
    severity: 'info'
  },
  {
    id: 11,
    userId: 5,
    username: 'Marketing Specialist',
    action: 'Create',
    entity: 'Proposal',
    entityId: 9,
    details: 'Created new marketing proposal',
    ipAddress: '192.168.1.5',
    timestamp: '2023-11-29T09:30:00.000Z',
    severity: 'info'
  },
  {
    id: 12,
    userId: 2,
    username: 'Project Manager',
    action: 'Assign',
    entity: 'Task',
    entityId: 16,
    details: 'Assigned task to Developer 1',
    ipAddress: '192.168.1.2',
    timestamp: '2023-11-29T10:45:00.000Z',
    severity: 'info'
  },
  {
    id: 13,
    userId: 1,
    username: 'Admin User',
    action: 'Reset',
    entity: 'User',
    entityId: 6,
    details: 'Reset password for user "New Employee"',
    ipAddress: '192.168.1.1',
    timestamp: '2023-11-29T11:30:00.000Z',
    severity: 'warning'
  },
  {
    id: 14,
    userId: 4,
    username: 'Designer',
    action: 'Update',
    entity: 'Project',
    entityId: 5,
    details: 'Updated project timeline',
    ipAddress: '192.168.1.4',
    timestamp: '2023-11-29T13:15:00.000Z',
    severity: 'info'
  },
  {
    id: 15,
    userId: 2,
    username: 'Project Manager',
    action: 'Export',
    entity: 'Reports',
    entityId: null,
    details: 'Exported monthly project report',
    ipAddress: '192.168.1.2',
    timestamp: '2023-11-29T15:00:00.000Z',
    severity: 'info'
  },
  {
    id: 16,
    userId: 3,
    username: 'Developer 1',
    action: 'Error',
    entity: 'Job Order',
    entityId: 10,
    details: 'Failed to update job order due to validation error',
    ipAddress: '192.168.1.3',
    timestamp: '2023-11-29T16:20:00.000Z',
    severity: 'error'
  },
  {
    id: 17,
    userId: 1,
    username: 'Admin User',
    action: 'Create',
    entity: 'User',
    entityId: 7,
    details: 'Created new user account "Finance Manager"',
    ipAddress: '192.168.1.1',
    timestamp: '2023-11-30T09:00:00.000Z',
    severity: 'info'
  },
  {
    id: 18,
    userId: 5,
    username: 'Marketing Specialist',
    action: 'Update',
    entity: 'Proposal',
    entityId: 9,
    details: 'Updated proposal with client feedback',
    ipAddress: '192.168.1.5',
    timestamp: '2023-11-30T10:30:00.000Z',
    severity: 'info'
  },
  {
    id: 19,
    userId: 1,
    username: 'Admin User',
    action: 'Backup',
    entity: 'System',
    entityId: null,
    details: 'Performed full system backup',
    ipAddress: '192.168.1.1',
    timestamp: '2023-11-30T12:00:00.000Z',
    severity: 'success'
  },
  {
    id: 20,
    userId: 2,
    username: 'Project Manager',
    action: 'Notify',
    entity: 'Project',
    entityId: 6,
    details: 'Sent deadline reminder to team',
    ipAddress: '192.168.1.2',
    timestamp: '2023-11-30T14:45:00.000Z',
    severity: 'info'
  },
];

// Action color mapping
const getSeverityColor = (severity) => {
  switch (severity) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'success':
      return 'success';
    case 'info':
    default:
      return 'info';
  }
};

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

const Logs = ({ user, onLogout }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    errors: 0,
    warnings: 0,
    users: 0
  });

  useEffect(() => {
    // Simulate API call to fetch logs
    setLoading(true);
    setTimeout(() => {
      setLogs(mockLogs);
      setStats({
        total: mockLogs.length,
        errors: mockLogs.filter(log => log.severity === 'error').length,
        warnings: mockLogs.filter(log => log.severity === 'warning').length,
        users: [...new Set(mockLogs.map(log => log.userId))].length
      });
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

  const handleRefresh = () => {
    setLoading(true);
    // In a real app, you would fetch fresh data here
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setEntityFilter('all');
    setSeverityFilter('all');
    setUserFilter('all');
    setStartDate(null);
    setEndDate(null);
  };

  const handleExport = () => {
    alert('Exporting logs to CSV... (This would be implemented with actual CSV export in a real app)');
  };

  // Get unique action types for filter
  const actionTypes = [...new Set(mockLogs.map(log => log.action))];
  
  // Get unique entity types for filter
  const entityTypes = [...new Set(mockLogs.map(log => log.entity))];
  
  // Get unique users for filter
  const users = [...new Set(mockLogs.map(log => log.username))];

  // Apply filters to logs
  const filteredLogs = logs.filter(log => {
    // Search term filter (case insensitive)
    const matchesSearch = searchTerm === '' || 
      Object.values(log).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Action filter
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    // Entity filter
    const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;
    
    // Severity filter
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    // User filter
    const matchesUser = userFilter === 'all' || log.username === userFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (startDate && endDate) {
      const logDate = parseISO(log.timestamp);
      matchesDateRange = logDate >= startDate && logDate <= endDate;
    }
    
    return matchesSearch && matchesAction && matchesEntity && matchesSeverity && matchesUser && matchesDateRange;
  });

  // Paginate the filtered logs
  const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Layout title="Activity Logs">
      <PageHeader
        title="Activity Logs"
        subtitle="Track and monitor all system activities and user actions"
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Logs
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                All recorded activities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="error.main" gutterBottom>
                Errors
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold" color="error.main">
                {stats.errors}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                System errors detected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="warning.main" gutterBottom>
                Warnings
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold" color="warning.main">
                {stats.warnings}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Potential issues found
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="primary.main" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold" color="primary.main">
                {stats.users}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Users with recent activity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Section */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Filter Logs
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  {actionTypes.map(action => (
                    <MenuItem key={action} value={action}>{action}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Entity</InputLabel>
                <Select
                  value={entityFilter}
                  label="Entity"
                  onChange={(e) => setEntityFilter(e.target.value)}
                >
                  <MenuItem value="all">All Entities</MenuItem>
                  {entityTypes.map(entity => (
                    <MenuItem key={entity} value={entity}>{entity}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={severityFilter}
                  label="Severity"
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <MenuItem value="all">All Severity Levels</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>User</InputLabel>
                <Select
                  value={userFilter}
                  label="User"
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user} value={user}>{user}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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

      {/* Actions Toolbar */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {filteredLogs.length} logs found
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={loading || filteredLogs.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Logs Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="activity logs table">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell align="center">Severity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DateIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {formatDateTime(log.timestamp)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                          {log.username}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ActionIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {log.action}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${log.entity}${log.entityId ? ` #${log.entityId}` : ''}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <InfoIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {log.details}
                        </Box>
                      </TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={log.severity}
                          color={getSeverityColor(log.severity)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 3 }}>
                        <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                          No logs found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your filters or check back later
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Layout>
  );
};

export default Logs; 