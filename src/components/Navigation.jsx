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
  Avatar,
  alpha,
  Tooltip,
  Badge,
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
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import mainLogo from "../../assets/images/logo.jpg";

const Navigation = ({ drawerWidth, mobileOpen, handleDrawerToggle, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser } = useAuth();
  
  // Track expanded menu items
  const [expanded, setExpanded] = useState({});

  // Initialize expanded state based on current path
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 1) {
      const mainPath = pathParts[1];
      
      // Find which menu item should be expanded based on current path
      const menuItemToExpand = menuItems.find(item => 
        item.children && item.children.some(child => 
          child.path && child.path.startsWith(`/${mainPath}`)
        )
      );
      
      if (menuItemToExpand) {
        setExpanded(prev => ({ ...prev, [menuItemToExpand.text]: true }));
      }
    }
  }, [location.pathname]);

  const handleExpandClick = (item) => {
    setExpanded(prev => ({
      ...prev,
      [item.text]: !prev[item.text]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

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
      ],
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
    },
  ];

  const drawer = (
    <>
      <Toolbar 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          py: 2,
          px: 2,
          bgcolor: darkMode ? 'background.paper' : alpha(theme.palette.primary.main, 0.03),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 2 }}>
          <Box
            component="img"
            src={mainLogo}
            alt="Logo"
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              borderRadius: 1,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.1)',
              objectFit: 'contain'
            }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" noWrap>
              FLN Services
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Corporation
            </Typography>
          </Box>
        </Box>
        
        {currentUser && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%',
              p: 1.5,
              borderRadius: 2,
              bgcolor: darkMode ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.background.paper, 0.7),
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
            }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                mr: 1.5,
                bgcolor: 'secondary.main',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            >
              {currentUser.name ? currentUser.name.charAt(0) : 'U'}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {currentUser.name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {currentUser.role || 'Admin'}
              </Typography>
            </Box>
          </Box>
        )}
      </Toolbar>
      
      <Divider />
      
      <Box sx={{ overflow: 'auto', py: 1 }}>
        <List component="nav" disablePadding>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              {item.children ? (
                <>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleExpandClick(item)}
                      sx={{
                        py: 1.2,
                        px: 2,
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: darkMode ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          minWidth: 40,
                          color: expanded[item.text] ? 'primary.main' : 'text.secondary'
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                          fontWeight: expanded[item.text] ? 'medium' : 'regular',
                          color: expanded[item.text] ? 'primary.main' : 'text.primary'
                        }}
                      />
                      {expanded[item.text] ? <ExpandLess color="primary" /> : <ExpandMore />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={expanded[item.text]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => {
                        const active = isActive(child.path);
                        return (
                          <ListItem key={child.text} disablePadding>
                            <ListItemButton
                              onClick={() => handleNavigation(child.path)}
                              selected={active}
                              sx={{
                                pl: 6,
                                py: 1,
                                borderRadius: 0,
                                position: 'relative',
                                '&.Mui-selected': {
                                  bgcolor: darkMode ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.08),
                                  '&:hover': {
                                    bgcolor: darkMode ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.12),
                                  },
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    height: '60%',
                                    width: 3,
                                    bgcolor: 'primary.main',
                                    borderTopRightRadius: 4,
                                    borderBottomRightRadius: 4,
                                  }
                                },
                                '&:hover': {
                                  bgcolor: darkMode ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.04),
                                },
                              }}
                            >
                              <ListItemIcon 
                                sx={{ 
                                  minWidth: 28,
                                  color: active ? 'primary.main' : 'text.secondary',
                                  fontSize: '1.25rem'
                                }}
                              >
                                {active ? <ChevronRightIcon fontSize="inherit" /> : child.icon}
                              </ListItemIcon>
                              <ListItemText 
                                primary={child.text} 
                                primaryTypographyProps={{ 
                                  fontSize: '0.875rem',
                                  fontWeight: active ? 'medium' : 'regular',
                                  color: active ? 'primary.main' : 'text.primary'
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={isActive(item.path)}
                    sx={{
                      py: 1.2,
                      px: 2,
                      borderRadius: 0,
                      position: 'relative',
                      '&.Mui-selected': {
                        bgcolor: darkMode ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          bgcolor: darkMode ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.12),
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          height: '60%',
                          width: 3,
                          bgcolor: 'primary.main',
                          borderTopRightRadius: 4,
                          borderBottomRightRadius: 4,
                        }
                      },
                      '&:hover': {
                        bgcolor: darkMode ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        minWidth: 40,
                        color: isActive(item.path) ? 'primary.main' : 'text.secondary'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: isActive(item.path) ? 'medium' : 'regular',
                        color: isActive(item.path) ? 'primary.main' : 'text.primary'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
          FLN Management System v1.0.0
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          © {new Date().getFullYear()} FLN. All rights reserved.
        </Typography>
      </Box>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '1px 0 8px rgba(0, 0, 0, 0.05)'
            }
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Navigation;