// src/components/RecognitionForm.js
import React, { useState, useContext, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  Timestamp,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';
import { motion } from 'framer-motion'; // Import motion

// MUI imports
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Grid,
  Chip,
  Avatar,
  InputAdornment,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// Icons for badges
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SendIcon from '@mui/icons-material/Send';

const MotionPaper = motion(Paper);
const MotionButton = motion(Button);
const MotionChip = motion(Chip);

/**
 * RecognitionForm - A form allowing a user to send kudos to a colleague,
 * with optional monthly limit check.
 */
const RecognitionForm = ({ preselectedEmployee, onSent }) => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // For listing potential receivers
  const [employees, setEmployees] = useState([]);
  const [receiverId, setReceiverId] = useState('');
  const [message, setMessage] = useState('');
  const [badge, setBadge] = useState('');

  // Form and limit states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // For a monthly limit of 3 kudos
  const KUDOS_MONTHLY_LIMIT = 3;
  const CHARACTER_LIMIT = 300;

  // Badge definitions with icons and colors
  const badges = [
    { value: 'Team Player', icon: <GroupIcon />, color: 'var(--color-primary)' },
    { value: 'Customer Hero', icon: <FavoriteIcon />, color: 'var(--color-success)' },
    { value: 'Innovator', icon: <LightbulbIcon />, color: 'var(--color-accent)' },
    { value: 'Leader', icon: <EmojiEventsIcon />, color: 'var(--color-celebration)' },
    { value: 'Problem Solver', icon: <EmojiObjectsIcon />, color: 'var(--color-primary-dark)' },
    { value: 'Above & Beyond', icon: <StarIcon />, color: 'var(--color-secondary)' },
    { value: 'Positive Attitude', icon: <SentimentVerySatisfiedIcon />, color: 'var(--color-accent-dark)' },
    { value: 'Great Collaboration', icon: <ThumbUpAltIcon />, color: 'var(--color-secondary-dark)' },
  ];

  // 1) Subscribe to employees (for the dropdown)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEmployees(data);
    });
    return () => unsub();
  }, []);

  // Preselect employee if prop changes
  useEffect(() => {
    if (preselectedEmployee && preselectedEmployee.id) {
      setReceiverId(preselectedEmployee.id);
    }
  }, [preselectedEmployee]);

  // 2) Check how many kudos the user has given this month
  // We'll do this client-side for a quick check. 
  // We call it inside handleSubmit as well, to ensure we do it right before sending.
  const checkMonthlyLimit = async () => {
    if (!user) return { withinLimit: false, count: 0 };

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Firestore doesn't do well with date compare unless it's Timestamp
    const qKudos = query(
      collection(db, 'kudos'),
      where('senderId', '==', user.uid),
      where('createdAt', '>=', Timestamp.fromDate(firstOfMonth))
    );

    const snap = await getDocs(qKudos);
    const count = snap.size;
    const withinLimit = count < KUDOS_MONTHLY_LIMIT;
    return { withinLimit, count };
  };

  // 3) Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to send kudos!');
      return;
    }
    if (!receiverId || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    // 3a) Check monthly kudos limit
    try {
      const { withinLimit, count } = await checkMonthlyLimit();
      if (!withinLimit) {
        setLoading(false);
        setError(
          `You have already reached the monthly limit of ${KUDOS_MONTHLY_LIMIT} kudos.`
        );
        return;
      }

      // 3b) Proceed with creating a kudos doc
      await addDoc(collection(db, 'kudos'), {
        senderId: user.uid,
        receiverId,
        message,
        badge,
        createdAt: Timestamp.now(),
        likes: 0,
        comments: [],
      });

      // 3c) Clear form
      setReceiverId('');
      setMessage('');
      setBadge('');
      setSuccess(
        `Kudos sent successfully! You've given ${count + 1}/${KUDOS_MONTHLY_LIMIT} this month.`
      );
      if (onSent) onSent();
    } catch (err) {
      console.error('Error sending kudos:', err);
      setError('Failed to send kudos. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <MotionPaper 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 'var(--border-radius-lg)',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
          zIndex: 1
        }
      }}
      className="animate-fade-in"
    >
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          color: 'var(--color-primary-dark)', 
          fontWeight: 800,
          position: 'relative',
          display: 'inline-block',
          mb: 3
        }}
      >
        Send Recognition
        <Box
          sx={{
            position: 'absolute',
            bottom: -5,
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, var(--color-primary) 0%, transparent 100%)',
          }}
        />
      </Typography>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert severity="error" sx={{ mb: 3, borderRadius: 'var(--border-radius-md)' }}>
            {error}
          </Alert>
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert severity="success" sx={{ mb: 3, borderRadius: 'var(--border-radius-md)' }}>
            {success}
          </Alert>
        </motion.div>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        {/* Receiver dropdown */}
        <FormControl sx={{ mt: 1 }}>
          <InputLabel id="receiver-label" sx={{ color: 'var(--color-primary)' }}>
            Recipient
          </InputLabel>
          <Select
            labelId="receiver-label"
            label="Recipient"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            required
            sx={{ 
              '& .MuiSelect-select': { display: 'flex', alignItems: 'center' },
              '&.MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'var(--color-primary-light)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--color-primary)',
                },
              },
              borderRadius: 'var(--border-radius-md)'
            }}
          >
            <MenuItem value="">
              <em>-- Select an Employee --</em>
            </MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id} sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.8rem', 
                    mr: 1.5,
                    bgcolor: 'var(--color-primary)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {getInitials(emp.name)}
                </Avatar>
                <Box>
                  <Typography variant="body1">{emp.name}</Typography>
                  {emp.department && (
                    <Typography variant="caption" color="text.secondary">
                      {emp.department}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Message */}
        <TextField
          label="Message"
          multiline
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Why do you appreciate your colleague? Be specific about their actions and impact..."
          fullWidth
          variant="outlined"
          inputProps={{ maxLength: CHARACTER_LIMIT }}
          helperText={`${message.length}/${CHARACTER_LIMIT}`}
          FormHelperTextProps={{ sx: { textAlign: 'right' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'var(--color-primary-light)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--color-primary)',
                boxShadow: '0 0 0 4px rgba(var(--color-primary-rgb), 0.1)'
              },
              borderRadius: 'var(--border-radius-md)'
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: 'var(--color-primary)',
            },
          }}
        />

        {/* Badge selection as chips */}
        <Box sx={{ 
          mt: 1,
          p: 3,
          borderRadius: 'var(--border-radius-md)',
          background: 'rgba(255, 255, 255, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600, mb: 2, color: 'var(--color-primary-dark)' }}
          >
            Choose a Badge
          </Typography>
          <Grid container spacing={1.5}>
            {badges.map((badgeOption) => (
              <Grid item key={badgeOption.value}>
                <MotionChip
                  icon={badgeOption.icon}
                  label={badgeOption.value}
                  clickable
                  onClick={() => setBadge(badgeOption.value)}
                  color={badge === badgeOption.value ? "primary" : "default"}
                  variant={badge === badgeOption.value ? "filled" : "outlined"}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  sx={{
                    bgcolor: badge === badgeOption.value ? badgeOption.color : 'transparent',
                    color: badge === badgeOption.value ? 'white' : badgeOption.color,
                    borderColor: badgeOption.color,
                    fontWeight: 600,
                    boxShadow: badge === badgeOption.value ? 'var(--shadow-sm)' : 'none',
                    '&:hover': {
                      bgcolor: badge === badgeOption.value 
                        ? badgeOption.color 
                        : `rgba(${hexToRgb(badgeOption.color)}, 0.1)`,
                    },
                    transition: 'all 0.2s ease-in-out',
                    '& .MuiChip-icon': {
                      color: badge === badgeOption.value ? 'white' : badgeOption.color
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}
          >
            Optional: Select a badge that best represents the recognition you're giving
          </Typography>
        </Box>

        {/* Submit Button */}
        <MotionButton 
          type="submit" 
          variant="contained" 
          disabled={loading}
          size="large"
          whileHover={{ translateY: -4 }}
          whileTap={{ scale: 0.98 }}
          endIcon={<SendIcon />}
          sx={{ 
            mt: 3, 
            py: 1.5,
            bgcolor: 'var(--color-primary)',
            color: 'white',
            fontWeight: 700,
            borderRadius: 'var(--border-radius-lg)',
            '&:hover': {
              bgcolor: 'var(--color-primary-dark)',
            },
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
          ) : (
            'Send Recognition'
          )}
        </MotionButton>
        
        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center"
          sx={{ mt: 1 }}
        >
          You can send up to {KUDOS_MONTHLY_LIMIT} recognitions per month
        </Typography>
      </Box>
    </MotionPaper>
  );
};

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
  if (!hex) return "0, 0, 0";
  
  // Remove # if present
  hex = hex.replace(/^var\(|\)$/g, '');
  
  // If it's a CSS variable, try to get the computed value
  if (hex.startsWith('--')) {
    hex = getComputedStyle(document.documentElement).getPropertyValue(hex).trim() || '#008080';
  }
  
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  
  return `${r}, ${g}, ${b}`;
}

export default RecognitionForm;
