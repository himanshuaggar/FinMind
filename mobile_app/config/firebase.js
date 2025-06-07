import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const app = getApp();

GoogleSignin.configure({
  webClientId: process.env.FIREBASE_OAUTH,
});

export { app, auth, GoogleSignin }; 