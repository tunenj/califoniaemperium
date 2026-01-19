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
  TouchableWithoutFeedback,
  View,
  Modal,
  FlatList,
  BackHandler,
  Alert,
} from 'react-native';
import { countries } from '@/data/countries';
import { validatePhoneNumber, formatPhoneNumber } from '@/utils/phoneValidation';

type UserRole = 'business' | 'customer';

interface Country {
  value: string;
  label: string;
  code: string;
}

const BusinessRegisterForm: React.FC = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.value === 'canada') || countries[0]
  );

  const [selectedMethod, setSelectedMethod] = useState<'whatsapp' | 'sms'>('sms');
  const [role, setRole] = useState<UserRole>('business');
  const [showCountryPicker, setShowCountryPicker] = useState(false);


  // Validate phone number on change
  const handlePhoneNumberChange = useCallback((text: string) => {
    // Format as user types
    const formatted = formatPhoneNumber(text, selectedCountry.code);
    setPhoneNumber(text.replace(/\D/g, '')); // Store digits only
    setFormattedPhoneNumber(formatted);
    
    // Clear error when user starts typing
    if (phoneError && text.length > 0) {
      setPhoneError('');
    }
  }, [selectedCountry.code, phoneError]);

  // Validate phone number when country changes
  useEffect(() => {
    if (phoneNumber) {
      const validation = validatePhoneNumber(phoneNumber, selectedCountry.code);
      if (!validation.isValid && validation.error) {
        setPhoneError(validation.error);
      } else {
        setPhoneError('');
        // Reformat with new country's format
        const formatted = formatPhoneNumber(phoneNumber, selectedCountry.code);
        setFormattedPhoneNumber(formatted);
      }
    }
  }, [selectedCountry.code, phoneNumber]);

  const handleBack = () => router.back();
  const handleSignIn = () => router.push('/(auth)/signIn');

  const validateForm = () => {
    let isValid = true;
    const errors: string[] = [];

    if (!firstName.trim()) {
      errors.push('First name is required');
      isValid = false;
    }

    if (!lastName.trim()) {
      errors.push('Last name is required');
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      errors.push('Phone number is required');
      isValid = false;
    } else {
      const validation = validatePhoneNumber(phoneNumber, selectedCountry.code);
      if (!validation.isValid) {
        errors.push(validation.error || 'Invalid phone number');
        isValid = false;
      }
    }

    if (!isValid) {
      Alert.alert(
        'Form Error',
        errors.join('\n'),
        [{ text: 'OK' }]
      );
    }

    return isValid;
  };

  const handleProceedToVerification = () => {
    if (!validateForm()) {
      return;
    }

    // Get validation for final check
    const validation = validatePhoneNumber(phoneNumber, selectedCountry.code);
    
    // Use formatted phone if available, otherwise use raw digits
    const finalPhoneNumber = validation.formattedPhone || phoneNumber;
    
    router.push({
      pathname: '/(auth)/OtpVerification',
      params: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: `${selectedCountry.code}${phoneNumber}`,
        formattedPhoneNumber: `${selectedCountry.code} ${finalPhoneNumber}`,
        method: selectedMethod,
        role,
        source: 'phone',
      },
    });
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    
    // Clear phone number when country changes (optional)
    // setPhoneNumber('');
    // setFormattedPhoneNumber('');
  };

  /** Close country picker on Android back */
  useEffect(() => {
    const backAction = () => {
      if (showCountryPicker) {
        setShowCountryPicker(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [showCountryPicker]);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-1/3 min-h-[250px]">
        <View className="flex-1 items-center justify-center">
          <Image
            source={images.onboarding}
            className="w-16 h-16"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Form */}
      <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-8">
        {/* Back */}
        <TouchableOpacity
          className="absolute top-4 left-4 z-10"
          onPress={handleBack}
        >
          <ArrowLeft size={28} color="#C62828" />
        </TouchableOpacity>

        {/* Title + Role Switch */}
        <View className="mb-8 items-center">
          <Text className="text-lg font-semibold text-black mb-1">
            {role === 'customer'
              ? 'Register as Customer'
              : 'Register as Business'}
          </Text>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() =>
              setRole(role === 'business' ? 'customer' : 'business')
            }
          >
            <Image source={images.switchIcon} className="w-6 h-6 mr-2" />
            <Text className="text-lg text-gray-400 font-medium underline">
              {role === 'customer'
                ? 'Switch to Business'
                : 'Switch to Customer'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Names */}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-gray-600 text-sm mb-1">First Name</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 border-b border-secondary"
              placeholder="Enter First Name"
              placeholderTextColor="black"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          <View className="flex-1 ml-2">
            <Text className="text-gray-600 text-sm mb-1">Last Name</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 border-b border-secondary"
              placeholder="Enter Last Name"
              placeholderTextColor="black"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Phone */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-600 text-sm">Phone Number</Text>
          </View>
          
          <View className={`flex-row items-center bg-gray-100 rounded-lg border-b ${
            phoneError ? 'border-red-500' : 'border-secondary'
          }`}>
            <TouchableOpacity
              className="px-3 py-4 border-r border-gray-200"
              style={{ width: 100 }}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text className="text-base font-medium">
                {selectedCountry?.code || '+1'}
              </Text>
            </TouchableOpacity>

            <View className="flex-1">
              <TextInput
                className="px-3 py-4 text-base"
                placeholder={`Enter phone number`}
                placeholderTextColor="black"
                value={formattedPhoneNumber}
                onChangeText={handlePhoneNumberChange}
                keyboardType="phone-pad"
                maxLength={20} // Allow space for formatting
              />
            </View>
          </View>
        </View>

        {/* Country Picker Modal */}
        <Modal visible={showCountryPicker} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={() => setShowCountryPicker(false)}>
            <View className="flex-1 justify-end bg-black/20">
              <TouchableWithoutFeedback>
                <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
                  <Text className="text-xl font-semibold mb-4">
                    Select Country
                  </Text>
                  <FlatList
                    data={countries}
                    keyExtractor={c => c.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className="py-4 border-b border-gray-100 flex-row justify-between items-center"
                        onPress={() => handleCountrySelect(item)}
                      >
                        <Text className="text-base">
                          {item.label}
                        </Text>
                        <Text className="text-base text-gray-600">
                          {item.code}
                        </Text>
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Verification Method */}
        <View className="mb-6">
          <Text className="text-lg text-gray-400 mb-4">
            Verify to continue
          </Text>

          <View className="flex-row">
            {/* WhatsApp */}
            <TouchableOpacity
              className={`flex-1 flex-row items-center p-4 mr-3 rounded-xl border ${
                selectedMethod === 'whatsapp'
                  ? 'bg-secondary border-secondary'
                  : 'bg-white border-secondary'
              }`}
              onPress={() => {
                setSelectedMethod('whatsapp');
                handleProceedToVerification();
              }}
              disabled={!!phoneError}
              style={{ opacity: phoneError ? 0.5 : 1 }}
            >
              <Image
                source={images.whatsappIcon}
                className="w-6 h-6 mr-2"
              />
              <Text
                className={`text-sm font-medium ${
                  selectedMethod === 'whatsapp'
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
              >
                WhatsApp
              </Text>
            </TouchableOpacity>

            {/* SMS */}
            <TouchableOpacity
              className={`flex-1 flex-row items-center p-4 rounded-xl border ${
                selectedMethod === 'sms'
                  ? 'bg-secondary border-secondary'
                  : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() => {
                setSelectedMethod('sms');
                handleProceedToVerification();
              }}
              disabled={!!phoneError}
              style={{ opacity: phoneError ? 0.5 : 1 }}
            >
              <Phone
                size={24}
                color={selectedMethod === 'sms' ? 'white' : '#666'}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`text-sm font-medium ${
                  selectedMethod === 'sms'
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
              >
                SMS
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login */}
        <View className="items-center">
          <TouchableOpacity onPress={handleSignIn}>
            <Text className="text-gray-600 text-base">
              Already have an account?{' '}
              <Text className="text-secondary font-semibold">Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default BusinessRegisterForm;