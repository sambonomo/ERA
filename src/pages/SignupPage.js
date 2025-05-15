// src/pages/SignupPage.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

// MUI imports
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

/**
 * SignupPage - Allows new users to create an account. 
 * If the plan query param is set (e.g., "?plan=pro"), we show the selected plan.
 */
const SignupPage = () => {
  const { signUp } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Use query param if present, else default to 'free'
  const defaultPlan = searchParams.get('plan') || 'free';
  const [plan] = useState(defaultPlan); // read-only, from query param

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signUp(email, password, displayName);
      // Possibly store plan in Firestore if plan !== 'free'
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to sign up. Maybe email is already in use.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Selected Plan: <strong>{plan}</strong>
        </Typography>

        {/* Display error (if any) in an Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSignup}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            label="Name"
            type="text"
            required
            placeholder="Your Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="contained" color="primary">
            Create Account
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupPage;
