import React, { createContext, useState, useContext, useEffect } from 'react';
import { firebaseAuth } from '../services/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const signUp = async (email, password) => {
    try {
      const user = await firebaseAuth.signUp(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const user = await firebaseAuth.signIn(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const user = await firebaseAuth.signInWithGoogle();
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 