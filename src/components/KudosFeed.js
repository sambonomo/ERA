import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

const KudosFeed = () => {
  const [kudosList, setKudosList] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'kudos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const kudosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setKudosList(kudosData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Kudos Feed</h2>
      {kudosList.map((kudos) => (
        <div key={kudos.id} className="kudos-item">
          <p><strong>From:</strong> {kudos.senderId}</p>
          <p><strong>To:</strong> {kudos.receiverId}</p>
          <p><strong>Message:</strong> {kudos.message}</p>
          <p><strong>Badge:</strong> {kudos.badge}</p>
        </div>
      ))}
    </div>
  );
};

export default KudosFeed;
