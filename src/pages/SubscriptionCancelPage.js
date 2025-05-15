// src/pages/SubscriptionCancelPage.js
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

const SubscriptionCancelPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Subscription Canceled
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          It looks like your upgrade was canceled or something went wrong. 
          No changes have been made to your plan at this time.
        </Typography>
        <Box>
          <Button
            component={RouterLink}
            to="/subscription"
            variant="contained"
            color="primary"
          >
            Manage Subscription
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SubscriptionCancelPage;
