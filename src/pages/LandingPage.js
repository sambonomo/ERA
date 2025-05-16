import React, { useEffect, useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
// MUI imports
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Rating,
  Card,
} from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import EventIcon from '@mui/icons-material/Event';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoodIcon from '@mui/icons-material/Mood';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

// Enhanced animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(255,255,255,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
`;

const glow = keyframes`
  0% { filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); }
  50% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.8)); }
  100% { filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Stats data for the stats section
const stats = [
  { value: '85%', label: 'Increase in Employee Satisfaction', icon: <TrendingUpIcon sx={{ fontSize: 40 }} /> },
  { value: '3x', label: 'Higher Employee Retention', icon: <GroupsIcon sx={{ fontSize: 40 }} /> },
  { value: '92%', label: 'Teams Report Better Morale', icon: <MoodIcon sx={{ fontSize: 40 }} /> },
  { value: '50+', label: 'Recognition Features', icon: <StarIcon sx={{ fontSize: 40 }} /> }
];

// Features data for the features section - now 8 features for 4 per row
const features = [
  {
    icon: <CelebrationIcon sx={{ fontSize: 32, color: 'white' }} />,
    title: 'Real-time Recognition',
    description: 'Celebrate wins instantly with public shoutouts and badges.',
    color: 'var(--gradient-primary)',
    hoverColor: 'var(--color-primary-light)'
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 32, color: 'white' }} />,
    title: 'Team Building',
    description: 'Strengthen team bonds through shared celebrations.',
    color: 'var(--gradient-secondary)',
    hoverColor: 'var(--color-secondary-light)'
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 32, color: 'white' }} />,
    title: 'Achievement Tracking',
    description: 'Track milestones, anniversaries, and special moments.',
    color: 'var(--gradient-accent)',
    hoverColor: 'var(--color-accent-light)'
  },
  {
    icon: <AutoFixHighIcon sx={{ fontSize: 32, color: 'white' }} />,
    title: 'AI Insights',
    description: 'Get personalized suggestions for recognition.',
    color: 'var(--gradient-celebration)',
    hoverColor: 'var(--color-celebration-light)'
  },
  {
    icon: <ShoppingCartIcon sx={{ fontSize: 32, color: 'white' }} />,
    title: 'Reward Store',
    description: 'Redeem points for meaningful rewards and gift cards.',
    color: 'var(--gradient-primary)',
    hoverColor: 'var(--color-primary-light)'
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 32, color: 'white' }} />,
    title: 'Culture Analytics',
    description: 'Track engagement metrics and team morale.',
    color: 'var(--gradient-secondary)',
    hoverColor: 'var(--color-secondary-light)'
  },
  {
    icon: <FavoriteIcon sx={{ fontSize: 32, color: 'white' }} />,
    title: 'Peer Recognition',
    description: 'Empower employees to recognize each other.',
    color: 'var(--gradient-accent)',
    hoverColor: 'var(--color-accent-light)'
  },
  {
    icon: <RocketLaunchIcon sx={{ fontSize: 32, color: 'white' }} />,
    title: 'Career Growth',
    description: 'Link recognition to professional development.',
    color: 'var(--gradient-celebration)',
    hoverColor: 'var(--color-celebration-light)'
  }
];

// Testimonials data
const testimonials = [
  {
    quote: "SparkBlaze transformed our company culture. Employee satisfaction is up 34% and turnover has decreased dramatically. The platform is intuitive and the team loves it!",
    author: "Sarah Johnson",
    role: "Chief People Officer",
    company: "TechCorp",
    avatar: "/images/testimonials/sarah.svg",
    rating: 5
  },
  {
    quote: "Implementing SparkBlaze was the best decision we made last year. Our teams are more engaged, and the peer recognition features have created a positive feedback loop across departments.",
    author: "David Chen",
    role: "HR Director",
    company: "InnovateCo",
    avatar: "/images/testimonials/david.svg",
    rating: 5
  },
  {
    quote: "We've tried several recognition platforms, but SparkBlaze stands out with its AI-powered insights and seamless integration. It's become an essential part of our company culture.",
    author: "Maya Patel",
    role: "CEO",
    company: "GlobalSoft",
    avatar: "/images/testimonials/maya.svg",
    rating: 5
  }
];

