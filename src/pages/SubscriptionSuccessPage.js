// src/pages/SubscriptionSuccessPage.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// MUI imports
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
} from '@mui/material';

/**
 * SubscriptionSuccessPage - Confirmation page displayed when a subscription
 * upgrade is successfully completed. Provides a CTA back to the dashboard.
 */
const SubscriptionSuccessPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Subscription Successful!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Thank you for upgrading your plan. Your subscription is now active.
          Feel free to explore new features or return to your dashboard.
        </Typography>
        <Box>
          <Button
            component={RouterLink}
            to="/dashboard"
            variant="contained"
            color="primary"
          >
            Go to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SubscriptionSuccessPage;
