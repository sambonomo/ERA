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

const KudosFeed = () => {
  const [kudosList, setKudosList] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({}); // { employeeId: { name, department }, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div>Loading kudos...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="kudos-feed">
      <h2>Kudos Feed</h2>

      {kudosList.length === 0 ? (
        <p>No kudos have been posted yet.</p>
      ) : (
        kudosList.map((kudo) => {
          const senderInfo = employeesMap[kudo.senderId];
          const receiverInfo = employeesMap[kudo.receiverId];

          return (
            <div key={kudo.id} className="kudos-item" style={{ marginBottom: '1rem' }}>
              <p>
                <strong>From:</strong>{' '}
                {senderInfo
                  ? `${senderInfo.name} (${senderInfo.department})`
                  : kudo.senderId}
              </p>
              <p>
                <strong>To:</strong>{' '}
                {receiverInfo
                  ? `${receiverInfo.name} (${receiverInfo.department})`
                  : kudo.receiverId}
              </p>
              <p>
                <strong>Message:</strong> {kudo.message}
              </p>
              {kudo.badge && (
                <p>
                  <strong>Badge:</strong> {kudo.badge}
                </p>
              )}
              <p>
                <strong>Likes:</strong> {kudo.likes || 0}
              </p>
              <button onClick={() => handleLike(kudo)}>Like</button>

              {/* If you have a comments array */}
              {kudo.comments && kudo.comments.length > 0 && (
                <div className="kudo-comments" style={{ marginTop: '0.5rem' }}>
                  <strong>Comments:</strong>
                  <ul>
                    {kudo.comments.map((comment, i) => (
                      <li key={i}>
                        <em>{comment.text}</em> – {comment.commenterId} 
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default KudosFeed;
