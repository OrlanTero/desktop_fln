import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Breadcrumbs, 
  Link, 
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { 
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  subtitle, 
  actionButton, 
  actionButtonText, 
  actionButtonIcon, 
  actionButtonPath,
  breadcrumbs,
  children
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Generate breadcrumbs from location if not provided
  const generateBreadcrumbs = () => {
    if (breadcrumbs) return breadcrumbs;
    
    const pathnames = location.pathname.split('/').filter(x => x);
    if (pathnames.length === 0) return null;
    
    return (
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
      >
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          return last ? (
            <Typography key={to} color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              {value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')}
            </Typography>
          ) : (
            <Link underline="hover" color="inherit" href={to} key={to}>
              {value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2 }}>
        {generateBreadcrumbs()}
      </Box>
      
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actionButtonText && (
          <Button
            variant="contained"
            color="primary"
            startIcon={actionButtonIcon}
            onClick={() => actionButtonPath && navigate(actionButtonPath)}
            sx={{ 
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`
            }}
          >
            {actionButtonText}
          </Button>
        )}
        
        {actionButton && actionButton}
      </Box>
      
      {/* Optional children content */}
      {children && (
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      )}
      
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

export default PageHeader; 