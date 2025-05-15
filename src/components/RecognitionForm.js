// src/components/RecognitionForm.js
import React, { useState, useContext, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';

const RecognitionForm = () => {
  const { user } = useContext(AuthContext);

  const [employees, setEmployees] = useState([]);   // For picking the receiver from a list
  const [receiverId, setReceiverId] = useState('');
  const [message, setMessage] = useState('');
  const [badge, setBadge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1) Fetch employee data for the receiver dropdown/autocomplete
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const empData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(empData);
    });
    return () => unsub();
  }, []);

  // 2) Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to send kudos!');
      return;
    }
    if (!receiverId || !message) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await addDoc(collection(db, 'kudos'), {
        senderId: user.uid,
        receiverId,
        message,
        badge,
        createdAt: Timestamp.now(),
        likes: 0,
        comments: [],
      });

      // Clear form
      setReceiverId('');
      setMessage('');
      setBadge('');
      setSuccess('Kudos sent successfully!');
    } catch (err) {
      console.error('Error sending kudos:', err);
      setError('Failed to send kudos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recognition-form">
      <h2>Send Kudos</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        {/* Receiver Selection */}
        <label htmlFor="receiver">Receiver:</label>
        <select
          id="receiver"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          required
        >
          <option value="">-- Select an Employee --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.department})
            </option>
          ))}
        </select>

        {/* OR, if you prefer a text input for receiver's email:
          <input
            type="text"
            placeholder="Receiver Email"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            required
          />
        */}

        {/* Message */}
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          placeholder="Share your appreciation..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          required
        />

        {/* Badge Selection */}
        <label htmlFor="badge">Badge:</label>
        <select
          id="badge"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
        >
          <option value="">No Badge</option>
          <option value="Team Player">Team Player</option>
          <option value="Customer Hero">Customer Hero</option>
          <option value="Innovator">Innovator</option>
          <option value="Leader">Leader</option>
        </select>

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Kudos'}
        </button>
      </form>
    </div>
  );
};

export default RecognitionForm;
