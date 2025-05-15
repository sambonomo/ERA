// src/contexts/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const AuthContext = createContext();

/**
 * AuthProvider - Manages Firebase Auth state and user data from Firestore,
 * including role and companyId. Supports either email/password or Google sign-in.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);         // The raw Firebase user object
  const [userData, setUserData] = useState(null); // Additional user info from Firestore (role, companyId, etc.)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Fetch additional profile data from Firestore, e.g. role, companyId
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData(null);
        }
      } else {
        // If not logged in, clear everything
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1) Sign up with Email/Password
  //    Optionally store extra user info in Firestore (role, companyId, etc.)
  const signUp = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Upsert a doc in Firestore for the new user:
      await setDoc(
        doc(db, 'users', uid),
        {
          email,
          displayName: displayName || '',
          role: 'user',      // default role
          companyId: null,   // can be updated if they create or join a company
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      return userCredential.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // 2) Sign in with Email/Password
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // 3) Sign out
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // 4) Check if current user is an admin (based on Firestore userData.role)
  const isAdmin = () => {
    return userData?.role === 'admin';
  };

  // 5) Google sign-in (optional)
  const googleProvider = new GoogleAuthProvider();
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // "result.user" is the Firebase user object for the Google sign-in.
      const googleUser = result.user;

      // Upsert a doc in Firestore (similar to signUp logic):
      const userDocRef = doc(db, 'users', googleUser.uid);
      // Check if doc already exists:
      const existingSnap = await getDoc(userDocRef);
      if (!existingSnap.exists()) {
        // If brand new, set default fields. Otherwise, you can merge if you like.
        await setDoc(userDocRef, {
          email: googleUser.email,
          displayName: googleUser.displayName || '',
          role: 'user', // default
          companyId: null,
          createdAt: serverTimestamp(),
        });
      }
      // You could also merge if you want: setDoc(userDocRef, {...}, {merge: true});
      return googleUser;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Show a loading indicator while verifying auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,          // raw Firebase user object
        userData,      // Firestore doc with role, companyId, etc.
        signUp,        // email/password sign up
        signIn,        // email/password sign in
        signInWithGoogle,  // Google sign in
        logOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
