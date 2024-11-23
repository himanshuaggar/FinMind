import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeMockUser } from '../services/mockUser';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

interface UserContextType {
  userId: string | null;
  setUserId: (id: string) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Try to load existing user data
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedProfile = await AsyncStorage.getItem('userProfile');
      
      if (storedUserId && storedProfile) {
        setUserId(storedUserId);
        setUserProfile(JSON.parse(storedProfile));
      } else {
        // Initialize mock user for development
        const mockUser = await initializeMockUser();
        if (mockUser) {
          setUserId(mockUser.id);
          setUserProfile(mockUser);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        userId, 
        setUserId, 
        userProfile, 
        setUserProfile, 
        isLoading 
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
