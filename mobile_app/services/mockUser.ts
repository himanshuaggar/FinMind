import AsyncStorage from '@react-native-async-storage/async-storage';

export const initializeMockUser = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      // Create mock user for development
      const mockUser = {
        id: 'mock-user-1',
        name: 'John Doe',
        email: 'john@example.com',
        preferences: {
          theme: 'dark',
          notifications: true,
        }
      };

      await AsyncStorage.setItem('userId', mockUser.id);
      await AsyncStorage.setItem('userProfile', JSON.stringify(mockUser));
      
      return mockUser;
    }
    return null;
  } catch (error) {
    console.error('Error initializing mock user:', error);
    return null;
  }
};
