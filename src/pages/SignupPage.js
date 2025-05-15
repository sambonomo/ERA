// src/pages/SignupPage.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// MUI imports
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

import {
  doc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';

/**
 * SignupPage - Allows new users to:
 * 1) Create a new company (becoming admin), or
 * 2) Join an existing company (via domain or invite code).
 * 
 * Also supports optional 'plan' (e.g., ?plan=pro) from query params if relevant.
 */
const SignupPage = () => {
  const { signUp } = useContext(AuthContext);
  const navigate = useNavigate();

  // For optional plan logic (if you still use ?plan=pro, etc.)
  // e.g., const [searchParams] = useSearchParams();
  // const defaultPlan = searchParams.get('plan') || 'free';
  const defaultPlan = 'free'; // or read from query param if you prefer
  const [plan] = useState(defaultPlan);

  // Basic form fields
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');

  // For company creation / join
  const [mode, setMode] = useState('createCompany'); // "createCompany" or "joinCompany"
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1) Create Firebase Auth user
      // signUp is presumably a wrapper around createUserWithEmailAndPassword
      // that also sets displayName or something in Firestore
      const userCredential = await signUp(email, password, displayName);
      const uid = userCredential.uid || userCredential.user.uid;

      if (mode === 'createCompany') {
        // 2a) Creating a new company
        if (!companyName || !companyDomain) {
          throw new Error('Please provide company name and domain.');
        }

        // Create a doc in "companies" collection
        // Mark the user as admin
        const companyRef = await addDoc(collection(db, 'companies'), {
          name: companyName,
          domain: companyDomain.toLowerCase(),
          createdAt: serverTimestamp(),
          adminUids: [uid],
        });

        // Link user doc with role=admin, companyId=the new doc
        await setDoc(doc(db, 'users', uid), {
          email,
          displayName,
          role: 'admin',
          companyId: companyRef.id,
          plan,
          createdAt: serverTimestamp(),
        });

      } else {
        // 2b) Joining an existing company
        // Check if invite code approach or domain approach
        if (inviteCode) {
          // Use inviteCode to find the company
          const q = query(
            collection(db, 'companies'),
            where('inviteCode', '==', inviteCode)
          );
          const snap = await getDocs(q);
          if (snap.empty) {
            throw new Error('Invalid invite code. Please contact your admin.');
          }
          // Suppose we just take the first matching company
          const companyDoc = snap.docs[0];
          const companyId = companyDoc.id;

          // Link user doc
          await setDoc(doc(db, 'users', uid), {
            email,
            displayName,
            role: 'user',
            companyId,
            plan,
            createdAt: serverTimestamp(),
          });
        } else {
          // Use domain matching logic
          const domainPart = email.split('@')[1].toLowerCase();
          // Look up the company with matching domain
          const q = query(
            collection(db, 'companies'),
            where('domain', '==', domainPart)
          );
          const snap = await getDocs(q);
          if (snap.empty) {
            throw new Error(
              `No company found with domain '${domainPart}'. 
               Please contact your admin or use an invite code.`
            );
          }
          const companyDoc = snap.docs[0];
          const companyId = companyDoc.id;

          await setDoc(doc(db, 'users', uid), {
            email,
            displayName,
            role: 'user',
            companyId,
            plan,
            createdAt: serverTimestamp(),
          });
        }
      }

      // Finally, navigate or do whatever post-signup
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Selected Plan: <strong>{plan}</strong>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* RadioGroup for user mode: create or join */}
        <RadioGroup
          row
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          sx={{ mb: 3 }}
        >
          <FormControlLabel
            value="createCompany"
            control={<Radio />}
            label="Create New Company"
          />
          <FormControlLabel
            value="joinCompany"
            control={<Radio />}
            label="Join Existing Company"
          />
        </RadioGroup>

        <Box
          component="form"
          onSubmit={handleSignup}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Common Fields */}
          <TextField
            label="Full Name"
            type="text"
            required
            placeholder="Your Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            required
            placeholder="example@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            required
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {mode === 'createCompany' && (
            <>
              <TextField
                label="Company Name"
                type="text"
                required
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <TextField
                label="Company Domain"
                type="text"
                required
                placeholder="acme.com"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
              />
            </>
          )}

          {mode === 'joinCompany' && (
            <>
              <Typography variant="body2">
                Enter an invite code (if you have one) OR sign up using your
                company email domain.
              </Typography>
              <TextField
                label="Invite Code (Optional)"
                type="text"
                placeholder="ABC123"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              {/* 
                If no inviteCode is provided, we'll attempt domain matching 
                based on the email domain 
              */}
            </>
          )}

          <Button type="submit" variant="contained" color="primary">
            Create Account
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupPage;