/**
 * LandingPage - The main marketing/intro page for SparkBlaze.
 * Uses Material UI Grid, Boxes, and Typography to create a
 * polished, mobile-responsive layout.
 */
const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Add an effect to fix the navbar scrolling issue
  useEffect(() => {
    // Add padding to top of page to prevent content from hiding under navbar
    const body = document.body;
    const navbar = document.querySelector('header') || document.querySelector('nav');
    
    if (navbar) {
      const navbarHeight = navbar.offsetHeight;
      body.style.paddingTop = `${navbarHeight}px`;
    }
    
    return () => {
      body.style.paddingTop = '0';
    };
  }, []);

  // Initialize particles
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Add :root CSS variable to allow using primary-rgb in rgba values
  useEffect(() => {
    // Extract the R,G,B values from primary color for use in rgba
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    const rgb = hexToRgb(primaryColor);
    if (rgb) {
      document.documentElement.style.setProperty('--color-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  }, []);

  // Helper to convert hex to RGB
  function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  return (
    <>
      <Helmet>
        <title>SparkBlaze - Ignite Employee Happiness & Recognition</title>
        <meta
          name="description"
          content="Transform your workplace culture with SparkBlaze. Celebrate achievements, boost morale, and create a positive work environment through meaningful recognition."
        />
        <meta
          property="og:title"
          content="SparkBlaze - Revolutionize Employee Recognition"
        />
        <meta
          property="og:description"
          content="Unleash a culture of appreciation with AI-powered messages, automated reminders, and real-time kudos feeds."
        />
        <meta property="og:image" content="/assets/og-image.png" />
      </Helmet>

      {/* Hero Section with Enhanced Background */}
      <Box
        className="hero-section"
        sx={{
          background: 'linear-gradient(135deg, #006060 0%, #00808F 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("/images/pattern.svg")',
            opacity: 0.08,
            pointerEvents: 'none',
            animation: `${shimmer} 20s linear infinite`,
          }
        }}
      >
        {/* Enhanced Particles */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: {
              color: {
                value: "transparent",
              },
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: ["#ffffff", "#FEEBC8", "#FEB2B2"],
              },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.1,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                },
                random: true,
                speed: 1.5,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 80,
              },
              opacity: {
                value: 0.3,
                animation: {
                  enable: true,
                  speed: 1,
                  minimumValue: 0.1,
                },
              },
              shape: {
                type: ["circle", "triangle", "star"],
              },
              size: {
                value: { min: 1, max: 3 },
                animation: {
                  enable: true,
                  speed: 2,
                  minimumValue: 0.1,
                },
              },
            },
            detectRetina: true,
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hero-content"
              >
                <Typography
                  variant="h1"
                  className="text-on-dark"
                  sx={{
                    fontSize: { xs: '2.75rem', md: '4rem' },
                    fontWeight: 800,
                    mb: 3,
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Boost Team Morale with Recognition
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255,255,255,0.95)',
                    mb: 4,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    maxWidth: '90%',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  Celebrate achievements, foster collaboration, and create a positive work environment
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: '#ffffff',
                      color: 'var(--color-primary)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease-in-out',
                      px: 5,
                      py: 2,
                      borderRadius: '12px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.8)',
                      color: '#ffffff',
                      '&:hover': {
                        borderColor: '#ffffff',
                        background: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease-in-out',
                      px: 5,
                      py: 2,
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                style={{
                  transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                  transition: 'transform 0.1s ease-out',
                }}
                className="hero-image"
              >
                <Box
                  component="img"
                  src="/images/team-recognition-illustration.svg"
                  alt="Team Recognition"
                  sx={{
                    width: '100%',
                    maxWidth: 600,
                    height: 'auto',
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                    transform: 'perspective(1000px) rotateY(-5deg)',
                    animation: `${float} 6s infinite ease-in-out`,
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section with Enhanced Design */}
      <Box
        className="section-enhanced"
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #006060 0%, #008080 100%)',
          color: 'white',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }
        }}
      >
        {/* Decorative elements */}
        <Box className="decoration-dot dot-1"></Box>
        <Box className="decoration-dot dot-2"></Box>
        <Box className="decoration-dot dot-3"></Box>
        
        <Container maxWidth="lg">
          <Box className="section-title-wrapper" sx={{ textAlign: 'center' }}>
            <Typography variant="h6" className="section-subtitle">
              Real Results
            </Typography>
            <Typography variant="h2" className="section-title" sx={{ color: 'white' }}>
              The Numbers Speak for Themselves
            </Typography>
            <Typography variant="body1" className="section-description" sx={{ color: 'rgba(255,255,255,0.9)', mb: 6 }}>
              See how companies are transforming their workplace culture with SparkBlaze
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.2, ease: [0.23, 1, 0.32, 1] }}
                  viewport={{ once: true }}
                >
                  <Box
                    className="stats-card card-common"
                  >
                    <Box
                      className="stats-icon"
                    >
                      {stat.icon}
                    </Box>
                    <Typography
                      variant="h2"
                      className="stats-value"
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="h6"
                      className="stats-label"
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section with Enhanced Design */}
      <Box 
        className="section-enhanced"
        sx={{ 
          py: { xs: 10, md: 16 }, 
          background: 'linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative elements */}
        <Box className="decoration-dot dot-1" sx={{ background: 'linear-gradient(135deg, var(--color-secondary-light) 0%, var(--color-secondary) 100%)' }}></Box>
        <Box className="decoration-dot dot-3" sx={{ right: '10%', left: 'auto' }}></Box>
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box className="section-title-wrapper" sx={{ textAlign: 'center' }}>
            <Typography variant="h6" className="section-subtitle">
              Features
            </Typography>
            <Typography variant="h2" className="section-title">
              Why Teams Love SparkBlaze
            </Typography>
            <Typography variant="body1" className="section-description">
              Everything you need to build a culture of recognition and appreciation
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  viewport={{ once: true }}
                  whileHover={{ y: -15, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }}
                >
                  <Paper
                    elevation={0}
                    className="feature-card card-common"
                    sx={{
                      '&:hover': {
                        borderColor: feature.hoverColor,
                      },
                    }}
                  >
                    <Box className="feature-card-content">
                      <Box
                        className="feature-icon-container"
                        sx={{
                          background: feature.color,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      
                      <Typography
                        variant="h6"
                        className="feature-card-title"
                      >
                        {feature.title}
                      </Typography>
                      
                      <Typography
                        variant="body1"
                        className="feature-card-description"
                      >
                        {feature.description}
                      </Typography>
                      
                      <Box 
                        className="feature-card-link"
                      >
                        Learn More
                        <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} className="feature-card-link-icon" />
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section - NEW */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        background: 'linear-gradient(180deg, #ffffff 0%, var(--color-neutral-100) 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'url("/images/dots-pattern.svg")',
          opacity: 0.03,
          zIndex: 0,
        }
      }} className="section-spacing-lg">
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box className="section-title" sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                color: 'var(--color-primary-dark)',
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                letterSpacing: '-0.02em',
                mb: 2,
              }}
            >
              What Our Customers Say
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--color-text)',
                maxWidth: '800px',
                mx: 'auto',
                mb: 6,
              }}
            >
              Join thousands of satisfied teams who have transformed their workplace culture
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="testimonial-card" elevation={4}>
                    <Box className="testimonial-content">
                      <Box sx={{ mb: 2 }}>
                        <Rating 
                          value={testimonial.rating} 
                          readOnly 
                          icon={<StarIcon sx={{ color: 'var(--color-accent)' }} />}
                        />
                      </Box>
                      <Typography className="testimonial-quote" variant="body1" sx={{ mb: 3 }}>
                        "{testimonial.quote}"
                      </Typography>
                      <Box className="testimonial-author">
                        <Avatar 
                          src={testimonial.avatar}
                          alt={testimonial.author}
                          className="testimonial-avatar"
                          sx={{ width: 60, height: 60 }}
                        />
                        <Box className="testimonial-info">
                          <Typography variant="h6" className="testimonial-name">
                            {testimonial.author}
                          </Typography>
                          <Typography variant="body2" className="testimonial-role">
                            {testimonial.role}
                          </Typography>
                          <Typography variant="body2" className="testimonial-company">
                            {testimonial.company}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Social Proof Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }} className="section-spacing-md">
        <Container maxWidth="lg">
          <Box className="section-title" sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{ 
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3rem' },
                color: 'var(--color-primary-dark)',
              }}
            >
              Trusted by Leading Companies
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '800px', mx: 'auto' }}
            >
              Join thousands of organizations that have transformed their workplace culture
            </Typography>
          </Box>
          <Grid container spacing={6} justifyContent="center" alignItems="center">
            {[
              { name: 'TechCorp', logo: '/images/logos/techcorp.svg' },
              { name: 'InnovateCo', logo: '/images/logos/innovateco.svg' },
              { name: 'GlobalSoft', logo: '/images/logos/globalsoft.svg' },
              { name: 'FutureTech', logo: '/images/logos/futuretech.svg' },
            ].map((company, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <MotionBox
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <Box
                      component="img"
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="company-logo"
                    />
                  </MotionBox>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: 'var(--color-neutral-50)',
        }}
        className="section-spacing-md"
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Paper
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: 'var(--border-radius-lg)',
                background: 'linear-gradient(135deg, #006666 0%, #553C9A 100%)',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("/images/confetti-pattern.svg")',
                  opacity: 0.08,
                  zIndex: 0,
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    mb: 3,
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Ready to Transform Your Team Culture?
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.95,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  Join thousands of companies already using SparkBlaze
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  className="animate-pulse"
                  sx={{
                    background: 'white',
                    color: 'var(--color-primary-dark)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    px: 6,
                    py: 2,
                    borderRadius: 'var(--border-radius-lg)',
                    fontWeight: 700,
                  }}
                >
                  Get Started Free
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom color="var(--color-primary)">
                SparkBlaze
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Transforming workplace culture through meaningful recognition and celebration.
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ 
                display: 'flex', 
                gap: 4, 
                justifyContent: { xs: 'center', md: 'flex-end' },
                flexWrap: 'wrap',
              }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom color="var(--color-primary-dark)">
                    Product
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button component={RouterLink} to="/features" variant="text" size="small">
                      Features
                    </Button>
                    <Button component={RouterLink} to="/pricing" variant="text" size="small">
                      Pricing
                    </Button>
                    <Button component={RouterLink} to="/demo" variant="text" size="small">
                      Book a Demo
                    </Button>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom color="var(--color-primary-dark)">
                    Company
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button component={RouterLink} to="/about" variant="text" size="small">
                      About Us
                    </Button>
                    <Button component={RouterLink} to="/contact" variant="text" size="small">
                      Contact
                    </Button>
                    <Button component={RouterLink} to="/careers" variant="text" size="small">
                      Careers
                    </Button>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom color="var(--color-primary-dark)">
                    Resources
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button component={RouterLink} to="/blog" variant="text" size="small">
                      Blog
                    </Button>
                    <Button component={RouterLink} to="/help" variant="text" size="small">
                      Help Center
                    </Button>
                    <Button component={RouterLink} to="/privacy" variant="text" size="small">
                      Privacy
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} SparkBlaze Inc. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;