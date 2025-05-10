import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon,
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  DateRange as DateRangeIcon,
  Description as ReportIcon,
  Build as JobOrderIcon,
  Assignment as TaskIcon,
  Business as ClientIcon,
  People as AccountsIcon,
  Person as LiaisonIcon,
  Description as ProposalIcon,
  Engineering as ProjectIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import format from 'date-fns/format';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import ReportPDF from '../components/ReportPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for reports
const mockProjects = [
  { id: 1, name: 'Website Redesign', client: 'ABC Corp', status: 'In Progress', startDate: '2023-09-15', endDate: '2023-12-31', budget: 15000 },
  { id: 2, name: 'Mobile App Development', client: 'XYZ Inc', status: 'Completed', startDate: '2023-06-01', endDate: '2023-08-30', budget: 28000 },
  { id: 3, name: 'E-commerce Platform', client: 'Retail Solutions', status: 'Planning', startDate: '2023-11-01', endDate: '2024-03-31', budget: 35000 },
  { id: 4, name: 'CRM Integration', client: 'Global Services', status: 'In Progress', startDate: '2023-08-15', endDate: '2023-11-15', budget: 12000 },
  { id: 5, name: 'Digital Marketing Campaign', client: 'Marketing Pro', status: 'Not Started', startDate: '2023-12-01', endDate: '2024-01-31', budget: 8500 },
];

const mockClients = [
  { id: 1, name: 'ABC Corp', type: 'Corporate', contact: 'John Smith', email: 'john@abccorp.com', phone: '123-456-7890', address: '123 Business Ave' },
  { id: 2, name: 'XYZ Inc', type: 'Corporate', contact: 'Jane Doe', email: 'jane@xyzinc.com', phone: '987-654-3210', address: '456 Industry Blvd' },
  { id: 3, name: 'Retail Solutions', type: 'Retail', contact: 'Mike Johnson', email: 'mike@retailsolutions.com', phone: '555-123-4567', address: '789 Market St' },
  { id: 4, name: 'Global Services', type: 'Service', contact: 'Lisa Brown', email: 'lisa@globalservices.com', phone: '444-555-6666', address: '321 Service Rd' },
  { id: 5, name: 'Marketing Pro', type: 'Marketing', contact: 'David Wilson', email: 'david@marketingpro.com', phone: '777-888-9999', address: '555 Ad Avenue' },
];

const mockAccounts = [
  { id: 1, name: 'Admin Account', role: 'Administrator', email: 'admin@flnservices.com', lastLogin: '2023-10-15', status: 'Active' },
  { id: 2, name: 'Project Manager', role: 'Manager', email: 'manager@flnservices.com', lastLogin: '2023-10-14', status: 'Active' },
  { id: 3, name: 'Developer 1', role: 'Staff', email: 'dev1@flnservices.com', lastLogin: '2023-10-12', status: 'Active' },
  { id: 4, name: 'Designer', role: 'Staff', email: 'designer@flnservices.com', lastLogin: '2023-10-10', status: 'Active' },
  { id: 5, name: 'Marketing Specialist', role: 'Staff', email: 'marketing@flnservices.com', lastLogin: '2023-09-28', status: 'Inactive' },
];

const mockLiaisons = [
  { id: 1, name: 'John Smith', client: 'ABC Corp', position: 'IT Director', email: 'john@abccorp.com', phone: '123-456-7890' },
  { id: 2, name: 'Jane Doe', client: 'XYZ Inc', position: 'Project Manager', email: 'jane@xyzinc.com', phone: '987-654-3210' },
  { id: 3, name: 'Mike Johnson', client: 'Retail Solutions', position: 'CTO', email: 'mike@retailsolutions.com', phone: '555-123-4567' },
  { id: 4, name: 'Lisa Brown', client: 'Global Services', position: 'Operations Manager', email: 'lisa@globalservices.com', phone: '444-555-6666' },
  { id: 5, name: 'David Wilson', client: 'Marketing Pro', position: 'CMO', email: 'david@marketingpro.com', phone: '777-888-9999' },
];

