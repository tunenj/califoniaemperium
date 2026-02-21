import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBiometric } from '@/context/BiometricContext';
import { useLanguage } from '@/context/LanguageContext';

export const BiometricSettings = () => {
  const { 
    isBiometricAvailable, 
    biometricTypes, 
    biometricEnabled, 
    toggleBiometricSetting,
    loading,
    handleBiometricLogin
  } = useBiometric();
  const { t } = useLanguage();

  if (!isBiometricAvailable) {
    return (
      <View className="p-4 bg-gray-50 rounded-xl">
        <View className="flex-row items-center">
          <Ionicons 
            name="finger-print"
            size={24} 
            color="#9CA3AF" 
          />
          <Text className="ml-3 text-gray-500 flex-1">
            {t('biometric_not_available') || 'Biometric authentication is not available on this device'}
          </Text>
        </View>
      </View>
    );
  }

  // FIXED: Use correct Ionicons names
  const biometricIcon = biometricTypes.includes('Facial Recognition')
    ? 'scan-outline'
    : 'finger-print';

  const biometricName = biometricTypes[0] || 
    (Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Fingerprint');

  return (
    <View className="p-4 bg-white rounded-xl border border-gray-200">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Ionicons name={biometricIcon} size={24} color="#3B82F6" />
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {biometricName}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              {t('use_biometric_to_sign_in') || 'Use your fingerprint or face to sign in'}
            </Text>
          </View>
        </View>
        
        <Switch
          value={biometricEnabled}
          onValueChange={toggleBiometricSetting}
          trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
          thumbColor={biometricEnabled ? '#FFFFFF' : '#F3F4F6'}
          disabled={loading}
        />
      </View>

      {biometricEnabled && (
        <TouchableOpacity
          onPress={() => handleBiometricLogin()}
          disabled={loading}
          className="mt-4 bg-blue-50 py-3 rounded-lg flex-row items-center justify-center"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <>
              <Ionicons name={biometricIcon} size={18} color="#3B82F6" />
              <Text className="ml-2 text-blue-600 font-medium">
                {t('authenticate_now') || `Test ${biometricName} Login`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};