// src/pages/SignupPage.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const { signUp } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const defaultPlan = searchParams.get('plan') || 'free';
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [plan] = useState(defaultPlan);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCred = await signUp(email, password, displayName);
      // Possibly store plan in Firestore or handle subscription flow if plan = 'pro'
      // For now, just redirect to Dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to sign up. Maybe email is already in use.');
    }
  };

  return (
    <div className="signup-page container">
      <h2>Sign Up</h2>
      <p>Selected Plan: <strong>{plan}</strong></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label htmlFor="signup-name">Name:</label>
          <input
            type="text"
            id="signup-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Your Name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signup-email">Email:</label>
          <input
            type="email"
            id="signup-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="example@company.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signup-password">Password:</label>
          <input
            type="password"
            id="signup-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a password"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Create Account
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
