import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';

// MUI imports
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  Grid,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import CakeIcon from '@mui/icons-material/Cake';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

/**
 * EmployeeProfile - Displays an employee's profile information and recent kudos.
 * 
 * @param {Object} props
 * @param {string} props.employeeId - The ID of the employee to display
 * @param {boolean} props.showRecognitionButton - Whether to show the "Recognize" button
 * @param {function} props.onRecognize - Callback when the "Recognize" button is clicked
 */
const EmployeeProfile = ({ employeeId, showRecognitionButton = true, onRecognize }) => {
  const [employee, setEmployee] = useState(null);
  const [receivedKudos, setReceivedKudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kudoSenders, setKudoSenders] = useState({});

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        // 1. Fetch employee data
        const employeeRef = doc(db, 'employees', employeeId);
        const employeeDoc = await getDoc(employeeRef);
        
        if (!employeeDoc.exists()) {
          setError('Employee not found');
          setLoading(false);
          return;
        }
        
        setEmployee({
          id: employeeDoc.id,
          ...employeeDoc.data()
        });
        
        // 2. Fetch recent kudos received (limit 5)
        const kudosRef = collection(db, 'kudos');
        const q = query(
          kudosRef,
          where('receiverId', '==', employeeId),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const kudosSnapshot = await getDocs(q);
        const kudosData = kudosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setReceivedKudos(kudosData);
        
        // 3. Fetch sender info for each kudo
        const senderIds = [...new Set(kudosData.map(k => k.senderId))];
        const sendersData = {};
        
        for (const senderId of senderIds) {
          const senderRef = doc(db, 'employees', senderId);
          const senderDoc = await getDoc(senderRef);
          
          if (senderDoc.exists()) {
            sendersData[senderId] = {
              id: senderDoc.id,
              ...senderDoc.data()
            };
          }
        }
        
        setKudoSenders(sendersData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to load employee data');
        setLoading(false);
      }
    };
    
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!employee) {
    return <Alert severity="info">No employee data available</Alert>;
  }

  return (
    <Box className="animate-fade-in">
      <Paper sx={{ p: 4, borderRadius: 'var(--border-radius-lg)', mb: 4, boxShadow: 'var(--shadow-md)' }}>
        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: 'var(--color-primary)',
                mb: 2,
                fontSize: '2.5rem',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {getInitials(employee.name)}
            </Avatar>
            <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
              {employee.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" align="center" gutterBottom>
              {employee.department || 'No Department'}
            </Typography>
            
            {showRecognitionButton && (
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => onRecognize && onRecognize(employee)}
              >
                Recognize
              </Button>
            )}
          </Grid>
          
          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Employee Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 1, color: 'var(--color-primary)' }} />
                  <Typography variant="body1">
                    <strong>Email:</strong> {employee.email || 'Not available'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WorkIcon sx={{ mr: 1, color: 'var(--color-secondary)' }} />
                  <Typography variant="body1">
                    <strong>Department:</strong> {employee.department || 'Not assigned'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CakeIcon sx={{ mr: 1, color: 'var(--color-celebration)' }} />
                  <Typography variant="body1">
                    <strong>Birthday:</strong> {employee.birthdayMonth && employee.birthdayDay 
                      ? `${employee.birthdayMonth} ${employee.birthdayDay}` 
                      : 'Not set'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: 'var(--color-accent)' }} />
                  <Typography variant="body1">
                    <strong>Joined:</strong> {employee.hireDate ? formatDate(employee.hireDate) : 'Not set'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Points/Recognition Summary */}
            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recognition Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ textAlign: 'center', p: 1, bgcolor: 'var(--color-primary-light)', color: 'white' }}>
                    <Typography variant="h5" fontWeight="bold">
                      {employee.points || 0}
                    </Typography>
                    <Typography variant="body2">Points</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ textAlign: 'center', p: 1, bgcolor: 'var(--color-secondary-light)', color: 'white' }}>
                    <Typography variant="h5" fontWeight="bold">
                      {receivedKudos.length}
                    </Typography>
                    <Typography variant="body2">Recent Kudos</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 1, height: '100%' }}>
                    <Typography variant="body2" align="center">
                      Most recognized for:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {Array.from(new Set(receivedKudos.filter(k => k.badge).map(k => k.badge))).map(badge => (
                        <Chip 
                          key={badge} 
                          label={badge} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'var(--color-accent-light)',
                            fontWeight: 'bold'
                          }} 
                        />
                      ))}
                      {receivedKudos.filter(k => k.badge).length === 0 && (
                        <Typography variant="body2" color="text.secondary">No badges yet</Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Recent Recognition */}
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Recent Recognition
      </Typography>
      
      {receivedKudos.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No recognition history available yet.</Typography>
        </Paper>
      ) : (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 'var(--border-radius-md)' }}>
          {receivedKudos.map((kudo) => {
            const sender = kudoSenders[kudo.senderId];
            
            return (
              <React.Fragment key={kudo.id}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'var(--color-primary)' }}>
                      {sender ? getInitials(sender.name) : <PersonIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          From: {sender ? sender.name : 'Unknown'} 
                          {sender?.department && (
                            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              ({sender.department})
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {kudo.createdAt && formatDate(kudo.createdAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body1" color="text.primary" sx={{ my: 1, fontStyle: 'italic' }}>
                          "{kudo.message}"
                        </Typography>
                        
                        {kudo.badge && (
                          <Chip 
                            icon={<EmojiEventsIcon />} 
                            label={kudo.badge}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default EmployeeProfile; 