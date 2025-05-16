// src/components/KudosFeed.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { motion } from 'framer-motion'; // Import framer-motion

// MUI imports
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// MUI Icons
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const KudosFeed = () => {
  const [kudosList, setKudosList] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({}); // { employeeId: { name, department }, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 1) Fetch kudos in real-time
  useEffect(() => {
    const kudosRef = collection(db, 'kudos');
    const q = query(kudosRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setKudosList(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching kudos:', err);
        setError('Failed to load kudos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2) (Optional) Build a map of employee info: { [employeeId]: { name, department } }
  //    so we can display employee names in the feed rather than just IDs.
  useEffect(() => {
    // Collect unique senderIds & receiverIds from the kudos list
    const uniqueIds = new Set();
    kudosList.forEach((kudo) => {
      uniqueIds.add(kudo.senderId);
      uniqueIds.add(kudo.receiverId);
    });

    // For each ID, fetch employee info once and store in employeesMap
    // In a real app, you might want a more robust caching strategy.
    [...uniqueIds].forEach(async (empId) => {
      if (!empId) return;
      if (employeesMap[empId]) return; // Already fetched

      const docRef = doc(db, 'employees', empId);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const empData = docSnap.data();
          setEmployeesMap((prev) => ({
            ...prev,
            [empId]: { name: empData.name, department: empData.department },
          }));
        }
      } catch (err) {
        console.error('Error fetching employee data for', empId, err);
      }
    });
  }, [kudosList, employeesMap]);

  // 3) Like a Kudo
  const handleLike = async (kudo) => {
    try {
      const kudoRef = doc(db, 'kudos', kudo.id);
      const newLikes = (kudo.likes || 0) + 1;
      await updateDoc(kudoRef, { likes: newLikes });
    } catch (err) {
      console.error('Error liking kudo:', err);
      setError('Failed to like kudo');
    }
  };

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
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to get relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Convert to seconds
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'just now';
    
    // Convert to minutes
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    // Convert to hours
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    // Convert to days
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    // For older dates, return the formatted date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Badge color mapping
  const getBadgeColor = (badge) => {
    const badgeMap = {
      'Team Player': 'var(--color-primary)',
      'Customer Hero': 'var(--color-success)',
      'Innovator': 'var(--color-accent)',
      'Leader': 'var(--color-celebration)',
      'Problem Solver': 'var(--color-primary-dark)',
      'Above & Beyond': 'var(--color-secondary)',
      'Positive Attitude': 'var(--color-accent-dark)',
      'Great Collaboration': 'var(--color-secondary-dark)',
    };
    return badgeMap[badge] || 'var(--color-primary)';
  };

  // Badge icon mapping
  const getBadgeIcon = (badge) => {
    return <EmojiEventsIcon sx={{ fontSize: 16, mr: 0.5 }} />;
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress sx={{ color: 'var(--color-primary)' }} />
    </Box>
  );
  
  if (error) return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;

  return (
    <Box className="kudos-feed">
      {kudosList.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 'var(--border-radius-lg)',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <Typography variant="h6" sx={{ color: 'var(--color-text-light)', fontWeight: 500 }}>
            No kudos have been posted yet. Be the first to recognize someone!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {kudosList.map((kudo, index) => {
            const senderInfo = employeesMap[kudo.senderId];
            const receiverInfo = employeesMap[kudo.receiverId];

            return (
              <Grid item xs={12} key={kudo.id}>
                <MotionCard 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  sx={{ 
                    overflow: 'hidden',
                    borderRadius: 'var(--border-radius-lg)',
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      boxShadow: 'var(--shadow-lg)',
                      borderColor: 'rgba(255, 255, 255, 0.8)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      height: '6px', 
                      background: kudo.badge 
                        ? getBadgeColor(kudo.badge) 
                        : 'var(--color-primary)'
                    }} 
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <MotionBox
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Avatar 
                            sx={{ 
                              bgcolor: 'var(--color-primary)',
                              color: 'white',
                              width: 50,
                              height: 50,
                              fontSize: '1.25rem',
                              boxShadow: 'var(--shadow-md)'
                            }}
                          >
                            {getInitials(senderInfo?.name)}
                          </Avatar>
                        </MotionBox>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                            {senderInfo ? senderInfo.name : 'Anonymous'} 
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mb: 0.5 }}
                          >
                            {senderInfo?.department}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: 24, 
                              height: 2, 
                              bgcolor: 'var(--color-neutral-300)' 
                            }}/>
                            <Typography variant="body2" color="text.secondary">to</Typography>
                            <Box sx={{ 
                              width: 24, 
                              height: 2, 
                              bgcolor: 'var(--color-neutral-300)' 
                            }}/>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <MotionBox
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Avatar 
                                sx={{ 
                                  bgcolor: 'var(--color-secondary)',
                                  color: 'white',
                                  width: 30,
                                  height: 30,
                                  fontSize: '0.75rem',
                                  boxShadow: 'var(--shadow-sm)'
                                }}
                              >
                                {getInitials(receiverInfo?.name)}
                              </Avatar>
                            </MotionBox>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {receiverInfo ? receiverInfo.name : 'Unknown'} 
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ ml: 1 }}
                              >
                                {receiverInfo?.department && `(${receiverInfo.department})`}
                              </Typography>
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: 1 }}>
                        {kudo.badge && (
                          <Chip 
                            icon={getBadgeIcon(kudo.badge)}
                            label={kudo.badge} 
                            size="medium"
                            sx={{ 
                              bgcolor: getBadgeColor(kudo.badge),
                              color: 'white',
                              fontWeight: 'bold',
                              boxShadow: 'var(--shadow-sm)',
                              '& .MuiChip-icon': {
                                color: 'white'
                              }
                            }}
                          />
                        )}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          color: 'var(--color-text-light)',
                          fontSize: '0.75rem',
                          gap: 0.5
                        }}>
                          <AccessTimeIcon fontSize="inherit" />
                          {getRelativeTime(kudo.createdAt)}
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        p: 3,
                        my: 2,
                        borderRadius: 'var(--border-radius-md)',
                        background: 'rgba(255,255,255,0.4)',
                        border: '1px solid rgba(255,255,255,0.6)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          fontSize: '4rem',
                          fontFamily: 'Georgia, serif',
                          opacity: 0.1,
                          color: 'var(--color-text)',
                          lineHeight: 0.8,
                        }}
                      >
                        "
                      </Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontStyle: 'italic', 
                          position: 'relative',
                          zIndex: 1,
                          color: 'var(--color-text)',
                          fontSize: '1.1rem',
                          lineHeight: 1.6
                        }}
                      >
                        {kudo.message}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, alignItems: 'center' }}>
                      <Tooltip title="Like this kudos">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleLike(kudo)}
                          size="medium"
                          sx={{ 
                            color: 'var(--color-celebration)',
                            '&:hover': {
                              bgcolor: 'rgba(var(--color-celebration-rgb), 0.1)'
                            }
                          }}
                        >
                          <FavoriteIcon />
                        </IconButton>
                      </Tooltip>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mr: 2,
                          fontWeight: 'bold',
                          color: 'var(--color-celebration)'
                        }}
                      >
                        {kudo.likes || 0}
                      </Typography>
                    </Box>

                    {/* Comments section */}
                    {kudo.comments && kudo.comments.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                          Comments:
                        </Typography>
                        {kudo.comments.map((comment, i) => {
                          const commenterInfo = employeesMap[comment.commenterId];
                          return (
                            <Box 
                              key={i} 
                              sx={{ 
                                display: 'flex', 
                                gap: 1.5, 
                                mb: 2,
                                bgcolor: 'rgba(255,255,255,0.3)',
                                p: 1.5,
                                borderRadius: 'var(--border-radius-md)'
                              }}
                            >
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  fontSize: '0.75rem',
                                  bgcolor: 'var(--color-secondary)' 
                                }}
                              >
                                {getInitials(commenterInfo?.name)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {commenterInfo ? commenterInfo.name : comment.commenterId}
                                </Typography>
                                <Typography variant="body2">{comment.text}</Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </CardContent>
                </MotionCard>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default KudosFeed;