const mockProposals = [
  { id: 1, title: 'Website Redesign Proposal', client: 'ABC Corp', status: 'Approved', date: '2023-09-01', amount: 15000 },
  { id: 2, name: 'Mobile App Development Proposal', client: 'XYZ Inc', status: 'Approved', date: '2023-05-15', amount: 28000 },
  { id: 3, name: 'E-commerce Platform Proposal', client: 'Retail Solutions', status: 'Pending', date: '2023-10-20', amount: 35000 },
  { id: 4, name: 'CRM Integration Proposal', client: 'Global Services', status: 'Approved', date: '2023-08-01', amount: 12000 },
  { id: 5, name: 'Digital Marketing Campaign Proposal', client: 'Marketing Pro', status: 'Rejected', date: '2023-11-15', amount: 8500 },
];

const mockJobOrders = [
  { id: 1, title: 'Homepage Design', project: 'Website Redesign', assignee: 'Designer', status: 'Completed', deadline: '2023-09-30' },
  { id: 2, title: 'Backend API Development', project: 'Mobile App Development', assignee: 'Developer 1', status: 'In Progress', deadline: '2023-07-15' },
  { id: 3, title: 'Product Catalog Setup', project: 'E-commerce Platform', assignee: 'Developer 1', status: 'Not Started', deadline: '2023-12-15' },
  { id: 4, title: 'Data Migration', project: 'CRM Integration', assignee: 'Developer 1', status: 'In Progress', deadline: '2023-09-30' },
  { id: 5, title: 'Ad Creatives Design', project: 'Digital Marketing Campaign', assignee: 'Designer', status: 'Not Started', deadline: '2023-12-10' },
];

const mockTasks = [
  { id: 1, title: 'Design Homepage Mockup', jobOrder: 'Homepage Design', assignee: 'Designer', status: 'Completed', deadline: '2023-09-25' },
  { id: 2, title: 'Implement User Authentication', jobOrder: 'Backend API Development', assignee: 'Developer 1', status: 'Completed', deadline: '2023-07-10' },
  { id: 3, title: 'Create Database Schema', jobOrder: 'Product Catalog Setup', assignee: 'Developer 1', status: 'Not Started', deadline: '2023-12-05' },
  { id: 4, title: 'Map Legacy Data', jobOrder: 'Data Migration', assignee: 'Developer 1', status: 'In Progress', deadline: '2023-09-25' },
  { id: 5, title: 'Design Banner Ads', jobOrder: 'Ad Creatives Design', assignee: 'Designer', status: 'Not Started', deadline: '2023-12-05' },
];

