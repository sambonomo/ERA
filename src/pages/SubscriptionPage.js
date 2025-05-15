// src/pages/SubscriptionPage.js
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, functions } from '../firebase/config';
import { useStripe } from '@stripe/react-stripe-js';

// MUI imports
import {
  Container,
  Box,
  Typography,
  Switch,
  Grid,
  Paper,
  Button,
  List,
  ListItem,
  Alert,
} from '@mui/material';

/**
 * SubscriptionPage - Allows users to view/change their subscription plan.
 * Integrates with Stripe for the checkout flow. 
 */
const SubscriptionPage = () => {
  const { user } = useContext(AuthContext);
  const stripe = useStripe();

  const [currentPlan, setCurrentPlan] = useState('free');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Listen for plan changes in Firestore (e.g., 'pro', 'enterprise', or 'free')
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.plan) {
          setCurrentPlan(data.plan);
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Cloud Function to create a Stripe Checkout session
  const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

  // Switch between monthly & annual billing
  const handleToggle = () => {
    setBillingCycle((prev) => (prev === 'monthly' ? 'annual' : 'monthly'));
  };

  // Subscription / Upgrade logic
  const handleSubscribe = async (plan) => {
    if (!user) {
      setMessage('Please log in to subscribe.');
      return;
    }
    if (!stripe) {
      setMessage('Stripe has not loaded yet. Please try again.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data } = await createCheckoutSession({ plan, billingCycle });
      const { sessionId } = data;

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        setMessage(result.error.message);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>
          Subscription
        </Typography>
        <Typography>You must be logged in to manage subscriptions.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Manage Your Subscription
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Your current plan: <strong>{currentPlan}</strong>
      </Typography>

      {message && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {/* Hide billing toggle if user is already Pro/Enterprise */}
      {currentPlan !== 'pro' && currentPlan !== 'enterprise' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 4,
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: billingCycle === 'monthly' ? 700 : 400 }}
          >
            Monthly
          </Typography>
          <Switch
            checked={billingCycle === 'annual'}
            onChange={handleToggle}
            color="primary"
          />
          <Typography
            variant="body1"
            sx={{ fontWeight: billingCycle === 'annual' ? 700 : 400 }}
          >
            Annual (Save 10%)
          </Typography>
        </Box>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Free Plan */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5">Free</Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              $0 / month
            </Typography>
            <List sx={{ textAlign: 'left', mt: 2 }}>
              <ListItem>Up to 20 employees</ListItem>
              <ListItem>Email notifications only</ListItem>
            </List>
            {currentPlan === 'free' ? (
              <Button variant="outlined" disabled sx={{ mt: 2 }}>
                Current Plan
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => handleSubscribe('free')}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                Downgrade to Free
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Pro Plan (skip if current plan is enterprise) */}
        {currentPlan !== 'enterprise' && (
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                border: (theme) => `2px solid ${theme.palette.primary.main}`,
              }}
            >
              <Typography variant="h5">Pro</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {billingCycle === 'monthly' ? '$49 / month' : '$529 / year'}{' '}
                {/* 10% off for annual */}
              </Typography>
              <List sx={{ textAlign: 'left', mt: 2 }}>
                <ListItem>Up to 100 employees</ListItem>
                <ListItem>Slack/Teams integration</ListItem>
                <ListItem>Calendar sync, kudos wall, AI messages</ListItem>
              </List>
              {currentPlan === 'pro' ? (
                <Button variant="outlined" disabled sx={{ mt: 2 }}>
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSubscribe('pro')}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {currentPlan === 'free' ? 'Upgrade to Pro' : 'Switch to Pro'}
                </Button>
              )}
            </Paper>
          </Grid>
        )}

        {/* Enterprise Plan */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5">Enterprise</Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              Contact us
            </Typography>
            <List sx={{ textAlign: 'left', mt: 2 }}>
              <ListItem>Unlimited employees</ListItem>
              <ListItem>Full reward system &amp; analytics</ListItem>
              <ListItem>HR integrations, 24/7 support</ListItem>
            </List>
            {currentPlan === 'enterprise' ? (
              <Button variant="outlined" disabled sx={{ mt: 2 }}>
                Current Plan
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => handleSubscribe('enterprise')}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {currentPlan === 'free' || currentPlan === 'pro'
                  ? 'Upgrade to Enterprise'
                  : 'Contact Sales'}
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Cancel or Downgrade if user is on Pro/Enterprise */}
      {(currentPlan === 'pro' || currentPlan === 'enterprise') && (
        <Box sx={{ border: '1px solid #ccc', p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Need to cancel?
          </Typography>
          <Button
            variant="contained"
            color="warning"
            disabled={loading}
            onClick={() => handleSubscribe('free')}
            sx={{ mb: 1 }}
          >
            Cancel Subscription / Downgrade to Free
          </Button>
          <Typography variant="body2">
            Note: You will immediately lose Pro/Enterprise features upon
            cancellation.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default SubscriptionPage;
