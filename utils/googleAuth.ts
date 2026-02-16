import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { makeRedirectUri } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

// Register for web browser
WebBrowser.maybeCompleteAuthSession();

// Your Google OAuth 2.0 configuration
const googleClientId = '984067143067-1qv8bsgpbmhqiid8oe65umo7dooanks9.apps.googleusercontent.com'; // Get this from Google Cloud Console
const redirectUri = makeRedirectUri({
  scheme: 'com.tunenj.califoniaemperium', // Replace with your app scheme
});

export const signInWithGoogle = async () => {
  try {
    // Generate a random state for security
    const state = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString()
    );

    // Construct the Google OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=email%20profile&` +
      `state=${state}`;

    // Open browser for authentication
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success') {
      // Extract the access token from the URL
      const params = new URLSearchParams(result.url.split('#')[1]);
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        return { success: true, accessToken };
      }
    }
    
    return { success: false, error: 'Authentication failed' };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    return { success: false, error };
  }
};