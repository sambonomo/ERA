import React, { useState, useContext } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';

const RecognitionForm = () => {
  const { user } = useContext(AuthContext);
  const [receiverId, setReceiverId] = useState('');
  const [message, setMessage] = useState('');
  const [badge, setBadge] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'kudos'), {
        senderId: user.uid,
        receiverId,
        message,
        badge,
        createdAt: Timestamp.now()
      });
      // clear form
      setReceiverId('');
      setMessage('');
      setBadge('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Receiver ID or Email"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <select value={badge} onChange={(e) => setBadge(e.target.value)}>
        <option value="">Select Badge</option>
        <option value="Team Player">Team Player</option>
        <option value="Customer Hero">Customer Hero</option>
        <option value="Innovator">Innovator</option>
      </select>
      <button type="submit">Send Kudos</button>
    </form>
  );
};

export default RecognitionForm;
