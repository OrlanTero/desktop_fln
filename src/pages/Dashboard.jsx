import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
} from '@mui/material';
import {
  People as PeopleIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  Insights as InsightsIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import DashboardCharts from '../components/DashboardCharts';
import DashboardStats from '../components/DashboardStats';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    totalClients: 0,
    totalProposals: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users stats
      const users = await window.api.user.getAll();
      if (users.success) {
        const userData = users.data;

        // Fetch other stats
        const clients = await window.api.client.getAll();
        const proposals = await window.api.proposal.getAll();
        const projects = await window.api.project.getAll();

        setStats({
          totalUsers: userData.length,
          activeUsers: userData.filter(u => u.role !== 'inactive').length,
          adminUsers: userData.filter(u => u.role === 'admin').length,
          totalClients: clients.success ? clients.data.length : 0,
          totalProposals: proposals.success ? proposals.data.length : 0,
          totalProjects: projects.success ? projects.data.length : 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = path => {
    navigate(path);
  };

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Layout title="Dashboard" showBreadcrumbs={false}>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's an overview of your system."
        actionButton={
          <Tooltip title="Refresh Dashboard">
            <IconButton
              color="primary"
              onClick={refreshDashboard}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': { bgcolor: 'background.paper' },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      <Box>
        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalUsers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', p: 1 }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 'auto' }}>
                <Typography variant="body2" color="text.secondary">
                  {stats.activeUsers} active users
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  backgroundColor: 'secondary.main',
                },
              }}
            >
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Clients
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalClients}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.light', p: 1 }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 'auto' }}>
                <Button size="small" onClick={() => navigateTo('/clients')} sx={{ p: 0 }}>
                  View all clients
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  backgroundColor: 'info.main',
                },
              }}
            >
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Proposals
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalProposals}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light', p: 1 }}>
                  <DescriptionIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 'auto' }}>
                <Button size="small" onClick={() => navigateTo('/proposals')} sx={{ p: 0 }}>
                  View all proposals
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  backgroundColor: 'success.main',
                },
              }}
            >
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Projects
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalProjects}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', p: 1 }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 'auto' }}>
                <Button size="small" onClick={() => navigateTo('/projects')} sx={{ p: 0 }}>
                  View all projects
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Dashboard Tabs */}
        <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="dashboard tabs"
          >
            <Tab label="Overview" icon={<HomeIcon />} iconPosition="start" />
            <Tab label="Charts & Analytics" icon={<BarChartIcon />} iconPosition="start" />
            <Tab label="Advanced Statistics" icon={<InsightsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Quick Actions */}
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Quick Actions
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <AddIcon />
                    </Avatar>
                    <Typography variant="h6">New Client</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Add a new client to the system with contact details and preferences.
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigateTo('/clients/new')}
                    startIcon={<AddIcon />}
                  >
                    Add Client
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <DescriptionIcon />
                    </Avatar>
                    <Typography variant="h6">New Proposal</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Create a new proposal for a client with detailed service offerings and pricing.
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => navigateTo('/proposals/new')}
                    startIcon={<AddIcon />}
                  >
                    Create Proposal
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Typography variant="h6">New Project</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Start a new project from an approved proposal or create one from scratch.
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button
                    size="small"
                    color="info"
                    onClick={() => navigateTo('/projects/new')}
                    startIcon={<AddIcon />}
                  >
                    Start Project
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DashboardCharts />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <DashboardStats />
        </TabPanel>
      </Box>
    </Layout>
  );
};

export default Dashboard;
