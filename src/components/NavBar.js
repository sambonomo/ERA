// src/components/NavBar.js
import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// MUI imports
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const NavBar = () => {
  const { user, logOut } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logOut();
      // Possibly redirect to "/"
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Brand / Logo */}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit', // so it matches AppBar text color
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
            <Button component={RouterLink} to="/login" variant="outlined" color="inherit">
              Log In
            </Button>
            <Button component={RouterLink} to="/signup" variant="contained" color="secondary">
              Sign Up
            </Button>
          </Stack>
        )}
        {user && (
          <Stack direction="row" spacing={2}>
            <Button component={RouterLink} to="/dashboard" color="inherit">
              Dashboard
            </Button>
            <Button component={RouterLink} to="/rewards" color="inherit">
              Rewards
            </Button>
            <Button component={RouterLink} to="/subscription" color="inherit">
              Subscription
            </Button>
            <Button onClick={handleLogout} variant="outlined" color="inherit">
              Log Out
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
