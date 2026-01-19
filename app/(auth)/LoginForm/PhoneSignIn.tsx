// app/(auth)/LoginScreen.tsx
import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Image, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Modal, 
  FlatList,
  Alert
} from 'react-native';
import { countries } from '@/data/countries';
import { validatePhoneNumber, formatPhoneNumber } from '@/utils/phoneValidation';

interface Country {
  value: string;
  label: string;
  code: string;
}

const LoginScreen: React.FC = () => {
  const router = useRouter();

  const [role, setRole] = useState<'vendor' | 'customer'>('vendor');
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.value === 'canada') || countries[0]
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');


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

  // Clear errors when password changes
  useEffect(() => {
    if (passwordError && password.length > 0) {
      setPasswordError('');
    }
  }, [password, passwordError]);

  const isFormValid = phoneNumber.trim() !== '' && 
                     password.trim() !== '' && 
                     !phoneError;

  const handleBack = () => router.back();

  const handleSwitchRole = () => {
    setRole(prev => (prev === 'vendor' ? 'customer' : 'vendor'));
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgotPassword');
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const errors: string[] = [];

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

    if (!password.trim()) {
      errors.push('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
      isValid = false;
    }

    if (!isValid) {
      Alert.alert(
        'Login Error',
        errors.join('\n'),
        [{ text: 'OK' }]
      );
    }

    return isValid;
  };

  const handleLogin = () => {
    if (!validateForm()) {
      return;
    }

    const fullPhone = `${selectedCountry.code}${phoneNumber}`;
    const validation = validatePhoneNumber(phoneNumber, selectedCountry.code);
    const displayPhone = validation.formattedPhone || phoneNumber;
    
    console.log('Login Attempt:', {
      role,
      phone: fullPhone,
      displayPhone: `${selectedCountry.code} ${displayPhone}`,
      hasPassword: !!password
    });

    // Here you would typically make an API call to authenticate
    // For now, we'll simulate successful login
    
    if (role === 'vendor') {
      router.replace('/(vendor)/home');
    } else {
      router.replace('/(customer)/home');
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/signUp');
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  return (
    <View className="flex-1 bg-white">
      
      {/* Header */}
      <View className="bg-[#C62828] h-1/3 min-h-[250px] relative">
        <View className="flex-1 items-center justify-center pt-12">
          <Image
            source={images.onboarding}
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 bg-white -mt-12 rounded-t-3xl px-8 pt-8">
        
        {/* Back + Title */}
        <View className="relative mb-8">
          <TouchableOpacity onPress={handleBack} className="absolute top-0 left-0 p-2">
            <ArrowLeft size={28} color="#C62828" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-2xl font-bold text-black mb-2">
              Login as {role === 'vendor' ? 'Business' : 'Customer'}
            </Text>

            <TouchableOpacity className="flex-row items-center" onPress={handleSwitchRole}>
              <Image source={images.switchIcon} className="w-5 h-5 mr-2" resizeMode="contain" />
              <Text className="text-base text-gray-500 underline">
                Switch to {role === 'vendor' ? 'Customer' : 'Business'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View className="mb-8">
          {/* Phone */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-700 text-base">Phone Number</Text>
          </View>

          <View className={`flex-row items-center bg-gray-100 rounded-lg border-b-2 ${
            phoneError ? 'border-red-500' : 'border-[#C62828]'
          } mb-6`}>
            
            {/* Country Picker */}
            <TouchableOpacity
              className="flex-row items-center px-3 py-4 border-r border-gray-200"
              style={{ width: 100 }}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text className="text-base font-medium">{selectedCountry?.code || '+1'}</Text>
            </TouchableOpacity>

            <View className="flex-1">
              <TextInput
                className="py-4 px-3 text-base"
                placeholder="Enter phone number"
                placeholderTextColor="#444"
                value={formattedPhoneNumber}
                onChangeText={handlePhoneNumberChange}
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>
          </View>

          {/* Password */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-700 text-base">Password</Text>
            {passwordError && (
              <View className="flex-row items-center">
                <AlertCircle size={14} color="#ef4444" />
                <Text className="text-red-500 text-xs ml-1">{passwordError}</Text>
              </View>
            )}
          </View>

          <View className={`relative ${passwordError ? 'mb-2' : 'mb-0'}`}>
            <TextInput
              className={`bg-gray-100 rounded-lg px-4 py-4 text-base pr-12 border-b-2 ${
                passwordError ? 'border-red-500' : 'border-[#C62828]'
              }`}
              secureTextEntry={!showPassword}
              placeholder="Enter Password"
              placeholderTextColor="#444"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
            />
            <TouchableOpacity 
              className="absolute right-4 top-4" 
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={24} color="#999" /> : <Eye size={24} color="#999" />}
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="items-end mt-3" onPress={handleForgotPassword}>
            <Text className="text-[#C62828] text-sm">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          disabled={!isFormValid}
          onPress={handleLogin}
          className={`rounded-full py-4 items-center mb-8 ${
            isFormValid ? 'bg-[#C62828]' : 'bg-gray-300'
          }`}
          style={{ opacity: isFormValid ? 1 : 0.5 }}
        >
          <Text className={`text-lg font-semibold ${isFormValid ? 'text-white' : 'text-gray-600'}`}>
            Login
          </Text>
        </TouchableOpacity>

        {/* Sign Up */}
        <View className="items-center mb-6">
          <Text className="text-gray-600 text-base">
            Don&apos;t have an account?{' '}
            <TouchableOpacity onPress={handleSignUp}>
              <Text className="text-[#C62828] font-semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>

      {/* Country Picker Modal */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/20">
          <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
            <Text className="text-xl font-semibold mb-4">Select Country</Text>
            <FlatList
              data={countries}
              keyExtractor={c => c.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-4 border-b border-gray-100 flex-row justify-between items-center"
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text className="text-base">{item.label}</Text>
                  <Text className="text-base text-gray-600">{item.code}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoginScreen;