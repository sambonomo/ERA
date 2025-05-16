import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Set a user as an admin by updating their role in Firestore
 * 
 * @param {string} userId - The user ID to promote to admin
 * @returns {Promise<Object>} - A promise that resolves with the updated user data
 */
export const setUserAsAdmin = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Check if user exists
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error(`User with ID ${userId} does not exist`);
  }

  // Update user role to 'admin'
  await updateDoc(userRef, {
    role: 'admin'
  });

  // Get updated user data
  const updatedSnap = await getDoc(userRef);
  
  console.log(`User ${userId} has been set as admin`);
  return {
    id: userId,
    ...updatedSnap.data()
  };
};

/**
 * Create a system settings document if it doesn't exist
 * This is needed for the admin portal to work correctly
 */
export const initializeSystemSettings = async () => {
  const settingsRef = doc(db, 'settings', 'system');
  const settingsSnap = await getDoc(settingsRef);
  
  if (!settingsSnap.exists()) {
    // Use setDoc instead of updateDoc since the document doesn't exist yet
    await setDoc(settingsRef, {
      kudosLimit: 3,
      allowPublicSignup: true,
      requireApproval: false,
      maintenanceMode: false
    });
    console.log('System settings initialized');
  }
}; 