const Reports = ({ user, onLogout }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [reportOptions, setReportOptions] = useState({
    includeCharts: true,
    includeSummary: true,
    includeDetails: true,
  });

  // Data states - In a real app, these would come from API calls
  const [projects, setProjects] = useState(mockProjects);
  const [clients, setClients] = useState(mockClients);
  const [accounts, setAccounts] = useState(mockAccounts);
  const [liaisons, setLiaisons] = useState(mockLiaisons);
  const [proposals, setProposals] = useState(mockProposals);
  const [jobOrders, setJobOrders] = useState(mockJobOrders);
  const [tasks, setTasks] = useState(mockTasks);

  useEffect(() => {
    // In a real application, fetch data from API here
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate(null);
    setEndDate(null);
  };

  const handleFilterToggle = () => {
    setFiltersOpen(!filtersOpen);
  };

  const applyFilters = (items, type) => {
    if (!items) return [];
    
    return items.filter(item => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (item.status && item.status.toLowerCase() === statusFilter.toLowerCase());
      
      // Date range filter
      let matchesDateRange = true;
      if (startDate && endDate) {
        const itemDate = new Date(type === 'projects' ? item.startDate : 
                        type === 'proposals' ? item.date : 
                        item.deadline || item.date || item.lastLogin);
        
        matchesDateRange = itemDate >= startDate && itemDate <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  };

  const getFilteredData = (type) => {
    switch (type) {
      case 'projects':
        return applyFilters(projects, type);
      case 'clients':
        return applyFilters(clients, type);
      case 'accounts':
        return applyFilters(accounts, type);
      case 'liaisons':
        return applyFilters(liaisons, type);
      case 'proposals':
        return applyFilters(proposals, type);
      case 'jobOrders':
        return applyFilters(jobOrders, type);
      case 'tasks':
        return applyFilters(tasks, type);
      default:
        return [];
    }
  };

  const handleReportGeneration = (type) => {
    setLoading(true);
    
    // Simulate report generation process
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Report generated successfully!',
        severity: 'success'
      });
    }, 1500);
  };

  const getReportTitle = () => {
    const types = [
      'Project', 'Client', 'Account', 'Liaison', 
      'Proposal', 'Job Order', 'Task'
    ];
    return `${types[tabValue]} Report`;
  };

  const getReportData = () => {
    const types = [
      'projects', 'clients', 'accounts', 'liaisons', 
      'proposals', 'jobOrders', 'tasks'
    ];
    return getFilteredData(types[tabValue]);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOptionChange = (event) => {
    setReportOptions({
      ...reportOptions,
      [event.target.name]: event.target.checked,
    });
  };

  // Common filter UI for all tabs
  const filtersUI = (
    <Paper sx={{ p: 2, mb: 3, display: filtersOpen ? 'block' : 'none' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Report Filters</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
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
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="in progress">In Progress</MenuItem>
              <MenuItem value="not started">Not Started</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newDate) => setStartDate(newDate)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newDate) => setEndDate(newDate)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Report Options</Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={reportOptions.includeCharts}
                onChange={handleOptionChange}
                name="includeCharts"
              />
            }
            label="Include Charts"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={reportOptions.includeSummary}
                onChange={handleOptionChange}
                name="includeSummary"
              />
            }
            label="Include Summary"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={reportOptions.includeDetails}
                onChange={handleOptionChange}
                name="includeDetails"
              />
            }
            label="Include Details"
          />
        </FormGroup>
      </Box>
    </Paper>
  );

  // Common table for displaying filtered data
  const renderTable = (data, columns) => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            {columns.map((column) => (
              <TableCell key={column.id} align={column.align || 'left'} sx={{ fontWeight: 'bold' }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow key={row.id} hover>
                {columns.map((column) => (
                  <TableCell key={`${row.id}-${column.id}`} align={column.align || 'left'}>
                    {column.format ? column.format(row[column.id]) : row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Generate action buttons for reports
  const actionButtons = (type) => (
    <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
      <Button
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 800);
        }}
      >
        Refresh
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PdfIcon />}
        onClick={() => handleReportGeneration(type)}
        disabled={loading}
      >
        Generate PDF
      </Button>
      <PDFDownloadLink
        document={
          <ReportPDF
            title={getReportTitle()}
            data={getReportData()}
            options={reportOptions}
            dateRange={startDate && endDate ? `${format(startDate, 'PP')} - ${format(endDate, 'PP')}` : 'All Time'}
            user={user}
          />
        }
        fileName={`${getReportTitle().replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`}
      >
        {({ loading: pdfLoading }) => (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            disabled={pdfLoading || loading}
          >
            Download PDF
          </Button>
        )}
      </PDFDownloadLink>
    </Box>
  );

  return (
    <Layout title="Reports">
      <PageHeader
        title="Reports"
        subtitle="Generate and download detailed reports about your business operations."
        actionButton={
          <Button
            variant="contained"
            color="primary"
            startIcon={<FilterIcon />}
            onClick={handleFilterToggle}
          >
            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        }
      />

      {filtersUI}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="reports tabs"
        >
          <Tab 
            icon={<ProjectIcon />} 
            iconPosition="start" 
            label="Projects" 
            id="reports-tab-0" 
            aria-controls="reports-tabpanel-0" 
          />
          <Tab 
            icon={<ClientIcon />} 
            iconPosition="start" 
            label="Clients" 
            id="reports-tab-1" 
            aria-controls="reports-tabpanel-1" 
          />
          <Tab 
            icon={<AccountsIcon />} 
            iconPosition="start" 
            label="Accounts" 
            id="reports-tab-2" 
            aria-controls="reports-tabpanel-2" 
          />
          <Tab 
            icon={<LiaisonIcon />} 
            iconPosition="start" 
            label="Liaisons" 
            id="reports-tab-3" 
            aria-controls="reports-tabpanel-3" 
          />
          <Tab 
            icon={<ProposalIcon />} 
            iconPosition="start" 
            label="Proposals" 
            id="reports-tab-4" 
            aria-controls="reports-tabpanel-4" 
          />
          <Tab 
            icon={<JobOrderIcon />} 
            iconPosition="start" 
            label="Job Orders" 
            id="reports-tab-5" 
            aria-controls="reports-tabpanel-5" 
          />
          <Tab 
            icon={<TaskIcon />} 
            iconPosition="start" 
            label="Tasks" 
            id="reports-tab-6" 
            aria-controls="reports-tabpanel-6" 
          />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Projects Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Projects Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This report provides an overview of all projects, their status, timelines, and budgets.
            </Typography>
            
            {renderTable(getFilteredData('projects'), [
              { id: 'name', label: 'Project Name' },
              { id: 'client', label: 'Client' },
              { id: 'status', label: 'Status' },
              { id: 'startDate', label: 'Start Date' },
              { id: 'endDate', label: 'End Date' },
              { id: 'budget', label: 'Budget', align: 'right', format: (value) => `$${value.toLocaleString()}` },
            ])}

            {actionButtons('projects')}
          </TabPanel>

          {/* Clients Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Clients Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This report provides detailed information about all clients and their contact information.
            </Typography>
            
            {renderTable(getFilteredData('clients'), [
              { id: 'name', label: 'Client Name' },
              { id: 'type', label: 'Client Type' },
              { id: 'contact', label: 'Contact Person' },
              { id: 'email', label: 'Email' },
              { id: 'phone', label: 'Phone' },
              { id: 'address', label: 'Address' },
            ])}

            {actionButtons('clients')}
          </TabPanel>

          {/* Accounts Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Accounts Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This report provides information about user accounts, roles, and access levels.
            </Typography>
            
            {renderTable(getFilteredData('accounts'), [
              { id: 'name', label: 'Name' },
              { id: 'role', label: 'Role' },
              { id: 'email', label: 'Email' },
              { id: 'lastLogin', label: 'Last Login' },
              { id: 'status', label: 'Status' },
            ])}

            {actionButtons('accounts')}
          </TabPanel>

          {/* Liaisons Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Liaisons Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This report provides information about client liaisons and their contact details.
            </Typography>
            
            {renderTable(getFilteredData('liaisons'), [
              { id: 'name', label: 'Name' },
              { id: 'client', label: 'Client' },
              { id: 'position', label: 'Position' },
              { id: 'email', label: 'Email' },
              { id: 'phone', label: 'Phone' },
            ])}

            {actionButtons('liaisons')}
          </TabPanel>

          {/* Proposals Tab */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              Proposals Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This report provides an overview of all proposals, their status, and values.
            </Typography>
            
            {renderTable(getFilteredData('proposals'), [
              { id: 'title', label: 'Title' },
              { id: 'client', label: 'Client' },
              { id: 'status', label: 'Status' },
              { id: 'date', label: 'Date' },
              { id: 'amount', label: 'Amount', align: 'right', format: (value) => `$${value.toLocaleString()}` },
            ])}

            {actionButtons('proposals')}
          </TabPanel>

          {/* Job Orders Tab */}
          <TabPanel value={tabValue} index={5}>
            <Typography variant="h6" gutterBottom>
              Job Orders Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This report provides information about all job orders, their assignments, and status.
            </Typography>
            
            {renderTable(getFilteredData('jobOrders'), [
              { id: 'title', label: 'Title' },
              { id: 'project', label: 'Project' },
              { id: 'assignee', label: 'Assignee' },
              { id: 'status', label: 'Status' },
              { id: 'deadline', label: 'Deadline' },
            ])}

            {actionButtons('jobOrders')}
          </TabPanel>

          {/* Tasks Tab */}
          <TabPanel value={tabValue} index={6}>
            <Typography variant="h6" gutterBottom>
              Tasks Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This report provides detailed information about all tasks, their assignments, and status.
            </Typography>
            
            {renderTable(getFilteredData('tasks'), [
              { id: 'title', label: 'Title' },
              { id: 'jobOrder', label: 'Job Order' },
              { id: 'assignee', label: 'Assignee' },
              { id: 'status', label: 'Status' },
              { id: 'deadline', label: 'Deadline' },
            ])}

            {actionButtons('tasks')}
          </TabPanel>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Reports; 