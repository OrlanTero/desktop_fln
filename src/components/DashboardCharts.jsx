import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';

// Temporary chart implementation - in production you would use a proper chart library like recharts, chart.js, or visx
const SimpleBarChart = ({ data, title, height = 200 }) => {
  const maxValue = Math.max(...data.map(item => item.value)) || 1;

  return (
    <Box sx={{ height, position: 'relative', mt: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', height: 'calc(100% - 20px)', alignItems: 'flex-end' }}>
        {data.map((item, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              mx: 0.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'primary.main',
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: '5px',
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                transition: 'height 0.5s',
              }}
            />
            <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const SimplePieChart = ({ data, title, height = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let startAngle = 0;

  return (
    <Box sx={{ height, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="#f5f5f5" />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const endAngle = startAngle + angle;

            // Calculate the path for the pie slice
            const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            const result = (
              <path key={index} d={pathData} fill={item.color || `hsl(${index * 50}, 70%, 50%)`} />
            );

            startAngle = endAngle;
            return result;
          })}
        </svg>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mx: 1, mb: 0.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                backgroundColor: item.color || `hsl(${index * 50}, 70%, 50%)`,
                mr: 0.5,
                borderRadius: '50%',
              }}
            />
            <Typography variant="caption">{item.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const SimpleLineChart = ({ data, title, height = 200 }) => {
  const maxValue = Math.max(...data.map(item => item.value)) || 1;

  // Generate path for the line
  const points = data
    .map((item, index) => {
      const x = index * (100 / (data.length - 1 || 1));
      const y = 100 - (item.value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Box sx={{ height, position: 'relative', mt: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ height: 'calc(100% - 40px)', position: 'relative' }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ overflow: 'visible' }}
        >
          {/* Grid lines */}
          <line x1="0" y1="0" x2="100" y2="0" stroke="#eee" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#eee" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#eee" strokeWidth="0.5" />

          {/* The line */}
          <polyline
            fill="none"
            stroke="primary.main"
            strokeWidth="2"
            points={points}
            style={{ stroke: '#1976d2' }}
          />

          {/* Data points */}
          {data.map((item, index) => {
            const x = index * (100 / (data.length - 1 || 1));
            const y = 100 - (item.value / maxValue) * 100;
            return <circle key={index} cx={x} cy={y} r="2" fill="#1976d2" />;
          })}
        </svg>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        {data.map((item, index) => (
          <Typography key={index} variant="caption" sx={{ fontSize: '0.7rem' }}>
            {item.label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

const DashboardCharts = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({
    proposals: [],
    projects: [],
    clients: [],
    revenue: [],
    status: [],
    activity: [],
  });

  useEffect(() => {
    fetchChartData(timeRange);
  }, [timeRange]);

  const fetchChartData = async range => {
    setLoading(true);
    try {
      // In a real app, you would fetch this data from your API
      // For now, we'll use mock data

      setTimeout(() => {
        // Sample data based on the selected time range
        let proposalsData = [];
        let projectsData = [];
        let clientsData = [];
        let revenueData = [];

        if (range === 'week') {
          proposalsData = [
            { label: 'Mon', value: 3 },
            { label: 'Tue', value: 5 },
            { label: 'Wed', value: 2 },
            { label: 'Thu', value: 7 },
            { label: 'Fri', value: 4 },
            { label: 'Sat', value: 1 },
            { label: 'Sun', value: 0 },
          ];

          revenueData = [
            { label: 'Mon', value: 1200 },
            { label: 'Tue', value: 1800 },
            { label: 'Wed', value: 800 },
            { label: 'Thu', value: 3200 },
            { label: 'Fri', value: 2500 },
            { label: 'Sat', value: 400 },
            { label: 'Sun', value: 0 },
          ];
        } else if (range === 'month') {
          proposalsData = [
            { label: 'Week 1', value: 12 },
            { label: 'Week 2', value: 8 },
            { label: 'Week 3', value: 15 },
            { label: 'Week 4', value: 10 },
          ];

          revenueData = [
            { label: 'Week 1', value: 5200 },
            { label: 'Week 2', value: 4800 },
            { label: 'Week 3', value: 7500 },
            { label: 'Week 4', value: 6200 },
          ];
        } else if (range === 'quarter') {
          proposalsData = [
            { label: 'Jan', value: 25 },
            { label: 'Feb', value: 30 },
            { label: 'Mar', value: 45 },
          ];

          revenueData = [
            { label: 'Jan', value: 15000 },
            { label: 'Feb', value: 18000 },
            { label: 'Mar', value: 25000 },
          ];
        } else if (range === 'year') {
          proposalsData = [
            { label: 'Q1', value: 100 },
            { label: 'Q2', value: 85 },
            { label: 'Q3', value: 120 },
            { label: 'Q4', value: 95 },
          ];

          revenueData = [
            { label: 'Q1', value: 58000 },
            { label: 'Q2', value: 62000 },
            { label: 'Q3', value: 75000 },
            { label: 'Q4', value: 68000 },
          ];
        }

        // Project data follows a similar pattern to proposals
        projectsData = proposalsData.map(item => ({
          label: item.label,
          value: Math.floor(item.value * 0.8), // Assume 80% of proposals become projects
        }));

        // Client growth data
        clientsData = proposalsData.map(item => ({
          label: item.label,
          value: Math.floor(item.value * 0.6), // Assume 60% of proposals are for new clients
        }));

        // Project status data
        const statusData = [
          { label: 'Completed', value: 45, color: '#4CAF50' },
          { label: 'In Progress', value: 30, color: '#2196F3' },
          { label: 'On Hold', value: 15, color: '#FFC107' },
          { label: 'Cancelled', value: 10, color: '#F44336' },
        ];

        // User activity data (last 30 days)
        const activityData = [
          { label: 'Projects', value: 68 },
          { label: 'Proposals', value: 85 },
          { label: 'Clients', value: 42 },
          { label: 'Documents', value: 120 },
          { label: 'Messages', value: 95 },
        ];

        setChartData({
          proposals: proposalsData,
          projects: projectsData,
          clients: clientsData,
          revenue: revenueData,
          status: statusData,
          activity: activityData,
        });
        setLoading(false);
      }, 1000); // Simulate API call delay
    } catch (error) {
      console.error('Error fetching chart data:', error);
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
          Performance Analytics
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
          {/* Proposal & Project Growth */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                minHeight: 350,
              }}
            >
              <Typography variant="h6">Proposal & Project Growth</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Comparison of proposals created and projects started
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <SimpleBarChart data={chartData.proposals} title="New Proposals" height={200} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SimpleBarChart data={chartData.projects} title="New Projects" height={200} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Project Status */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                minHeight: 350,
              }}
            >
              <Typography variant="h6">Project Status</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current status of all projects
              </Typography>

              <SimplePieChart data={chartData.status} title="Distribution by Status" height={250} />
            </Paper>
          </Grid>

          {/* Revenue Tracking */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                minHeight: 300,
              }}
            >
              <Typography variant="h6">Revenue Tracking</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Revenue from completed projects
              </Typography>

              <SimpleLineChart data={chartData.revenue} title="Revenue Over Time" height={230} />
            </Paper>
          </Grid>

          {/* User Activity */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                minHeight: 300,
              }}
            >
              <Typography variant="h6">System Activity</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                User activity by category
              </Typography>

              <SimpleBarChart
                data={chartData.activity}
                title="Activity Distribution"
                height={230}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DashboardCharts;
