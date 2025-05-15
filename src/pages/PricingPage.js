// src/pages/PricingPage.js
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

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
  Divider,
} from '@mui/material';

const PricingPage = () => {
  // Toggle between monthly & annual billing
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleToggle = () => {
    setBillingCycle((prev) => (prev === 'monthly' ? 'annual' : 'monthly'));
  };

  // Example monthly vs annual costs
  const freePrice = '$0';
  const proMonthlyPrice = '$49';
  const proAnnualPrice = '$529'; // e.g. $529/year for a small discount
  const enterprisePrice = 'Contact Us';

  return (
    <Container sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography variant="body1">
          Simple, transparent pricing. No hidden fees—cancel anytime.
        </Typography>
      </Box>

      {/* Billing Toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
        <Typography
          variant="body1"
          sx={{ mr: 1, fontWeight: billingCycle === 'monthly' ? 600 : 400 }}
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
          sx={{ ml: 1, fontWeight: billingCycle === 'annual' ? 600 : 400 }}
        >
          Annual (Save ~10%)
        </Typography>
      </Box>

      {/* Plan Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {/* Free Plan */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
            <Typography variant="h5">Free</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {freePrice}/month
            </Typography>
            <List sx={{ mt: 2 }}>
              <ListItem>Up to 20 employees</ListItem>
              <ListItem>Email notifications only</ListItem>
              <ListItem>Basic recognition feed</ListItem>
              <ListItem>Community support</ListItem>
            </List>
            <Button
              component={RouterLink}
              to="/signup?plan=free"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Start Free
            </Button>
          </Paper>
        </Grid>

        {/* Pro Plan */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              position: 'relative',
              border: (theme) => `2px solid ${theme.palette.primary.main}`,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: 'secondary.main',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderBottomLeftRadius: 8,
              }}
            >
              Most Popular
            </Box>
            <Typography variant="h5">Pro</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {billingCycle === 'monthly' ? proMonthlyPrice : proAnnualPrice}
              {billingCycle === 'annual' ? '/year' : '/month'}
            </Typography>
            <List sx={{ mt: 2 }}>
              <ListItem>Up to 100 employees</ListItem>
              <ListItem>Slack/Teams integration</ListItem>
              <ListItem>Calendar sync (Google, Outlook)</ListItem>
              <ListItem>Kudos wall & AI message suggestions</ListItem>
              <ListItem>Priority email support</ListItem>
            </List>
            <Button
              component={RouterLink}
              to="/signup?plan=pro"
              variant="contained"
              color="secondary"
              sx={{ mt: 2 }}
            >
              Go Pro
            </Button>
          </Paper>
        </Grid>

        {/* Enterprise Plan */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
            <Typography variant="h5">Enterprise</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {enterprisePrice}
            </Typography>
            <List sx={{ mt: 2 }}>
              <ListItem>Unlimited employees</ListItem>
              <ListItem>Full reward system & analytics</ListItem>
              <ListItem>HR integrations (BambooHR, Workday, etc.)</ListItem>
              <ListItem>Dedicated success manager</ListItem>
              <ListItem>24/7 phone & chat support</ListItem>
            </List>
            <Button
              component={RouterLink}
              to="/contact-sales"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Contact Sales
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Info / FAQ */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Frequently Asked Questions
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Do you offer a trial period for Pro?</Typography>
          <Typography variant="body1">
            Yes. When you sign up for Pro, you’ll have a 14-day free trial with
            full access to Pro features—no credit card required upfront.
          </Typography>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">
            Can I switch between monthly and annual billing?
          </Typography>
          <Typography variant="body1">
            Absolutely. You can update your billing preference at any time in
            your account settings.
          </Typography>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">What if I need a custom solution?</Typography>
          <Typography variant="body1">
            Enterprise clients often require custom integrations or security features.
            <Button
              component={RouterLink}
              to="/contact-sales"
              variant="text"
              sx={{ textTransform: 'none', ml: 1 }}
            >
              Contact our sales team
            </Button>
            to discuss your specific needs.
          </Typography>
        </Box>
      </Box>

      {/* Final CTA Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Still Not Sure?
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Book a demo call to see SparkBlaze in action. We’ll tailor a walkthrough
          to your team’s unique needs.
        </Typography>
        <Button
          component={RouterLink}
          to="/demo"
          variant="contained"
          color="primary"
        >
          Book a Demo
        </Button>
      </Box>
    </Container>
  );
};

export default PricingPage;
