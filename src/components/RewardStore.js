// RewardStore.js (page version)
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

const RewardStore = () => {
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'rewards'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRewards(data);
    });
    return () => unsubscribe();
  }, []);

  // Handle "Redeem" logic here:
  // 1. Check if user has enough points
  // 2. Deduct points
  // 3. Mark reward as redeemed

  return (
    <div>
      <h1>Reward Marketplace</h1>
      {rewards.map((reward) => (
        <div key={reward.id}>
          <h2>{reward.name}</h2>
          <p>Cost: {reward.cost} points</p>
          <button>Redeem</button>
        </div>
      ))}
    </div>
  );
};

export default RewardStore;
