// src/pages/Dashboard.js
import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion from framer-motion

// MUI imports
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Divider,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// Icons 
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CakeIcon from '@mui/icons-material/Cake';
import WorkIcon from '@mui/icons-material/Work';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// Custom components
import RecognitionForm from '../components/RecognitionForm';
import KudosFeed from '../components/KudosFeed';
import AdminPortal from '../components/AdminPortal';
import AdminUtility from '../components/AdminUtility';

// Create animated variants using motion from framer-motion
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

/**
 * Dashboard - Displays quick stats on Kudos, upcoming birthdays/anniversaries,
 * and a placeholder for recent kudos. Uses MUI components for layout and styling.
 */
const Dashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [kudosCount, setKudosCount] = useState(0);
  const [anniversaries, setAnniversaries] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const recognitionFormRef = useRef();

  // Check for pre-selected employee from navigation state
  useEffect(() => {
    if (location.state?.recognizeEmployee) {
      setSelectedEmployee(location.state.recognizeEmployee);
      // Clear the location state to prevent re-selecting after page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch upcoming birthdays (limit 5)
  useEffect(() => {
    const employeesRef = collection(db, 'employees');
    const qBday = query(employeesRef, orderBy('birthday', 'asc'), limit(5));
    const unsub = onSnapshot(qBday, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUpcomingBirthdays(data);
    });
    return () => unsub();
  }, []);

  // Fetch total kudos count
  useEffect(() => {
    const kudosRef = collection(db, 'kudos');
    const unsub = onSnapshot(kudosRef, (snapshot) => {
      setKudosCount(snapshot.size);
    });
    return () => unsub();
  }, []);

  // Fetch upcoming anniversaries (limit 5)
  useEffect(() => {
    const employeesRef = collection(db, 'employees');
    const qHire = query(employeesRef, orderBy('hireDate', 'asc'), limit(5));
    const unsub = onSnapshot(qHire, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnniversaries(data);
    });
    return () => unsub();
  }, []);

  // Helper to check if a date is today
  const isToday = (date) => {
    if (!date) return false;
    const d = new Date(date.seconds ? date.seconds * 1000 : date);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  };

  // Employees with birthdays today
  const birthdaysToday = upcomingBirthdays.filter(emp => isToday(emp.birthday));
  // Employees with anniversaries today
  const anniversariesToday = anniversaries.filter(emp => isToday(emp.hireDate));

  // Define stats for the stats section
  const stats = [
    { 
      value: kudosCount, 
      label: 'Total Kudos', 
      icon: <ThumbUpIcon sx={{ fontSize: 40 }} />,
      color: 'var(--gradient-primary)' 
    },
    { 
      value: upcomingBirthdays.length, 
      label: 'Birthdays Soon', 
      icon: <CakeIcon sx={{ fontSize: 40 }} />,
      color: 'var(--gradient-secondary)' 
    },
    { 
      value: anniversaries.length, 
      label: 'Anniversaries Soon', 
      icon: <WorkIcon sx={{ fontSize: 40 }} />,
      color: 'var(--gradient-accent)' 
    },
  ];

  return (
    <Box className="section-enhanced" sx={{ py: 4, position: 'relative', minHeight: '100vh' }}>
      {/* Decorative elements */}
      <Box className="decoration-dot dot-1"></Box>
      <Box className="decoration-dot dot-2"></Box>
      <Box className="decoration-dot dot-3"></Box>
      
      <Container maxWidth="lg">
        {/* Admin Portal Section - Only visible to admins */}
        {isAdmin && (
          <MotionBox 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{ mb: 6 }}
          >
            <Box className="section-title-wrapper" sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                className="section-subtitle"
                sx={{ 
                  background: 'linear-gradient(90deg, var(--color-primary-dark) 0%, var(--color-secondary-dark) 100%)',
                  color: 'white'
                }}
              >
                Administration
              </Typography>
              <Typography 
                variant="h4" 
                className="section-title"
                sx={{ 
                  color: 'var(--color-primary-dark)', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <AdminPanelSettingsIcon fontSize="large" />
                Admin Dashboard
              </Typography>
            </Box>
            <AdminPortal />
          </MotionBox>
        )}

        {/* Today's Birthdays & Anniversaries */}
        {(birthdaysToday.length > 0 || anniversariesToday.length > 0) && (
          <MotionBox 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              background: 'linear-gradient(135deg, var(--color-celebration-light) 0%, var(--color-accent-light) 100%)',
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
                opacity: 0.1,
                zIndex: 0,
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" sx={{ mb: 2, color: 'var(--color-celebration-dark)', fontWeight: 700 }}>
                🎉 Celebrate Today!
              </Typography>
              {birthdaysToday.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'var(--color-celebration-dark)', fontWeight: 600 }}>Birthdays:</Typography>
                  {birthdaysToday.map(emp => (
                    <Box key={emp.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography sx={{ color: 'var(--color-text)' }}>{emp.name} ({emp.department})</Typography>
                      <Button 
                        size="small" 
                        variant="contained" 
                        sx={{ 
                          bgcolor: 'var(--color-celebration)', 
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'var(--color-celebration-dark)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }} 
                        onClick={() => setSelectedEmployee(emp)}
                      >
                        Celebrate
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
              {anniversariesToday.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ color: 'var(--color-celebration-dark)', fontWeight: 600 }}>Work Anniversaries:</Typography>
                  {anniversariesToday.map(emp => (
                    <Box key={emp.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography sx={{ color: 'var(--color-text)' }}>{emp.name} ({emp.department})</Typography>
                      <Button 
                        size="small" 
                        variant="contained" 
                        sx={{ 
                          bgcolor: 'var(--color-accent)', 
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'var(--color-accent-dark)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }} 
                        onClick={() => setSelectedEmployee(emp)}
                      >
                        Celebrate
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </MotionBox>
        )}

        {/* Header Section */}
        <MotionBox 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ textAlign: 'center', mb: 6 }}
        >
          <Typography 
            variant="h3" 
            gutterBottom
            sx={{ 
              color: 'var(--color-primary-dark)', 
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: '-0.02em',
              mb: 2
            }}
          >
            Welcome, {user ? user.displayName || user.email : 'Guest'}!
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{
              maxWidth: '700px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.2rem' },
              lineHeight: 1.6
            }}
          >
            Here's what's happening today at SparkBlaze.
          </Typography>
        </MotionBox>

        {/* Give Kudos Section - Move this up if we have a selected employee */}
        {selectedEmployee && (
          <MotionBox 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{ mb: 6 }}
          >
            <Box className="section-title-wrapper" sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                className="section-subtitle"
              >
                Recognition
              </Typography>
              <Typography 
                variant="h4" 
                className="section-title"
                sx={{ color: 'var(--color-primary-dark)', mb: 2 }}
              >
                Recognize {selectedEmployee.name}
              </Typography>
            </Box>
            <MotionPaper 
              whileHover={{ y: -5 }}
              sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--border-radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <Typography variant="body1">
                You've chosen to recognize {selectedEmployee.name} from the {selectedEmployee.department} department.
                Please fill out the form below to send them kudos!
              </Typography>
            </MotionPaper>
            <RecognitionForm 
              preselectedEmployee={selectedEmployee} 
              onSent={() => setSelectedEmployee(null)} 
              ref={recognitionFormRef}
            />
          </MotionBox>
        )}

        {/* Stats Section with Enhanced Design */}
        <Box sx={{ mb: 6 }}>
          <Box className="section-title-wrapper" sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              className="section-subtitle"
            >
              Overview
            </Typography>
            <Typography 
              variant="h4" 
              className="section-title"
              sx={{ color: 'var(--color-primary-dark)', mb: 2 }}
            >
              Quick Stats
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.2, ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ y: -15, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }}
                >
                  <Box
                    className="stats-card card-common"
                    sx={{
                      background: stat.color,
                    }}
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
        </Box>

        {/* Give Kudos Section - when no pre-selected employee */}
        {!selectedEmployee && (
          <MotionBox 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ mb: 6 }}
          >
            <Box className="section-title-wrapper" sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                className="section-subtitle"
              >
                Recognition
              </Typography>
              <Typography 
                variant="h4" 
                className="section-title"
                sx={{ color: 'var(--color-primary-dark)', mb: 2 }}
              >
                Give Kudos
              </Typography>
            </Box>
            <RecognitionForm onSent={() => {}} />
          </MotionBox>
        )}

        <Divider 
          sx={{ 
            my: 6, 
            borderColor: 'rgba(0,0,0,0.06)', 
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)' 
          }} 
        />

        {/* Recent Kudos Feed */}
        <MotionBox 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          sx={{ mb: 6 }}
        >
          <Box className="section-title-wrapper" sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              className="section-subtitle"
            >
              Updates
            </Typography>
            <Typography 
              variant="h4" 
              className="section-title"
              sx={{ color: 'var(--color-primary-dark)', mb: 2 }}
            >
              Recent Kudos
            </Typography>
          </Box>
          <KudosFeed />
        </MotionBox>

        {/* Upcoming Events Section */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Upcoming Birthdays */}
          <Grid item xs={12} md={6}>
            <MotionBox 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Box className="section-title-wrapper" sx={{ mb: 4 }}>
                <Typography 
                  variant="h6" 
                  className="section-subtitle"
                  sx={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}
                >
                  Celebrate
                </Typography>
                <Typography 
                  variant="h4" 
                  className="section-title"
                  sx={{ color: 'var(--color-primary-dark)', mb: 2 }}
                >
                  Upcoming Birthdays
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {upcomingBirthdays.map((emp) => (
                  <Grid item xs={12} sm={6} key={emp.id}>
                    <MotionCard 
                      whileHover={{ y: -8, boxShadow: 'var(--shadow-lg)' }}
                      transition={{ duration: 0.2 }}
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        borderRadius: 'var(--border-radius-lg)',
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ color: 'var(--color-primary-dark)', fontWeight: 700, mb: 1 }}>
                          {emp.name}
                        </Typography>
                        {emp.birthday?.seconds ? (
                          <Typography variant="body2" sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            color: 'var(--color-text)' 
                          }}>
                            <CakeIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                            {new Date(emp.birthday.seconds * 1000).toLocaleDateString(undefined, { 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ mt: 1, color: 'var(--color-text-light)' }}>
                            No birthday info
                          </Typography>
                        )}
                        {emp.department && (
                          <Typography variant="body2" sx={{ mt: 1, color: 'var(--color-text-light)' }}>
                            {emp.department}
                          </Typography>
                        )}
                      </CardContent>
                    </MotionCard>
                  </Grid>
                ))}
                {upcomingBirthdays.length === 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      borderRadius: 'var(--border-radius-lg)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Typography>No upcoming birthdays in the next few weeks.</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </MotionBox>
          </Grid>

          {/* Upcoming Anniversaries */}
          <Grid item xs={12} md={6}>
            <MotionBox 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Box className="section-title-wrapper" sx={{ mb: 4 }}>
                <Typography 
                  variant="h6" 
                  className="section-subtitle"
                  sx={{ background: 'linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-light) 100%)' }}
                >
                  Recognize
                </Typography>
                <Typography 
                  variant="h4" 
                  className="section-title"
                  sx={{ color: 'var(--color-accent-dark)', mb: 2 }}
                >
                  Upcoming Anniversaries
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {anniversaries.map((emp) => (
                  <Grid item xs={12} sm={6} key={emp.id}>
                    <MotionCard 
                      whileHover={{ y: -8, boxShadow: 'var(--shadow-lg)' }}
                      transition={{ duration: 0.2 }}
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        borderRadius: 'var(--border-radius-lg)',
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ color: 'var(--color-accent-dark)', fontWeight: 700, mb: 1 }}>
                          {emp.name}
                        </Typography>
                        {emp.hireDate?.seconds ? (
                          <Typography variant="body2" sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            color: 'var(--color-text)' 
                          }}>
                            <WorkIcon fontSize="small" sx={{ color: 'var(--color-accent)' }} />
                            {new Date(emp.hireDate.seconds * 1000).toLocaleDateString(undefined, { 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ mt: 1, color: 'var(--color-text-light)' }}>
                            No hire date info
                          </Typography>
                        )}
                        {emp.department && (
                          <Typography variant="body2" sx={{ mt: 1, color: 'var(--color-text-light)' }}>
                            {emp.department}
                          </Typography>
                        )}
                      </CardContent>
                    </MotionCard>
                  </Grid>
                ))}
                {anniversaries.length === 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      borderRadius: 'var(--border-radius-lg)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Typography>No upcoming anniversaries in the next few weeks.</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </MotionBox>
          </Grid>
        </Grid>

        {/* Admin utility for testing - would be removed in production */}
        <MotionBox 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          sx={{ mt: 6 }}
        >
          <AdminUtility />
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Dashboard;
