// src/pages/LandingPage.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
// MUI imports
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
} from '@mui/material';

/**
 * LandingPage - The main marketing/intro page for SparkBlaze.
 * Uses Material UI Grid, Boxes, and Typography to create a
 * polished, mobile-responsive layout.
 */
const LandingPage = () => {
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          py: 6,
          backgroundColor: 'background.paper',
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            {/* Left Column: Text */}
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom>
                Revolutionize Employee Recognition
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                SparkBlaze is the <strong>best-in-class</strong> platform for
                celebrating birthdays, work anniversaries, and peer
                recognition—all from a single hub. Unleash a culture of
                appreciation with AI-powered messages, automated reminders, and
                real-time kudos feeds.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  color="primary"
                >
                  Get Started for Free
                </Button>
                <Button
                  component={RouterLink}
                  to="/pricing"
                  variant="outlined"
                  color="primary"
                >
                  View Pricing
                </Button>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/how-it-works"
                  variant="contained"
                  color="secondary"
                >
                  See How It Works
                </Button>
              </Box>
            </Grid>

            {/* Right Column: Optional Hero Image */}
            <Grid item xs={12} md={6} textAlign="center">
              {/* Uncomment or replace with your illustration */}
              {/* 
              <img
                src="/assets/hero-illustration.png"
                alt="Employee recognition illustration"
                style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
              />
              */}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Core Features Overview */}
      <Box sx={{ py: 6 }}>
        <Container>
          <Typography variant="h4" gutterBottom>
            Why SparkBlaze?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Our mission is to ignite employee happiness by blending automated
            milestones with a real-time recognition feed. Track birthdays,
            service anniversaries, kudos, and more—effortlessly.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Automated Birthday Reminders</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Never miss a birthday again. SparkBlaze sends Slack, Teams, or
                  email notifications so everyone can celebrate together.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Service Anniversaries</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Recognize milestones like 1-year, 5-year, or 10-year
                  anniversaries with heartfelt messages. SparkBlaze keeps track
                  automatically.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Peer-to-Peer Kudos</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Foster a culture of collaboration and appreciation. Public
                  shoutouts, badges, and comments light up your Kudos Wall—
                  instantly.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">AI-Powered Suggestions</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Unsure what to say? Let SparkBlaze craft a thoughtful note or
                  congratulations message—personalize and send with one click.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Reward Marketplace</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Offer points for each kudos received and redeem them for gift
                  cards, company swag, or charitable donations (Pro &amp;
                  Enterprise tiers).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Advanced Analytics</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Monitor morale and engagement with real-time dashboards.
                  Identify top contributors, highlight achievements, and spot
                  burnout early.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Integrations / Advanced Section */}
      <Box sx={{ py: 6, backgroundColor: 'background.paper' }}>
        <Container>
          <Typography variant="h4" gutterBottom>
            Seamless Integrations
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Stay in the flow of work with built-in Slack, Microsoft Teams, and
            Google Calendar sync. Export data to your existing HR tools or
            intranet with ease.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <img src="/assets/slack-logo.png" alt="Slack" height={50} />
            <img src="/assets/teams-logo.png" alt="Teams" height={50} />
            <img
              src="/assets/google-calendar-logo.png"
              alt="Google Calendar"
              height={50}
            />
          </Box>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: 6 }}>
        <Container>
          <Typography variant="h4" gutterBottom>
            What Our Customers Say
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  “SparkBlaze completely transformed our company culture!
                  Everyone loves seeing birthdays and kudos in real
                  time—and it’s a breeze to set up.”
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  – Lisa, HR Manager at TechCo
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  “In just a few months, morale went through the roof. Our
                  employees feel recognized and appreciated every day.”
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  – Mark, CEO of InnovateCorp
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  “The AI-powered message suggestions saved me so much time. I
                  can send thoughtful notes without worrying about writer’s
                  block!”
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  – Ashley, Team Lead at GrowthSpark
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ / Additional Info */}
      <Box sx={{ py: 6, backgroundColor: 'background.paper' }}>
        <Container>
          <Typography variant="h4" gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">How easy is it to set up SparkBlaze?</Typography>
            <Typography variant="body1">
              Incredibly easy! You can have your entire organization onboarded
              within minutes. No special IT knowledge required.
            </Typography>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Do you offer a free plan?</Typography>
            <Typography variant="body1">
              Yes! Our Free tier accommodates up to 20 employees with email
              notifications only. Upgrade anytime for advanced features.
            </Typography>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">What if I need customized integrations?</Typography>
            <Typography variant="body1">
              Our Enterprise plan supports custom integrations and VIP support.
              <Button
                component={RouterLink}
                to="/contact"
                variant="text"
                color="primary"
                sx={{ textTransform: 'none', ml: 1 }}
              >
                Contact us
              </Button>
              for more info.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
          color: '#fff',
          backgroundColor: 'primary.main',
        }}
      >
        <Container>
          <Typography variant="h4" gutterBottom>
            Ready to Spark Engagement?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            Get started in under 5 minutes—no complex setup, no hassle.
            Join SparkBlaze today and let the recognition begin!
          </Typography>
          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            color="secondary"
          >
            Sign Up Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          backgroundColor: 'background.paper',
          textAlign: 'center',
        }}
      >
        <Container>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
            <Button component={RouterLink} to="/pricing" variant="text">
              Pricing
            </Button>
            <Button component={RouterLink} to="/features" variant="text">
              Features
            </Button>
            <Button component={RouterLink} to="/demo" variant="text">
              Book a Demo
            </Button>
            <Button component={RouterLink} to="/contact" variant="text">
              Contact Us
            </Button>
          </Box>
          <Typography variant="body2" color="textSecondary">
            © {new Date().getFullYear()} SparkBlaze Inc. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;
