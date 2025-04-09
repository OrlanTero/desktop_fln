import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  CircularProgress,
  useTheme,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, previousValue, icon, color, prefix, suffix }) => {
  const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = percentChange >= 0;

  return (
    <Paper
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          backgroundColor: color || 'primary.main',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            {prefix}
            {value.toLocaleString()}
            {suffix}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color ? `${color}` : 'primary.main', p: 1, opacity: 0.8 }}>
          {icon}
        </Avatar>
      </Box>

      {previousValue && (
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: isPositive ? 'success.main' : 'error.main',
            }}
          >
            {isPositive ? (
              <TrendingUpIcon fontSize="small" />
            ) : (
              <TrendingDownIcon fontSize="small" />
            )}
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {isPositive ? '+' : ''}
              {percentChange.toFixed(1)}% from previous period
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

const ProgressItem = ({ label, value, max, color }) => {
  const percentage = (value / max) * 100;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight="medium">
          {value.toLocaleString()} / {max.toLocaleString()}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 5,
          backgroundColor: 'background.paper',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color || 'primary.main',
          },
        }}
      />
    </Box>
  );
};

const StatusItem = ({ status, count, color }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: color,
            mr: 1.5,
          }}
        />
        <Typography variant="body2">{status}</Typography>
      </Box>
      <Typography variant="body2" fontWeight="medium">
        {count}
      </Typography>
    </Box>
  );
};

const TopItem = ({ primary, secondary, icon, color, value }) => {
  return (
    <ListItem sx={{ px: 0, py: 1 }}>
      <ListItemIcon sx={{ minWidth: 36 }}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: color }}>{icon}</Avatar>
      </ListItemIcon>
      <ListItemText
        primary={primary}
        secondary={secondary}
        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
      <Chip
        label={value}
        size="small"
        sx={{
          fontWeight: 'bold',
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      />
    </ListItem>
  );
};

