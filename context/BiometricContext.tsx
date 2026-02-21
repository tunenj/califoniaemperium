import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface BiometricAuthResult {
  success: boolean;
  error?: string;
  type?: string;
}

interface BiometricContextType {
  isBiometricAvailable: boolean;
  biometricTypes: string[];
  isAuthenticated: boolean;
  loading: boolean;
  biometricEnabled: boolean;
  authenticate: (promptMessage?: string) => Promise<BiometricAuthResult>;
  enableBiometricLogin: (enabled: boolean) => Promise<void>;
  isBiometricEnabled: () => Promise<boolean>;
  checkBiometricAvailability: () => Promise<boolean>;
  handleBiometricLogin: (email?: string, password?: string) => Promise<void>;
  toggleBiometricSetting: () => Promise<void>;
  saveCredentialsForBiometric: (email: string, password: string) => Promise<void>;
  clearBiometricCredentials: () => Promise<void>;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

export const useBiometric = () => {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometric must be used within BiometricProvider');
  }
  return context;
};

interface BiometricProviderProps {
  children: ReactNode;
}

export const BiometricProvider: React.FC<BiometricProviderProps> = ({ children }) => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  const router = useRouter();

  // Check if biometric hardware is available
  const checkBiometricAvailability = useCallback(async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        setIsBiometricAvailable(false);
        return false;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        setIsBiometricAvailable(false);
        return false;
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const typeNames = types.map(type => {
        switch (type) {
          case 1:
            return 'Fingerprint';
          case 2:
            return 'Facial Recognition';
          default:
            return 'Biometric';
        }
      });
      
      setBiometricTypes(typeNames);
      setIsBiometricAvailable(true);
      return true;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsBiometricAvailable(false);
      return false;
    }
  }, []);

  // Authenticate with biometrics
  const authenticate = useCallback(async (
    promptMessage: string = 'Authenticate to continue'
  ): Promise<BiometricAuthResult> => {
    setLoading(true);
    
    try {
      const isAvailable = await checkBiometricAvailability();
      
      if (!isAvailable) {
        setLoading(false);
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setIsAuthenticated(true);
        setLoading(false);
        return {
          success: true,
          type: biometricTypes[0]
        };
      } else {
        setLoading(false);
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }
    } catch (error: any) {
      setLoading(false);
      return {
        success: false,
        error: error.message || 'An error occurred during authentication'
      };
    }
  }, [checkBiometricAvailability, biometricTypes]);

  // Save credentials securely for biometric login
  const saveCredentialsForBiometric = useCallback(async (email: string, password: string) => {
    try {
      // Store credentials securely (consider using expo-secure-store for better security)
      await AsyncStorage.setItem('biometric_email', email);
      await AsyncStorage.setItem('biometric_password', password);
      console.log('✅ Credentials saved for biometric login');
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
    }
  }, []);

  // Clear biometric credentials
  const clearBiometricCredentials = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('biometric_email');
      await AsyncStorage.removeItem('biometric_password');
      console.log('✅ Biometric credentials cleared');
    } catch (error) {
      console.error('Error clearing biometric credentials:', error);
    }
  }, []);

  // Handle biometric login flow
  const handleBiometricLogin = useCallback(async (email?: string, password?: string) => {
    if (!isBiometricAvailable) {
      Alert.alert(
        'Not Available',
        'Biometric authentication is not available on this device'
      );
      return;
    }

    const result = await authenticate('Sign in to your account');
    
    if (result.success) {
      try {
        // If credentials are provided directly (after login), use them
        if (email && password) {
          await saveCredentialsForBiometric(email, password);
          Alert.alert('Success', 'Biometric login enabled');
          return;
        }

        // Otherwise, get stored credentials
        const storedEmail = await AsyncStorage.getItem('biometric_email');
        const storedPassword = await AsyncStorage.getItem('biometric_password');
        
        if (storedEmail && storedPassword) {
          // Here you would call your login API with stored credentials
          console.log('Logging in with:', storedEmail);
          
          // For now, simulate successful login
          Alert.alert('Success', 'Logged in with biometric');
          
          // Navigate to main app
          router.replace('/(customer)/main');
        } else {
          Alert.alert(
            'No Saved Credentials',
            'Please login with email first to enable biometric login'
          );
        }
      } catch (error) {
        console.error('Error during biometric login:', error);
        Alert.alert('Error', 'Failed to complete login');
      }
    } else {
      Alert.alert('Authentication Failed', result.error);
    }
  }, [isBiometricAvailable, authenticate, saveCredentialsForBiometric, router]);

  // Save biometric preference
  const enableBiometricLogin = useCallback(async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('biometricEnabled', String(enabled));
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error('Error saving biometric preference:', error);
    }
  }, []);

  // Check if biometric login is enabled
  const isBiometricEnabled = useCallback(async () => {
    try {
      const enabled = await AsyncStorage.getItem('biometricEnabled');
      const isEnabled = enabled === 'true';
      setBiometricEnabled(isEnabled);
      return isEnabled;
    } catch (error) {
      console.error('Error checking biometric preference:', error);
      return false;
    }
  }, []);

  // Toggle biometric setting (with authentication)
  const toggleBiometricSetting = useCallback(async () => {
    if (!biometricEnabled) {
      // If enabling, authenticate first
      const result = await authenticate('Authenticate to enable biometric login');
      if (result.success) {
        await enableBiometricLogin(true);
        Alert.alert('Success', 'Biometric login enabled');
      } else {
        Alert.alert('Error', result.error || 'Failed to authenticate');
      }
    } else {
      // If disabling, just turn off
      await enableBiometricLogin(false);
      await clearBiometricCredentials();
      Alert.alert('Success', 'Biometric login disabled');
    }
  }, [biometricEnabled, authenticate, enableBiometricLogin, clearBiometricCredentials]);

  // Check biometric availability and user preference on mount
  useEffect(() => {
    checkBiometricAvailability();
    isBiometricEnabled();
  }, []);

  return (
    <BiometricContext.Provider
      value={{
        isBiometricAvailable,
        biometricTypes,
        isAuthenticated,
        loading,
        biometricEnabled,
        authenticate,
        enableBiometricLogin,
        isBiometricEnabled,
        checkBiometricAvailability,
        handleBiometricLogin,
        toggleBiometricSetting,
        saveCredentialsForBiometric,
        clearBiometricCredentials,
      }}
    >
      {children}
    </BiometricContext.Provider>
  );
};