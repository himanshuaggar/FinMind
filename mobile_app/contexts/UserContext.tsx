import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextType {
  userId: string | null;
  setUserId: (id: string) => void;
  userProfile: any;
  setUserProfile: (profile: any) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedProfile = await AsyncStorage.getItem('userProfile');
      
      if (storedUserId) setUserId(storedUserId);
      if (storedProfile) setUserProfile(JSON.parse(storedProfile));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, userProfile, setUserProfile, isLoading }}>
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
