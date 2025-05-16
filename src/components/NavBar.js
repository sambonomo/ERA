// src/components/NavBar.js
import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// MUI imports
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';

/**
 * NavBar - A top navigation bar showing SparkBlaze brand and route-based buttons.
 * Switches between "Log In / Sign Up" vs. "Dashboard / Rewards / Subscription / Log Out" 
 * depending on whether the user is logged in.
 */
const NavBar = () => {
  const { user, logOut } = useContext(AuthContext);
  const location = useLocation();
  const [isTransparent, setIsTransparent] = useState(location.pathname === '/');
  
  // Detect if we're on the landing page
  const isLandingPage = location.pathname === '/';
  
  // Handle scroll to change navbar appearance
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });
  
  // Update transparency based on scroll position and route changes
  useEffect(() => {
    setIsTransparent(location.pathname === '/' && !trigger);
  }, [location.pathname, trigger]);

  const handleLogout = async () => {
    try {
      await logOut();
      // Possibly redirect to "/"
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Helper to get initials from name or email
  const getInitials = () => {
    if (!user) return '?';
    
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    // Fallback to email
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <Slide appear={false} direction="down" in={!trigger || !isLandingPage}>
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: isTransparent ? 'transparent' : 'var(--color-primary)',
          boxShadow: isTransparent ? 'none' : undefined,
          transition: 'background-color 0.3s ease',
          backdropFilter: isTransparent ? undefined : 'blur(10px)',
        }}
        elevation={isTransparent ? 0 : 4}
      >
        <Toolbar>
          {/* Brand / Logo linking to Home */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit', // Use AppBar's text color
              fontWeight: 'bold',
            }}
          >
            SparkBlaze
          </Typography>

          {/* Right-side Buttons */}
          {!user && (
            <Stack direction="row" spacing={2}>
              <Button component={RouterLink} to="/pricing" color="inherit">
                Pricing
              </Button>
              <Button 
                component={RouterLink} 
                to="/login" 
                variant="outlined" 
                color="inherit" 
                sx={{ 
                  borderColor: 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Log In
              </Button>
              <Button 
                component={RouterLink} 
                to="/signup" 
                variant="contained" 
                sx={{ 
                  bgcolor: isTransparent ? 'white' : 'var(--color-accent)',
                  color: isTransparent ? 'var(--color-primary)' : 'white',
                  '&:hover': {
                    bgcolor: isTransparent ? 'rgba(255,255,255,0.9)' : 'var(--color-accent-dark)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}
              >
                Sign Up
              </Button>
            </Stack>
          )}

          {user && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button component={RouterLink} to="/dashboard" color="inherit">
                Dashboard
              </Button>
              <Button component={RouterLink} to="/directory" color="inherit">
                Directory
              </Button>
              <Button component={RouterLink} to="/rewards" color="inherit">
                Rewards
              </Button>
              <Button component={RouterLink} to="/subscription" color="inherit">
                Subscription
              </Button>
              <Tooltip title={user.displayName || user.email}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    ml: 1,
                    bgcolor: 'var(--color-accent)',
                    color: 'white',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  {getInitials()}
                </Avatar>
              </Tooltip>
              <Button 
                onClick={handleLogout} 
                variant="outlined" 
                color="inherit"
                size="small"
                sx={{ 
                  ml: 1, 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Log Out
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
    </Slide>
  );
};

export default NavBar;
