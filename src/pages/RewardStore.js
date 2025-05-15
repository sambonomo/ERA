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
  orderBy
} from 'firebase/firestore';

const RewardStore = () => {
  const { user } = useContext(AuthContext);
  
  // Rewards data
  const [rewards, setRewards] = useState([]);
  
  // Track user points (assuming we store them in a "users" or "employees" doc)
  const [userPoints, setUserPoints] = useState(0);

  // Loading / error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Fetch user's current points
    // Example: if you store user data in 'employees' collection keyed by user.uid
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

    // 2. Listen to changes in the 'rewards' collection
    //    sorted by cost (ascending) or name, whichever you prefer
    const rewardsRef = collection(db, 'rewards');
    const q = query(rewardsRef, orderBy('cost', 'asc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const rewardsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
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

  // Handle reward redemption
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
        points: userPoints - reward.cost
      });

      // Optionally, you could track a redemption record (in a 'redemptions' collection, etc.)
      // Or send a confirmation email, etc.

      setUserPoints((prev) => prev - reward.cost);
      setError(''); // clear any error
      alert(`Successfully redeemed ${reward.name}! Check your email for confirmation.`);
    } catch (err) {
      console.error('Error redeeming reward:', err);
      setError('Failed to redeem reward. Please try again later.');
    }
  };

  if (loading) {
    return <div className="reward-store"><p>Loading rewards...</p></div>;
  }

  if (!user) {
    return (
      <div className="reward-store">
        <h2>Reward Store</h2>
        <p>Please <a href="/login">log in</a> to view and redeem rewards.</p>
      </div>
    );
  }

  return (
    <div className="reward-store">
      <header className="reward-store-header">
        <h2>Reward Store</h2>
        <div className="user-points">
          <strong>Your Points:</strong> {userPoints}
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}

      {rewards.length === 0 ? (
        <p>No rewards available at this time.</p>
      ) : (
        <div className="rewards-grid">
          {rewards.map((reward) => (
            <div key={reward.id} className="reward-card">
              <h3>{reward.name}</h3>
              <p>Cost: {reward.cost} pts</p>
              <p className="reward-category">{reward.category}</p>
              {/* If you want a description or image: 
                <p>{reward.description}</p>
                <img src={reward.imageUrl} alt={reward.name} /> 
              */}
              <button
                className="redeem-button"
                onClick={() => handleRedeem(reward)}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardStore;
