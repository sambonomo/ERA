// src/contexts/RecognitionContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { AuthContext } from './AuthContext'; // if you need user info

// Create the context
export const RecognitionContext = createContext();

// Create the provider component
export const RecognitionProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  const [kudos, setKudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to kudos collection in Firestore
  useEffect(() => {
    // Optionally, order by createdAt descending
    const kudosRef = collection(db, 'kudos');
    const q = query(kudosRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const kudosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setKudos(kudosData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching kudos:', err);
        setError('Failed to load kudos');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Create a new kudo
  const createKudo = async (receiverId, message, badge) => {
    if (!user) {
      setError('You must be logged in to send kudos.');
      return null;
    }
    try {
      const kudosRef = collection(db, 'kudos');
      const docRef = await addDoc(kudosRef, {
        senderId: user.uid,
        receiverId,
        message,
        badge: badge || '',   // optional
        createdAt: serverTimestamp(),
        likes: 0,
        comments: [],
      });
      return docRef.id;
    } catch (err) {
      console.error('Error creating kudo:', err);
      setError('Failed to create kudo.');
      return null;
    }
  };

  // Like a kudo (increment likes)
  const likeKudo = async (kudoId, currentLikes = 0) => {
    const kudoRef = doc(db, 'kudos', kudoId);
    try {
      await updateDoc(kudoRef, { likes: currentLikes + 1 });
    } catch (err) {
      console.error('Error liking kudo:', err);
      setError('Failed to like kudo.');
    }
  };

  // Add a comment to a kudo
  const addComment = async (kudoId, commentText) => {
    if (!user) {
      setError('You must be logged in to comment.');
      return;
    }
    const kudoRef = doc(db, 'kudos', kudoId);
    try {
      // We fetch the current doc, add comment to array
      // Or we can do an "arrayUnion" if you prefer
      // e.g. updateDoc(kudoRef, { comments: arrayUnion(newComment) })
      const newComment = {
        commenterId: user.uid,
        text: commentText,
        timestamp: serverTimestamp(),
      };
      // If you're on Firestore v9+, you can do:
      const kudoToUpdate = kudos.find((k) => k.id === kudoId);
      if (!kudoToUpdate) return;

      const updatedComments = [...kudoToUpdate.comments, newComment];
      await updateDoc(kudoRef, { comments: updatedComments });
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment.');
    }
  };

  // Delete a kudo
  const deleteKudo = async (kudoId) => {
    if (!user) {
      setError('You must be logged in to delete kudos.');
      return;
    }
    try {
      const kudoRef = doc(db, 'kudos', kudoId);
      await deleteDoc(kudoRef);
    } catch (err) {
      console.error('Error deleting kudo:', err);
      setError('Failed to delete kudo.');
    }
  };

  return (
    <RecognitionContext.Provider
      value={{
        kudos,
        loading,
        error,
        createKudo,
        likeKudo,
        addComment,
        deleteKudo,
      }}
    >
      {children}
    </RecognitionContext.Provider>
  );
};
