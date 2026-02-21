// context/BiometricContext.tsx
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
          type: biometricTypes[0] || 'Biometric'
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
        error: error?.message || 'An error occurred during authentication'
      };
    }
  }, [checkBiometricAvailability, biometricTypes]);

  const saveCredentialsForBiometric = useCallback(async (email: string, password: string) => {
    try {
      await AsyncStorage.setItem('biometric_email', email);
      await AsyncStorage.setItem('biometric_password', password);
      console.log('✅ Credentials saved for biometric login');
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
    }
  }, []);

  const clearBiometricCredentials = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('biometric_email');
      await AsyncStorage.removeItem('biometric_password');
      console.log('✅ Biometric credentials cleared');
    } catch (error) {
      console.error('Error clearing biometric credentials:', error);
    }
  }, []);

  const handleBiometricLogin = useCallback(async (email?: string, password?: string) => {
    if (!isBiometricAvailable) {
      if (Platform.OS !== 'web') {
        Alert.alert('Not Available', 'Biometric authentication is not available on this device');
      }
      return;
    }

    const result = await authenticate('Sign in to your account');
    
    if (result.success) {
      try {
        if (email && password) {
          await saveCredentialsForBiometric(email, password);
          if (Platform.OS !== 'web') {
            Alert.alert('Success', 'Biometric login enabled');
          }
          return;
        }

        const storedEmail = await AsyncStorage.getItem('biometric_email');
        const storedPassword = await AsyncStorage.getItem('biometric_password');
        
        if (storedEmail && storedPassword) {
          console.log('Logging in with:', storedEmail);
          if (Platform.OS !== 'web') {
            Alert.alert('Success', 'Logged in with biometric');
          }
          router.replace('/(customer)/main');
        } else {
          if (Platform.OS !== 'web') {
            Alert.alert('No Saved Credentials', 'Please login with email first to enable biometric login');
          }
        }
      } catch (error) {
        console.error('Error during biometric login:', error);
        if (Platform.OS !== 'web') {
          Alert.alert('Error', 'Failed to complete login');
        }
      }
    } else {
      if (Platform.OS !== 'web') {
        Alert.alert('Authentication Failed', result.error || 'Authentication failed');
      }
    }
  }, [isBiometricAvailable, authenticate, saveCredentialsForBiometric, router]);

  const enableBiometricLogin = useCallback(async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('biometricEnabled', String(enabled));
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error('Error saving biometric preference:', error);
    }
  }, []);

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

  const toggleBiometricSetting = useCallback(async () => {
    if (!biometricEnabled) {
      const result = await authenticate('Authenticate to enable biometric login');
      if (result.success) {
        await enableBiometricLogin(true);
        if (Platform.OS !== 'web') {
          Alert.alert('Success', 'Biometric login enabled');
        }
      } else {
        if (Platform.OS !== 'web') {
          Alert.alert('Error', result.error || 'Failed to authenticate');
        }
      }
    } else {
      await enableBiometricLogin(false);
      await clearBiometricCredentials();
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Biometric login disabled');
      }
    }
  }, [biometricEnabled, authenticate, enableBiometricLogin, clearBiometricCredentials]);

  useEffect(() => {
    checkBiometricAvailability();
    isBiometricEnabled();
  }, []);

  // IMPORTANT: This provider ONLY returns the Context.Provider with children
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