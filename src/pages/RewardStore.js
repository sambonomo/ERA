// src/pages/RewardStore.js
import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebase/config';
import { AuthContext } from '../contexts/AuthContext';
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';

// MUI imports
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Alert,
} from '@mui/material';

/**
 * RewardStore - Displays a list of rewards and allows users to redeem them if they have enough points.
 * Fetches user points from Firestore, as well as the 'rewards' collection. 
 */
const RewardStore = () => {
  const { user } = useContext(AuthContext);

  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Fetch user's current points
    const getUserPoints = async () => {
      try {
        const userRef = doc(db, 'employees', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserPoints(data.points || 0);
        }
      } catch (err) {
        console.error('Error fetching user points:', err);
        setError('Failed to load user points.');
      }
    };

    getUserPoints();

    // 2. Listen to changes in the 'rewards' collection, sorted by cost ascending
    const rewardsRef = collection(db, 'rewards');
    const q = query(rewardsRef, orderBy('cost', 'asc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const rewardsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRewards(rewardsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching rewards:', err);
        setError('Failed to load rewards.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const handleRedeem = async (reward) => {
    if (!user) {
      setError('You must be logged in to redeem rewards.');
      return;
    }
    if (userPoints < reward.cost) {
      setError('You do not have enough points for this reward.');
      return;
    }

    try {
      // Subtract cost from user's points
      const userRef = doc(db, 'employees', user.uid);
      await updateDoc(userRef, {
        points: userPoints - reward.cost,
      });

      // Optionally track redemption in 'redemptions' collection
      setUserPoints((prev) => prev - reward.cost);
      setError(''); // clear any existing error
      alert(
        `Successfully redeemed "${reward.name}"! Check your email for confirmation.`
      );
    } catch (err) {
      console.error('Error redeeming reward:', err);
      setError('Failed to redeem reward. Please try again later.');
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography>Loading rewards...</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>
          Reward Store
        </Typography>
        <Typography>
          Please <a href="/login">log in</a> to view and redeem rewards.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4">Reward Store</Typography>
        <Box>
          <Typography variant="body1">
            <strong>Your Points:</strong> {userPoints}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {rewards.length === 0 ? (
        <Typography>No rewards available at this time.</Typography>
      ) : (
        <Grid container spacing={3}>
          {rewards.map((reward) => (
            <Grid item xs={12} sm={6} md={4} key={reward.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{reward.name}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Cost: {reward.cost} pts
                </Typography>
                {reward.category && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {reward.category}
                  </Typography>
                )}
                {/* If you want a description or image:
                    <Typography variant="body2">{reward.description}</Typography>
                    <img src={reward.imageUrl} alt={reward.name} />
                */}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRedeem(reward)}
                  >
                    Redeem
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default RewardStore;
