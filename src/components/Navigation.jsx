import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  Business as ClientsIcon,
  People as UsersIcon,
  Category as ClientTypesIcon,
  Category as CategoryIcon,
  Handyman as ServicesIcon,
  Assignment as ProjectManagerIcon,
  Description as ProposalsIcon,
  Engineering as ProjectsIcon,
  Task as TasksIcon,
  InsertDriveFile as DocumentsIcon,
  Payments as FinanceIcon,
  Receipt as BillingIcon,
  MonetizationOn as PayrollIcon,
  Assessment as ReportsIcon,
  Article as ReportsDocIcon,
  History as LogsIcon,
  DeleteOutline as BinIcon,
  Backup as BackUpIcon,
  Chat as MessengerIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Transform as TransformIcon,
} from '@mui/icons-material';

const Navigation = ({ drawerWidth, mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State to track which menu items are expanded
  const [expanded, setExpanded] = useState({
    administrator: false,
    services: false,
    projectManager: false,
    finance: false,
    reports: false,
  });

  // Expand Project Manager section when on Proposals or Projects pages
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/proposals') || path.includes('/projects') || path.includes('/job-orders')) {
      setExpanded(prev => ({
        ...prev,
        projectManager: true
      }));
    }
  }, [location.pathname]);

  // Toggle expanded state for a menu item
  const handleExpandClick = (item) => {
    setExpanded({
      ...expanded,
      [item]: !expanded[item],
    });
  };

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Menu items structure
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      text: 'Administrator',
      icon: <AdminIcon />,
      children: [
        {
          text: 'Clients',
          icon: <ClientsIcon />,
          path: '/clients',
        },
        {
          text: 'Users',
          icon: <UsersIcon />,
          path: '/users',
        },
        {
          text: 'Client Types',
          icon: <ClientTypesIcon />,
          path: '/client-types',
        },
      ],
    },
    {
      text: 'Services',
      icon: <ServicesIcon />,
      children: [
        {
          text: 'Service Categories',
          icon: <CategoryIcon />,
          path: '/service-categories',
        },
        {
          text: 'Services',
          icon: <ServicesIcon />,
          path: '/services',
        },
      ],
    },
    {
      text: 'Project Manager',
      icon: <ProjectManagerIcon />,
      children: [
        {
          text: 'Proposals',
          icon: <ProposalsIcon />,
          path: '/proposals',
        },
        {
          text: 'Projects',
          icon: <ProjectsIcon />,
          path: '/projects',
        },
        {
          text: 'Job Orders',
          icon: <TasksIcon />,
          path: '/job-orders',
        },
        {
          text: 'Tasks',
          icon: <TasksIcon />,
          path: '/tasks',
        },
      ],
    },
    {
      text: 'Documents',
      icon: <DocumentsIcon />,
      path: '/documents',
    },
    {
      text: 'Finance',
      icon: <FinanceIcon />,
      children: [
        {
          text: 'Billing',
          icon: <BillingIcon />,
          path: '/billing',
        },
        {
          text: 'Payroll',
          icon: <PayrollIcon />,
          path: '/payroll',
        },
      ],
    },
    {
      text: 'Reports',
      icon: <ReportsIcon />,
      children: [
        {
          text: 'Reports',
          icon: <ReportsDocIcon />,
          path: '/reports',
        },
        {
          text: 'Logs',
          icon: <LogsIcon />,
          path: '/logs',
        },
        {
          text: 'Bin',
          icon: <BinIcon />,
          path: '/bin',
        },
        {
          text: 'Back Up',
          icon: <BackUpIcon />,
          path: '/backup',
        },
      ],
    },
    {
      text: 'Messenger',
      icon: <MessengerIcon />,
      path: '/messenger',
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
    },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          FLN Services
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {item.children ? (
              // Parent item with children
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleExpandClick(item.text.toLowerCase().replace(' ', ''))}
                    sx={{
                      bgcolor: expanded[item.text.toLowerCase().replace(' ', '')] ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {expanded[item.text.toLowerCase().replace(' ', '')] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={expanded[item.text.toLowerCase().replace(' ', '')]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem key={child.text} disablePadding>
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={() => handleNavigation(child.path)}
                          selected={isActive(child.path)}
                        >
                          <ListItemIcon>{child.icon}</ListItemIcon>
                          <ListItemText primary={child.text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              // Single item without children
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="navigation menu"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Navigation; 