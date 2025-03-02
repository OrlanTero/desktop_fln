import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { keyframes } from '@mui/system';
import logoPath from '../../assets/images/logo.png';

// Define animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 100) {
          clearInterval(timer);
          // Wait a bit after reaching 100% before calling onFinish
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);

    return () => {
      clearInterval(timer);
    };
  }, [onFinish]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #842624 0%, #264888 100%)', // FLN colors gradient
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          animation: `${fadeIn} 1s ease-out, ${pulse} 2s infinite ease-in-out`,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Use the actual logo from assets */}
        <Box
          component="img"
          src={logoPath}
          alt="FLN Logo"
          sx={{
            width: 180,
            height: 'auto',
            mb: 2,
            objectFit: 'contain',
          }}
        />
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 1,
          }}
        >
          FLN Services Corporation
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'white',
            textAlign: 'center',
            opacity: 0.9,
          }}
        >
          Desktop Application
        </Typography>
      </Box>

      <CircularProgress
        variant="determinate"
        value={progress}
        size={60}
        thickness={4}
        sx={{
          color: 'white',
          mt: 2,
        }}
      />
      <Typography
        variant="body1"
        sx={{
          color: 'white',
          mt: 2,
          opacity: 0.9,
        }}
      >
        Loading... {progress}%
      </Typography>
    </Box>
  );
};

export default SplashScreen; 