import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { setUserAsAdmin, initializeSystemSettings } from '../utils/setAdmin';
import { motion } from 'framer-motion';

// MUI imports
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  LinearProgress,
  Snackbar,
  useTheme,
} from '@mui/material';

// MUI Icons
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';

const MotionPaper = motion(Paper);

/**
 * AdminUtility - A developer tool to easily set the current user as an admin
 * and initialize admin portal settings for testing purposes
 */
const AdminUtility = () => {
  const { user, userData } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();

  const handleSetAdmin = async () => {
    if (!user) {
      setError('You must be logged in to use this feature');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Make current user an admin
      await setUserAsAdmin(user.uid);
      
      // Initialize system settings if they don't exist
      await initializeSystemSettings();
      
      setSuccess('You are now an admin! Please refresh the page to see the admin portal.');
    } catch (err) {
      console.error('Error setting admin:', err);
      setError(err.message || 'Failed to set as admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ 
        p: 3, 
        borderRadius: 'var(--border-radius-lg)',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, var(--color-celebration) 0%, var(--color-secondary) 100%)',
          zIndex: 1
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: 'var(--color-primary-dark)', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AdminPanelSettingsIcon /> Developer Utility
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          This utility lets you quickly set yourself as an admin to test the admin portal functionality.
        </Typography>
        
        {loading && <LinearProgress sx={{ mb: 2 }} color="primary" />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Current role: <strong>{userData?.role || 'user'}</strong>
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AdminPanelSettingsIcon />}
            onClick={handleSetAdmin}
            disabled={loading || userData?.role === 'admin'}
            sx={{ 
              bgcolor: 'var(--color-primary)',
              '&:hover': {
                bgcolor: 'var(--color-primary-dark)',
              },
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            {userData?.role === 'admin' ? 'Already Admin' : 'Make Me Admin'}
          </Button>
        </Box>
        
        {userData?.role === 'admin' && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
            <Typography variant="body2" color="text.secondary">
              You already have admin privileges. Refresh the page to see the admin portal.
            </Typography>
          </Box>
        )}
      </Box>
    </MotionPaper>
  );
};

export default AdminUtility; 