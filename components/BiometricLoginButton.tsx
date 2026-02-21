import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBiometric } from '@/context/BiometricContext';
import { useLanguage } from '@/context/LanguageContext';

interface BiometricLoginButtonProps {
  onSuccess?: () => void;
  variant?: 'icon' | 'full' | 'text';
  email?: string;
  password?: string;
}

export const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({ 
  onSuccess,
  variant = 'full',
  email,
  password
}) => {
  const { 
    isBiometricAvailable, 
    biometricEnabled, 
    handleBiometricLogin,
    loading 
  } = useBiometric();
  const { t } = useLanguage();

  if (!isBiometricAvailable || !biometricEnabled) {
    return null;
  }

  const biometricIcon = Platform.OS === 'ios' ? 'ios-finger-print' : 'md-finger-print';
  const biometricName = Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint';

  const handlePress = async () => {
    await handleBiometricLogin(email, password);
    onSuccess?.();
  };

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={loading}
        className="p-3 bg-gray-100 rounded-full"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : (
          <Ionicons name={biometricIcon} size={24} color="#3B82F6" />
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'text') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={loading}
        className="flex-row items-center justify-center"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : (
          <>
            <Ionicons name={biometricIcon} size={20} color="#3B82F6" />
            <Text className="ml-2 text-blue-600 text-sm font-medium">
              {t('login_with_biometric') || `Login with ${biometricName}`}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center"
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <Ionicons name={biometricIcon} size={24} color="white" />
          <Text className="text-white font-semibold text-lg ml-3">
            {t('login_with_biometric') || `Login with ${biometricName}`}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};