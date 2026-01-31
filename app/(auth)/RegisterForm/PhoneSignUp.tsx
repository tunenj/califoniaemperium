// app/(auth)/BusinessRegisterForm.tsx
import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone } from 'lucide-react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  BackHandler,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { countries } from '@/data/countries';
import {
  validatePhoneNumber,
  formatPhoneNumber,
} from '@/utils/phoneValidation';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

type UserRole = 'business' | 'customer';

interface Country {
  value: string;
  label: string;
  code: string;
}

const BusinessRegisterForm: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const isMounted = useRef(true);

  const defaultCountry =
    countries.find(c => c.value === 'canada') ?? countries[0];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const [selectedCountry, setSelectedCountry] =
    useState<Country>(defaultCountry);

  // Remove unused selectedMethod or use it if needed elsewhere
  // const [selectedMethod, setSelectedMethod] = useState<'whatsapp' | 'sms'>('sms');

  const [role, setRole] = useState<UserRole>('business');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /* -------------------- HELPERS -------------------- */
  const getCleanCountryCode = useCallback(() => {
    return selectedCountry.code.replace(/\D/g, '');
  }, [selectedCountry.code]);

  /* -------------------- PHONE HANDLING -------------------- */
  const handlePhoneNumberChange = useCallback(
    (text: string) => {
      const digitsOnly = text.replace(/\D/g, '');
      const cleanCode = getCleanCountryCode();

      setPhoneNumber(digitsOnly);
      setFormattedPhoneNumber(
        formatPhoneNumber(digitsOnly, cleanCode)
      );

      if (phoneError) setPhoneError('');
    },
    [getCleanCountryCode, phoneError]
  );

  useEffect(() => {
    if (!phoneNumber) return;

    const cleanCode = getCleanCountryCode();
    const validation = validatePhoneNumber(phoneNumber, cleanCode);

    if (!validation.isValid && validation.error) {
      setPhoneError(validation.error);
    } else {
      setPhoneError('');
      setFormattedPhoneNumber(
        formatPhoneNumber(phoneNumber, cleanCode)
      );
    }
  }, [phoneNumber, getCleanCountryCode]);

  /* -------------------- FORM VALIDATION -------------------- */
  const validateForm = () => {
    const errors: string[] = [];
    const cleanCode = getCleanCountryCode();

    if (!firstName.trim()) errors.push(t('first_name_required'));
    if (!lastName.trim()) errors.push(t('last_name_required'));

    if (!phoneNumber.trim()) {
      errors.push(t('phone_number_required'));
    } else {
      const validation = validatePhoneNumber(phoneNumber, cleanCode);
      if (!validation.isValid) {
        errors.push(validation.error || t('invalid_phone_number'));
      }
    }

    if (errors.length) {
      Alert.alert(t('form_error'), errors.join('\n'));
      return false;
    }

    return true;
  };

  /* -------------------- API: SEND PHONE VERIFICATION -------------------- */
  const sendPhoneVerification = async (method: 'sms' | 'whatsapp'): Promise<boolean> => {
    try {
      const cleanCode = getCleanCountryCode();
      const fullPhoneNumber = `${cleanCode}${phoneNumber}`;
      
      console.log('Sending phone verification:', {
        phone: fullPhoneNumber,
        method,
        firstName,
        lastName,
        role
      });

      const response = await api.post(endpoints.phoneRegistration, {
        phone_number: fullPhoneNumber,
        verification_method: method,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role: role,
      });

      console.log('Phone verification response:', response.data);

      // Check response based on your API structure
      if (response.data && (response.data.success || response.data.message || response.data.status === 'success')) {
        
        // Log OTP for development
        if (__DEV__) {
          const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
          console.log('========== DEBUG OTP ==========');
          console.log('Phone:', fullPhoneNumber);
          console.log('Method:', method);
          console.log('OTP Code:', mockOTP);
          console.log('⏱Valid for: 10 minutes');
          console.log('==================================');
          
          // Store for development auto-fill - Type-safe access
          if (typeof global !== 'undefined') {
            (global as any).__lastPhoneOTP = mockOTP;
            (global as any).__lastPhone = fullPhoneNumber;
          }
        }

        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      
      let errorMessage = t('verification_failed');
      
      if (error.response?.data) {
        console.log('Error response data:', error.response.data);
        
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data.join(', ');
        }
      } else if (error.response?.status === 400) {
        errorMessage = t('invalid_phone_number');
      } else if (error.response?.status === 409) {
        errorMessage = t('phone_already_registered');
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (isMounted.current) {
        Alert.alert(t('verification_failed'), errorMessage);
      }
      
      return false;
    }
  };

  const handleProceedToVerification = async (method: 'sms' | 'whatsapp') => {
    if (!validateForm()) return;

    // Set loading state based on method
    if (method === 'sms') {
      setIsSendingSMS(true);
    } else {
      setIsSendingWhatsApp(true);
    }
    setIsLoading(true);

    try {
      const cleanCode = getCleanCountryCode();
      const fullPhoneNumber = `${cleanCode}${phoneNumber}`;

      // Send verification to phone
      const verificationSent = await sendPhoneVerification(method);

      if (!isMounted.current) return;

      if (verificationSent) {
        // Navigate to OTP verification
        router.push({
          pathname: '/OtpVerification',
          params: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: fullPhoneNumber,
            formattedPhoneNumber: `+${cleanCode} ${formattedPhoneNumber}`,
            method: method,
            role,
            source: 'phone',
          },
        });
      }
      // If failed, error is already handled in sendPhoneVerification
      
    } catch (error) {
      console.error('Verification process error:', error);
      
      if (!isMounted.current) return;

      Alert.alert(
        t('verification_failed'),
        t('please_try_again')
      );
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsSendingSMS(false);
        setIsSendingWhatsApp(false);
      }
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  /* -------------------- ANDROID BACK BUTTON -------------------- */
  useEffect(() => {
    const backAction = () => {
      if (showCountryPicker) {
        setShowCountryPicker(false);
        return true;
      }
      return false;
    };

    const handler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => handler.remove();
  }, [showCountryPicker]);

  /* -------------------- UI -------------------- */
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-1/3 min-h-[250px] items-center justify-center">
        <Image
          source={images.onboarding}
          className="w-16 h-16"
          resizeMode="contain"
        />
      </View>

      {/* Form */}
      <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-8">
        <TouchableOpacity
          className="absolute top-4 left-4 z-10"
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <ArrowLeft size={28} color="#C62828" />
        </TouchableOpacity>

        {/* Title */}
        <View className="mb-8 items-center">
          <Text className="text-lg font-semibold mb-1">
            {role === 'business'
              ? `${t('register_as')} ${t('business')}`
              : `${t('register_as')} ${t('customer')}`}
          </Text>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() =>
              setRole(role === 'business' ? 'customer' : 'business')
            }
            disabled={isLoading}
          >
            <Image source={images.switchIcon} className="w-6 h-6 mr-2" />
            <Text className="text-gray-400 underline">
              {t('switch_to')} {role === 'business' ? t('customer') : t('business')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Names */}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-gray-600 text-sm mb-1">{t('first_name')}</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 border-b border-secondary text-gray-900"
              placeholder={t('enter_first_name')}
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
              editable={!isLoading}
            />
          </View>

          <View className="flex-1 ml-2">
            <Text className="text-gray-600 text-sm mb-1">{t('last_name')}</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 border-b border-secondary"
              placeholder={t('enter_last_name')}
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Phone */}
        <Text className="text-gray-600 text-sm mb-1">{t('phone_number')}</Text>
        <View
          className={`flex-row bg-gray-100 rounded-lg border-b ${phoneError ? 'border-red-500' : 'border-secondary'
            }`}
        >
          <TouchableOpacity
            className="px-3 py-4 border-r border-gray-200"
            style={{ width: 100 }}
            onPress={() => setShowCountryPicker(true)}
            disabled={isLoading}
          >
            <Text className="text-base font-medium">
              {selectedCountry.code}
            </Text>
          </TouchableOpacity>

          <TextInput
            className="flex-1 px-3 py-4"
            placeholder={t('enter_phone_number')}
            placeholderTextColor="#9CA3AF"
            value={formattedPhoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>

        {phoneError ? (
          <Text className="text-red-500 text-xs mt-1 ml-1">
            {phoneError}
          </Text>
        ) : null}

        {/* Verify */}
        <View className="mt-8">
          <Text className="text-gray-400 mb-4">{t('verify_to_continue')}</Text>

          <View className="flex-row">
            {/* WhatsApp Button */}
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center p-4 mr-3 rounded-xl border ${
                isSendingWhatsApp ? 'bg-gray-300 border-gray-400' : 'border-secondary'
              }`}
              onPress={() => handleProceedToVerification('whatsapp')}
              disabled={!!phoneError || isLoading || isSendingSMS}
            >
              {isSendingWhatsApp ? (
                <ActivityIndicator color="#25D366" />
              ) : (
                <>
                  <Image
                    source={images.whatsappIcon}
                    className="w-6 h-6 mr-2"
                  />
                  <Text className="text-gray-400">WhatsApp</Text>
                </>
              )}
            </TouchableOpacity>

            {/* SMS Button */}
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center p-4 rounded-xl ${
                isSendingSMS ? 'bg-gray-700' : 'bg-secondary'
              }`}
              onPress={() => handleProceedToVerification('sms')}
              disabled={!!phoneError || isLoading || isSendingWhatsApp}
            >
              {isSendingSMS ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Phone size={22} color="#ffff" />
                  <Text className="ml-2 text-white">{t('sms')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Country Picker */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/30 justify-end"
          onPress={() => setShowCountryPicker(false)}
          disabled={isLoading}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-6 max-h-[70%]"
            onPressIn={() => { }}
          >
            <Text className="text-xl font-semibold mb-4">
              {t('select_country')}
            </Text>

            <FlatList
              data={countries}
              keyExtractor={item => `${item.value}-${item.code}`}
              initialNumToRender={20}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-4 border-b border-gray-100 flex-row justify-between"
                  onPress={() => handleCountrySelect(item)}
                  disabled={isLoading}
                >
                  <Text>{item.label}</Text>
                  <Text className="text-gray-500">{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default BusinessRegisterForm;