const DashboardStats = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState({
    totalRevenue: 0,
    previousRevenue: 0,
    averageDealSize: 0,
    previousDealSize: 0,
    conversionRate: 0,
    previousConversionRate: 0,
    clientRetention: 0,
    previousRetention: 0,
    goalProgress: {
      revenue: { current: 0, goal: 0 },
      clients: { current: 0, goal: 0 },
      projects: { current: 0, goal: 0 },
    },
    projectStatus: [],
    topClients: [],
    recentProposals: [],
  });

  useEffect(() => {
    fetchStatsData(timeRange);
  }, [timeRange]);

  const fetchStatsData = async range => {
    setLoading(true);
    try {
      // In a real app, you would fetch this data from your API
      // For now, we'll use mock data

      setTimeout(() => {
        // Sample different data based on selected range
        let data = {
          totalRevenue: 0,
          previousRevenue: 0,
          averageDealSize: 0,
          previousDealSize: 0,
          conversionRate: 0,
          previousConversionRate: 0,
          clientRetention: 0,
          previousRetention: 0,
          goalProgress: {
            revenue: { current: 0, goal: 0 },
            clients: { current: 0, goal: 0 },
            projects: { current: 0, goal: 0 },
          },
          projectStatus: [],
          topClients: [],
          recentProposals: [],
        };

        if (range === 'week') {
          data = {
            totalRevenue: 9900,
            previousRevenue: 8500,
            averageDealSize: 2200,
            previousDealSize: 2000,
            conversionRate: 32,
            previousConversionRate: 28,
            clientRetention: 86,
            previousRetention: 84,
            goalProgress: {
              revenue: { current: 9900, goal: 12000 },
              clients: { current: 5, goal: 8 },
              projects: { current: 12, goal: 15 },
            },
            projectStatus: [
              { status: 'On Track', count: 8, color: theme.palette.success.main },
              { status: 'At Risk', count: 3, color: theme.palette.warning.main },
              { status: 'Delayed', count: 2, color: theme.palette.error.main },
              { status: 'Completed', count: 5, color: theme.palette.info.main },
            ],
            topClients: [
              {
                name: 'ABC Corporation',
                revenue: '$3,200',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.primary.light,
              },
              {
                name: 'XYZ Industries',
                revenue: '$2,800',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.secondary.light,
              },
              {
                name: 'Global Solutions',
                revenue: '$1,900',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.info.light,
              },
              {
                name: 'Tech Innovators',
                revenue: '$1,500',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.success.light,
              },
            ],
            recentProposals: [
              {
                name: 'Website Redesign',
                client: 'ABC Corporation',
                value: '$4,500',
                status: 'Pending',
                date: '2 days ago',
              },
              {
                name: 'Mobile App Development',
                client: 'Tech Innovators',
                value: '$8,200',
                status: 'Approved',
                date: '3 days ago',
              },
              {
                name: 'SEO Services',
                client: 'XYZ Industries',
                value: '$1,800',
                status: 'Sent',
                date: '5 days ago',
              },
            ],
          };
        } else if (range === 'month') {
          data = {
            totalRevenue: 42000,
            previousRevenue: 38000,
            averageDealSize: 2450,
            previousDealSize: 2300,
            conversionRate: 35,
            previousConversionRate: 31,
            clientRetention: 88,
            previousRetention: 85,
            goalProgress: {
              revenue: { current: 42000, goal: 50000 },
              clients: { current: 18, goal: 25 },
              projects: { current: 35, goal: 40 },
            },
            projectStatus: [
              { status: 'On Track', count: 22, color: theme.palette.success.main },
              { status: 'At Risk', count: 8, color: theme.palette.warning.main },
              { status: 'Delayed', count: 5, color: theme.palette.error.main },
              { status: 'Completed', count: 18, color: theme.palette.info.main },
            ],
            topClients: [
              {
                name: 'ABC Corporation',
                revenue: '$12,500',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.primary.light,
              },
              {
                name: 'XYZ Industries',
                revenue: '$9,800',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.secondary.light,
              },
              {
                name: 'Global Solutions',
                revenue: '$8,200',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.info.light,
              },
              {
                name: 'Tech Innovators',
                revenue: '$6,500',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.success.light,
              },
            ],
            recentProposals: [
              {
                name: 'Website Redesign',
                client: 'ABC Corporation',
                value: '$4,500',
                status: 'Approved',
                date: '2 weeks ago',
              },
              {
                name: 'Mobile App Development',
                client: 'Tech Innovators',
                value: '$8,200',
                status: 'Approved',
                date: '3 weeks ago',
              },
              {
                name: 'SEO Services',
                client: 'XYZ Industries',
                value: '$1,800',
                status: 'Rejected',
                date: '3 weeks ago',
              },
            ],
          };
        } else if (range === 'quarter') {
          data = {
            totalRevenue: 120000,
            previousRevenue: 105000,
            averageDealSize: 2800,
            previousDealSize: 2500,
            conversionRate: 38,
            previousConversionRate: 35,
            clientRetention: 90,
            previousRetention: 87,
            goalProgress: {
              revenue: { current: 120000, goal: 150000 },
              clients: { current: 42, goal: 60 },
              projects: { current: 85, goal: 100 },
            },
            projectStatus: [
              { status: 'On Track', count: 45, color: theme.palette.success.main },
              { status: 'At Risk', count: 15, color: theme.palette.warning.main },
              { status: 'Delayed', count: 12, color: theme.palette.error.main },
              { status: 'Completed', count: 48, color: theme.palette.info.main },
            ],
            topClients: [
              {
                name: 'ABC Corporation',
                revenue: '$28,500',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.primary.light,
              },
              {
                name: 'XYZ Industries',
                revenue: '$22,800',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.secondary.light,
              },
              {
                name: 'Global Solutions',
                revenue: '$18,400',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.info.light,
              },
              {
                name: 'Tech Innovators',
                revenue: '$15,300',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.success.light,
              },
            ],
            recentProposals: [
              {
                name: 'E-commerce Platform',
                client: 'XYZ Industries',
                value: '$24,500',
                status: 'Approved',
                date: '1 month ago',
              },
              {
                name: 'CRM Implementation',
                client: 'Global Solutions',
                value: '$18,200',
                status: 'Approved',
                date: '2 months ago',
              },
              {
                name: 'Digital Marketing Campaign',
                client: 'ABC Corporation',
                value: '$8,800',
                status: 'Pending',
                date: '2 months ago',
              },
            ],
          };
        } else if (range === 'year') {
          data = {
            totalRevenue: 480000,
            previousRevenue: 420000,
            averageDealSize: 3200,
            previousDealSize: 2800,
            conversionRate: 40,
            previousConversionRate: 36,
            clientRetention: 92,
            previousRetention: 88,
            goalProgress: {
              revenue: { current: 480000, goal: 600000 },
              clients: { current: 160, goal: 200 },
              projects: { current: 320, goal: 400 },
            },
            projectStatus: [
              { status: 'On Track', count: 180, color: theme.palette.success.main },
              { status: 'At Risk', count: 45, color: theme.palette.warning.main },
              { status: 'Delayed', count: 35, color: theme.palette.error.main },
              { status: 'Completed', count: 210, color: theme.palette.info.main },
            ],
            topClients: [
              {
                name: 'ABC Corporation',
                revenue: '$98,500',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.primary.light,
              },
              {
                name: 'XYZ Industries',
                revenue: '$78,800',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.secondary.light,
              },
              {
                name: 'Global Solutions',
                revenue: '$65,400',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.info.light,
              },
              {
                name: 'Tech Innovators',
                revenue: '$52,300',
                icon: <PersonIcon fontSize="small" />,
                color: theme.palette.success.light,
              },
            ],
            recentProposals: [
              {
                name: 'Enterprise Digital Transformation',
                client: 'ABC Corporation',
                value: '$124,500',
                status: 'Approved',
                date: '6 months ago',
              },
              {
                name: 'IT Infrastructure Overhaul',
                client: 'XYZ Industries',
                value: '$98,200',
                status: 'Completed',
                date: '8 months ago',
              },
              {
                name: 'Cloud Migration Services',
                client: 'Global Solutions',
                value: '$76,800',
                status: 'Completed',
                date: '10 months ago',
              },
            ],
          };
        }

        setStatsData(data);
        setLoading(false);
      }, 1000); // Simulate API call delay
    } catch (error) {
      console.error('Error fetching stats data:', error);
      setLoading(false);
    }
  };

  const handleRangeChange = event => {
    setTimeRange(event.target.value);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Business Performance Metrics
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={timeRange}
            onChange={handleRangeChange}
            displayEmpty
            sx={{ backgroundColor: 'background.paper', '& fieldset': { borderColor: 'divider' } }}
          >
            <MenuItem value="week">Last 7 days</MenuItem>
            <MenuItem value="month">Last 30 days</MenuItem>
            <MenuItem value="quarter">Last 90 days</MenuItem>
            <MenuItem value="year">Last 12 months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Total Revenue"
              value={statsData.totalRevenue}
              previousValue={statsData.previousRevenue}
              icon={<AttachMoneyIcon />}
              color={theme.palette.success.main}
              prefix="$"
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Average Deal Size"
              value={statsData.averageDealSize}
              previousValue={statsData.previousDealSize}
              icon={<TimelineIcon />}
              color={theme.palette.primary.main}
              prefix="$"
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Conversion Rate"
              value={statsData.conversionRate}
              previousValue={statsData.previousConversionRate}
              icon={<AssignmentIcon />}
              color={theme.palette.secondary.main}
              suffix="%"
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Client Retention"
              value={statsData.clientRetention}
              previousValue={statsData.previousRetention}
              icon={<PersonIcon />}
              color={theme.palette.info.main}
              suffix="%"
            />
          </Grid>

          {/* Goal Progress */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Goal Progress
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Track your progress toward quarterly targets
              </Typography>

              <ProgressItem
                label="Revenue Target"
                value={statsData.goalProgress.revenue.current}
                max={statsData.goalProgress.revenue.goal}
                color={theme.palette.success.main}
              />

              <ProgressItem
                label="New Client Acquisition"
                value={statsData.goalProgress.clients.current}
                max={statsData.goalProgress.clients.goal}
                color={theme.palette.primary.main}
              />

              <ProgressItem
                label="Project Completion"
                value={statsData.goalProgress.projects.current}
                max={statsData.goalProgress.projects.goal}
                color={theme.palette.secondary.main}
              />
            </Paper>
          </Grid>

          {/* Project Status */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Project Health
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Status breakdown of active projects
              </Typography>

              {statsData.projectStatus.map((item, index) => (
                <StatusItem
                  key={index}
                  status={item.status}
                  count={item.count}
                  color={item.color}
                />
              ))}
            </Paper>
          </Grid>

          {/* Top Clients */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Top Clients
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Clients with highest revenue contribution
              </Typography>

              <List sx={{ pt: 1 }}>
                {statsData.topClients.map((client, index) => (
                  <React.Fragment key={index}>
                    <TopItem
                      primary={client.name}
                      secondary="Revenue contribution"
                      icon={client.icon}
                      color={client.color}
                      value={client.revenue}
                    />
                    {index < statsData.topClients.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Recent Proposals */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Proposals
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Latest proposal submissions and their status
              </Typography>

              <List sx={{ pt: 1 }}>
                {statsData.recentProposals.map((proposal, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemText
                        primary={proposal.name}
                        secondary={`${proposal.client} • ${proposal.date}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={proposal.value}
                          size="small"
                          sx={{
                            mr: 1,
                            fontWeight: 'bold',
                            backgroundColor: 'background.paper',
                            border: 1,
                            borderColor: 'divider',
                          }}
                        />
                        <Chip
                          label={proposal.status}
                          size="small"
                          color={
                            proposal.status === 'Approved'
                              ? 'success'
                              : proposal.status === 'Pending'
                              ? 'warning'
                              : proposal.status === 'Rejected'
                              ? 'error'
                              : 'default'
                          }
                          icon={
                            proposal.status === 'Approved' ? (
                              <CheckCircleIcon fontSize="small" />
                            ) : proposal.status === 'Pending' ? (
                              <WarningIcon fontSize="small" />
                            ) : null
                          }
                          variant="outlined"
                        />
                      </Box>
                    </ListItem>
                    {index < statsData.recentProposals.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DashboardStats;
