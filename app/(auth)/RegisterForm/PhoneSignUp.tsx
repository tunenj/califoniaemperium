// app/(auth)/BusinessRegisterForm.tsx
import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone } from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { countries } from '@/data/countries';
import {
  validatePhoneNumber,
  formatPhoneNumber,
} from '@/utils/phoneValidation';
import { useLanguage } from '@/context/LanguageContext'; // Add import

type UserRole = 'business' | 'customer';

interface Country {
  value: string;
  label: string;
  code: string;
}

const BusinessRegisterForm: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage(); // Add hook

  const defaultCountry =
    countries.find(c => c.value === 'canada') ?? countries[0];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [selectedCountry, setSelectedCountry] =
    useState<Country>(defaultCountry);

  const [selectedMethod, setSelectedMethod] =
    useState<'whatsapp' | 'sms'>('sms');

  const [role, setRole] = useState<UserRole>('business');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

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

  const handleProceedToVerification = () => {
    if (!validateForm()) return;

    const cleanCode = getCleanCountryCode();

    router.push({
      pathname: '/OtpVerification',
      params: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: `${cleanCode}${phoneNumber}`,
        formattedPhoneNumber: `+${cleanCode} ${formattedPhoneNumber}`,
        method: selectedMethod,
        role,
        source: 'phone',
      },
    });
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
          />
        </View>

        {/* Verify */}
        <View className="mt-8">
          <Text className="text-gray-400 mb-4">{t('verify_to_continue')}</Text>

          <View className="flex-row">
            <TouchableOpacity
              className="flex-1 flex-row items-center p-4 mr-3 rounded-xl border border-secondary"
              onPress={() => {
                setSelectedMethod('whatsapp');
                handleProceedToVerification();
              }}
              disabled={!!phoneError}
            >
              <Image
                source={images.whatsappIcon}
                className="w-6 h-6 mr-2"
              />
              <Text className="text-gray-400">WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 flex-row items-center p-4 rounded-xl bg-secondary"
              onPress={() => {
                setSelectedMethod('sms');
                handleProceedToVerification();
              }}
              disabled={!!phoneError}
            >
              <Phone size={22} color="#ffff" />
              <Text className="ml-2 text-white">{t('sms')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Country Picker (SAFE) */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/30 justify-end"
          onPress={() => setShowCountryPicker(false)}
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