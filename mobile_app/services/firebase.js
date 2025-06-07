import { auth, GoogleSignin } from '../config/firebase';
import { Alert } from 'react-native';

export const firebaseAuth = {
  signUp: async (email, password) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      Alert.alert('Error', error.message);
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      Alert.alert('Error', error.message);
      throw error;
    }
  },

  signInWithGoogle: async () => {
    try {
      const { idToken } = await GoogleSignin.signIn();

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      const userCredential = await auth().signInWithCredential(googleCredential);
      return userCredential.user;
    } catch (error) {
      Alert.alert('Error', error.message);
      throw error;
    }
  },

  signOut: async () => {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
    } catch (error) {
      Alert.alert('Error', error.message);
      throw error;
    }
  },

  getCurrentUser: () => {
    return auth().currentUser;
  },

  onAuthStateChanged: (callback) => {
    return auth().onAuthStateChanged(callback);
  }
}; 