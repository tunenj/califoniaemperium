import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

// Register for web browser
WebBrowser.maybeCompleteAuthSession();

const googleClientId = '984067143067-1qv8bsgpbmhqiid8oe65umo7dooanks9.apps.googleusercontent.com';
const redirectUri = makeRedirectUri({
  scheme: 'com.tunenj.califoniaemperium',
});

// Pure JS random state — no expo-crypto needed
const generateState = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const signInWithGoogle = async () => {
  try {
    const state = generateState();

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=email%20profile&` +
      `state=${state}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success') {
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