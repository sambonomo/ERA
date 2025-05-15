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
} from '@mui/material';

/**
 * RecognitionForm - A form allowing a user to send kudos to a colleague,
 * with optional monthly limit check.
 */
const RecognitionForm = () => {
  const { user } = useContext(AuthContext);

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

  // 1) Subscribe to employees (for the dropdown)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEmployees(data);
    });
    return () => unsub();
  }, []);

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
    } catch (err) {
      console.error('Error sending kudos:', err);
      setError('Failed to send kudos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Send Kudos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {/* Receiver dropdown */}
        <FormControl size="small">
          <InputLabel id="receiver-label">Receiver</InputLabel>
          <Select
            labelId="receiver-label"
            label="Receiver"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            required
          >
            <MenuItem value="">
              <em>-- Select an Employee --</em>
            </MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.name} ({emp.department})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Message */}
        <TextField
          label="Message"
          multiline
          rows={3}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your appreciation..."
        />

        {/* Badge selection */}
        <FormControl size="small">
          <InputLabel id="badge-label">Badge</InputLabel>
          <Select
            labelId="badge-label"
            label="Badge"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
          >
            <MenuItem value="">No Badge</MenuItem>
            <MenuItem value="Team Player">Team Player</MenuItem>
            <MenuItem value="Customer Hero">Customer Hero</MenuItem>
            <MenuItem value="Innovator">Innovator</MenuItem>
            <MenuItem value="Leader">Leader</MenuItem>
          </Select>
        </FormControl>

        {/* Submit Button */}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Sending...' : 'Send Kudos'}
        </Button>
      </Box>
    </Paper>
  );
};

export default RecognitionForm;
