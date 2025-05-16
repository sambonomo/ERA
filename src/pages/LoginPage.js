// src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

// MUI imports
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Link,
  useTheme,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const MotionPaper = motion(Paper);

/**
 * LoginPage - Provides a login form for users to authenticate.
 * Features a modern design with our new color scheme and animations.
 */
const LoginPage = () => {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCred = await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to log in. Check your credentials.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            background: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'var(--color-primary)',
                color: 'white',
                mb: 2,
              }}
            >
              <LockOutlinedIcon />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: 'var(--color-neutral-800)',
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Sign in to continue to SparkBlaze
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 'var(--border-radius-md)',
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              label="Email"
              type="email"
              required
              placeholder="example@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <EmailOutlinedIcon 
                    sx={{ 
                      mr: 1,
                      color: 'var(--color-neutral-400)',
                    }} 
                  />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 'var(--border-radius-md)',
                  '&:hover fieldset': {
                    borderColor: 'var(--color-primary)',
                  },
                },
              }}
            />

            <TextField
              label="Password"
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <LockOutlinedIcon 
                    sx={{ 
                      mr: 1,
                      color: 'var(--color-neutral-400)',
                    }} 
                  />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 'var(--border-radius-md)',
                  '&:hover fieldset': {
                    borderColor: 'var(--color-primary)',
                  },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 'var(--border-radius-md)',
                background: 'var(--color-primary)',
                '&:hover': {
                  background: 'var(--color-primary-dark)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Sign In
            </Button>

            <Box
              sx={{
                mt: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/signup"
                  sx={{
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      color: 'var(--color-primary-dark)',
                    },
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </MotionPaper>
      </Container>
    </Box>
  );
};

export default LoginPage;
