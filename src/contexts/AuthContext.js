// src/contexts/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  // If you want Google sign-in:
  // signInWithPopup,
  // GoogleAuthProvider,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Firebase user object
  const [userData, setUserData] = useState(null); // Additional user info from Firestore
  const [loading, setLoading] = useState(true);

  // 1) Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Optionally fetch extra profile/role from Firestore:
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2) Sign up with Email/Password
  const signUp = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Optionally create a doc in Firestore for additional user info
      await setDoc(doc(db, 'users', uid), {
        email,
        displayName: displayName || '',
        role: 'user',  // default role
        createdAt: new Date(),
      });

      return userCredential.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error; // so the caller can handle it
    }
  };

  // 3) Sign in with Email/Password
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // 4) Sign out
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // 5) Check if user has a specific role (example usage: Admin)
  const isAdmin = () => {
    return userData?.role === 'admin';
  };

  // 6) Google Sign-In (optional)
  // const googleProvider = new GoogleAuthProvider();
  // const signInWithGoogle = async () => {
  //   try {
  //     const result = await signInWithPopup(auth, googleProvider);
  //     // Additional user info can be written to Firestore, same as above
  //   } catch (error) {
  //     console.error('Google sign-in error:', error);
  //     throw error;
  //   }
  // };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,         // raw Firebase user object
        userData,     // extra data from Firestore (role, displayName, etc.)
        signUp,
        signIn,
        logOut,
        isAdmin,
        // signInWithGoogle, // if you enable Google Sign-In
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
