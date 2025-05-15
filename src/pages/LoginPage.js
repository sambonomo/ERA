// src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// MUI imports
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from '@mui/material';

/**
 * LoginPage - Provides a login form for users to authenticate.
 * If email verification is required, you can add a check after signIn
 * to ensure the user has a verified email. For example, if user.emailVerified === false,
 * show an alert or redirect them to a "Verify Email" page.
 */
const LoginPage = () => {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // signIn presumably wraps createUserWithEmailAndPassword or signInWithEmailAndPassword
      // then updates auth context. If email verification is needed, we can add a check after signIn.
      const userCred = await signIn(email, password);

      // Optional: check if user is verified
      // if (userCred && !userCred.user.emailVerified) {
      //   setError('Your email address is not verified. Please verify before continuing.');
      //   return;
      // }

      // If success, navigate
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to log in. Check your credentials.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Log In
        </Typography>

        {/* If there's an error, display it as an Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2, // spacing between inputs
            mt: 2,
          }}
        >
          <TextField
            label="Email"
            type="email"
            required
            placeholder="example@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="contained" color="primary">
            Log In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
