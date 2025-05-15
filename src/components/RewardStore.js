// src/components/RewardStore.js
import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebase/config';
import { AuthContext } from '../contexts/AuthContext';
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';

const RewardStore = () => {
  const { user } = useContext(AuthContext);

  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1) Listen to the 'rewards' collection in Firestore
    const rewardsColRef = collection(db, 'rewards');
    const unsubscribe = onSnapshot(
      rewardsColRef,
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
        setError('Failed to load rewards');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 2) If user is logged in, fetch user's current points
    if (!user) return;

    const userDocRef = doc(db, 'employees', user.uid); // or 'users'
    getDoc(userDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserPoints(data.points || 0);
        }
      })
      .catch((err) => {
        console.error('Error fetching user points:', err);
        setError('Failed to load user points');
      });
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
      // 3) Deduct points from user's total
      const userDocRef = doc(db, 'employees', user.uid); // or 'users'
      await updateDoc(userDocRef, {
        points: userPoints - reward.cost,
      });

      // 4) (Optional) record the redemption in a 'redemptions' collection
      await addDoc(collection(db, 'redemptions'), {
        userId: user.uid,
        rewardId: reward.id,
        rewardName: reward.name,
        cost: reward.cost,
        redeemedAt: serverTimestamp(),
      });

      // 5) Update local userPoints so it reflects the new balance
      setUserPoints((prev) => prev - reward.cost);

      // Clear any existing errors and give success feedback
      setError('');
      alert(`Successfully redeemed "${reward.name}". Check your email for confirmation if applicable!`);
    } catch (err) {
      console.error('Error redeeming reward:', err);
      setError('Failed to redeem reward. Please try again later.');
    }
  };

  if (loading) {
    return <div className="reward-store"><p>Loading rewards...</p></div>;
  }

  return (
    <div className="reward-store">
      <h1>Reward Marketplace</h1>

      {/* If user not logged in, or error */}
      {!user && (
        <p>Please <a href="/login">log in</a> to view and redeem rewards.</p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Show user's points if they're logged in */}
      {user && (
        <div>
          <strong>Your Points:</strong> {userPoints}
        </div>
      )}

      <div className="rewards-list">
        {rewards.length === 0 && <p>No rewards available at this time.</p>}
        {rewards.map((reward) => (
          <div key={reward.id} className="reward-item" style={{ marginTop: '1rem' }}>
            <h3>{reward.name}</h3>
            <p>Cost: {reward.cost} points</p>
            {/* Optional category, image, or description */}
            <p>{reward.category}</p>
            {/* <img src={reward.imageUrl} alt={reward.name} /> */}
            
            {user ? (
              <button onClick={() => handleRedeem(reward)}>
                Redeem
              </button>
            ) : (
              <button disabled>Log in to Redeem</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardStore;
