import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react-native';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const isMounted = useRef(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Password validations
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
  });

  // Lifecycle safety
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Email validation
  const validateEmail = useCallback((value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(value);
    if (!isMounted.current) return valid;
    setEmailError(valid ? '' : t('invalid_email_format'));
    return valid;
  }, [t]);

  useEffect(() => {
    validateEmail(email);
  }, [email, validateEmail]);

  // Password validation
  const validatePassword = useCallback((value: string) => {
    const validations = {
      minLength: value.length >= 8,
      hasUpperCase: /[A-Z]/.test(value),
      hasLowerCase: /[a-z]/.test(value),
      hasNumbers: /\d/.test(value),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    };
    if (!isMounted.current) return false;
    setPasswordValidations(validations);
    return Object.values(validations).every(Boolean);
  }, []);

  useEffect(() => {
    validatePassword(password);
  }, [password, validatePassword]);

  // Can submit
  const canSubmit = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailOk = email.trim() !== '' && emailRegex.test(email);
    const passwordOk =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const passwordsMatch = password === passwordConfirm;
    return emailOk && passwordOk && passwordsMatch;
  }, [email, password, passwordConfirm]);

  // Navigation
  const handleBack = () => { if (router.canGoBack()) router.back(); };
  const handleSignIn = () => router.push('/signIn');

  // ✅ FIXED: Register API with CORRECT token key names
  const registerUser = async () => {
    if (!canSubmit) return;

    try {
      setIsLoading(true);

      const payload = {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        password_confirm: passwordConfirm.trim(),
        role: isCustomer ? 'customer' : 'vendor',
      };

      console.log('==========================================');
      console.log('REGISTRATION REQUEST');
      console.log('Email:', payload.email);
      console.log('Role:', payload.role);
      console.log('==========================================');

      const response = await api.post(endpoints.register, payload);
      const responseData = response.data;

      console.log('==========================================');
      console.log('REGISTRATION RESPONSE');
      console.log('Success:', responseData?.success);
      console.log('Full response:', JSON.stringify(responseData, null, 2));
      console.log('==========================================');

      if (responseData && responseData.success) {
        // ✅ FIX: Check for tokens in different possible locations
        const tokens = 
          responseData.data?.tokens ||
          responseData.tokens ||
          responseData.data;

        console.log('==========================================');
        console.log('TOKEN EXTRACTION');
        console.log('Tokens object:', tokens);
        
        // ✅ FIX: Your API uses "access" and "refresh", not "access_token" and "refresh_token"
        const accessToken = tokens?.access || tokens?.access_token;
        const refreshToken = tokens?.refresh || tokens?.refresh_token;
        
        console.log('Access token:', accessToken ? `${accessToken.substring(0, 30)}...` : 'MISSING');
        console.log('Refresh token:', refreshToken ? `${refreshToken.substring(0, 30)}...` : 'MISSING');
        console.log('==========================================');

        // ✅ CRITICAL: Validate tokens
        if (!accessToken) {
          console.error('❌ CRITICAL: No access token in registration response!');
          console.error('Token keys found:', Object.keys(tokens || {}));
          
          Alert.alert(
            t('registration_error') || 'Registration Error',
            'Registration succeeded but authentication failed. Please try logging in.',
            [
              {
                text: t('go_to_login') || 'Go to Login',
                onPress: () => router.replace('/signIn'),
              },
            ]
          );
          return;
        }

        // ✅ Validate token format
        const accessTokenStr = String(accessToken).trim();
        const refreshTokenStr = String(refreshToken || '').trim();

        if (!accessTokenStr || accessTokenStr.length < 10) {
          console.error('❌ Invalid access token format');
          Alert.alert(
            t('registration_error') || 'Registration Error',
            'Invalid authentication token received. Please try again.',
            [{ text: 'OK' }]
          );
          return;
        }

        console.log('✅ Token format validated');

        // ✅ Save tokens with verification
        try {
          console.log('💾 Attempting to save tokens to AsyncStorage...');
          
          await AsyncStorage.setItem('authToken', accessTokenStr);
          console.log('✅ Auth token saved');
          
          if (refreshTokenStr) {
            await AsyncStorage.setItem('refreshToken', refreshTokenStr);
            console.log('✅ Refresh token saved');
          }
          
          // ✅ Verify tokens were saved
          console.log('🔍 Verifying tokens in storage...');
          
          const verifyToken = await AsyncStorage.getItem('authToken');
          const verifyRefresh = await AsyncStorage.getItem('refreshToken');
          
          if (!verifyToken) {
            throw new Error('Token verification failed - token not found after save');
          }
          
          console.log('==========================================');
          console.log('TOKEN VERIFICATION SUCCESS');
          console.log('Auth token in storage:', verifyToken ? `${verifyToken.substring(0, 30)}...` : 'MISSING');
          console.log('Refresh token in storage:', verifyRefresh ? 'EXISTS' : 'MISSING');
          console.log('==========================================');
          
        } catch (storageError) {
          console.error('==========================================');
          console.error('❌ CRITICAL: Failed to save tokens to AsyncStorage!');
          console.error('Error:', storageError);
          console.error('Error message:', (storageError as Error).message);
          console.error('==========================================');
          
          Alert.alert(
            t('storage_error') || 'Storage Error',
            'Failed to save your session. Please check app permissions and try again.',
            [
              {
                text: t('try_again') || 'Try Again',
                onPress: () => {},
              },
            ]
          );
          return;
        }

        // ✅ Small delay to ensure storage completes
        await new Promise(resolve => setTimeout(resolve, 300));

        // ✅ Final verification
        const finalCheck = await AsyncStorage.getItem('authToken');
        if (!finalCheck) {
          console.error('❌ Token disappeared after save!');
          Alert.alert(
            t('storage_error') || 'Storage Error',
            'Session could not be saved. Please try again.',
            [{ text: 'OK' }]
          );
          return;
        }

        console.log('🚀 All checks passed - navigating to OTP verification...');

        // Navigate to OTP verification
        router.push({
          pathname: '/OtpVerification',
          params: {
            email: email.trim(),
            source: 'email',
            role: isCustomer ? 'customer' : 'vendor',
            method: 'email',
            firstName: payload.email.split('@')[0],
          },
        });

        Alert.alert(
          t('registration_successful') || 'Registration Successful',
          responseData.message || 'Please verify your email to continue.'
        );
        
      } else {
        const errorMsg = responseData.message || t('registration_failed_message') || 'Registration failed. Please try again.';
        Alert.alert(t('registration_failed') || 'Registration Failed', errorMsg);
      }
    } catch (error: any) {
      console.error('==========================================');
      console.error('REGISTRATION ERROR');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('==========================================');
      
      const errorMsg = error.response?.data?.message || error.message || t('registration_failed_message') || 'An error occurred.';
      Alert.alert(t('registration_failed') || 'Registration Failed', errorMsg);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!canSubmit || isLoading) return;
    registerUser();
  };

  const renderValidationIcon = (isValid: boolean) =>
    isValid ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />;

  return (
    <View className="flex-1 bg-white">
      {/* Header Image */}
      <View className="bg-secondary h-1/3 min-h-[250px] relative">
        <View className="flex-1 items-center justify-center">
          <Image source={images.onboarding} className="w-16 h-16" resizeMode="contain" />
        </View>
      </View>

      <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-8">
        <TouchableOpacity className="absolute top-0 left-0 p-2 z-10" onPress={handleBack} disabled={isLoading}>
          <ArrowLeft size={28} color="#C62828" />
        </TouchableOpacity>

        {/* Title & Role Switch */}
        <View className="mb-8 items-center">
          <Text className="text-2xl font-bold text-black mb-1">
            {`${t('register_as')} ${isCustomer ? t('customer') : t('business')}`}
          </Text>
          <TouchableOpacity className="flex-row items-center mt-2" onPress={() => setIsCustomer(!isCustomer)}>
            <Image source={images.switchIcon} className="w-6 h-6 mr-2" resizeMode="contain" />
            <Text className="text-lg text-gray-400 font-medium underline">
              {`${t('switch_to')} ${isCustomer ? t('business') : t('customer')}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm mb-1">{t('email')}</Text>
          <TextInput
            className={`bg-gray-100 rounded-xl px-4 py-4 text-base border ${emailError ? 'border-red-300' : 'border-gray-200'}`}
            placeholder={t('enter_your_email')}
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          {emailError ? <Text className="text-red-500 text-xs mt-1 ml-1">{emailError}</Text> : null}
        </View>

        {/* Password */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm mb-1">{t('create_password')}</Text>
          <TextInput
            className="bg-gray-100 rounded-xl px-4 py-4 text-base pr-12 border border-gray-200"
            placeholder={t('create_password_placeholder')}
            placeholderTextColor="#6B7280"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TouchableOpacity
            className="absolute right-4 top-9"
            onPress={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={24} color="#666" />}
          </TouchableOpacity>

          {/* Password validations */}
          {password.length > 0 && (
            <View className="mt-4 space-y-2">
              <View className="flex-row items-center">{renderValidationIcon(passwordValidations.minLength)}<Text className="ml-2 text-sm text-gray-500">{t('password_validation_min_length')}</Text></View>
              <View className="flex-row items-center">{renderValidationIcon(passwordValidations.hasUpperCase)}<Text className="ml-2 text-sm text-gray-500">{t('password_validation_uppercase')}</Text></View>
              <View className="flex-row items-center">{renderValidationIcon(passwordValidations.hasLowerCase)}<Text className="ml-2 text-sm text-gray-500">{t('password_validation_lowercase')}</Text></View>
              <View className="flex-row items-center">{renderValidationIcon(passwordValidations.hasNumbers)}<Text className="ml-2 text-sm text-gray-500">{t('password_validation_numbers')}</Text></View>
              <View className="flex-row items-center">{renderValidationIcon(passwordValidations.hasSpecialChar)}<Text className="ml-2 text-sm text-gray-500">{t('password_validation_special_char')}</Text></View>
            </View>
          )}
        </View>

        {/* Confirm Password */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm mb-1">{t('confirm_password')}</Text>
          <TextInput
            className={`bg-gray-100 rounded-xl px-4 py-4 text-base border text-black ${passwordConfirm && passwordConfirm !== password ? 'border-red-300' : 'border-gray-200'}`}
            placeholder={t('confirm_password')}
            placeholderTextColor="#6B7280"
            secureTextEntry={!showPassword}
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            autoCapitalize="none"
            editable={!isLoading}
          />
          {passwordConfirm && passwordConfirm !== password ? (
            <Text className="text-red-500 text-xs mt-1 ml-1">{t('passwords_do_not_match')}</Text>
          ) : null}
        </View>

        {/* Continue button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center mb-8 ${canSubmit && !isLoading ? 'bg-secondary' : 'bg-gray-300'}`}
          onPress={handleContinue}
          disabled={!canSubmit || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className={`text-lg font-semibold ${canSubmit ? 'text-white' : 'text-gray-500'}`}>
              {t('continue')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Already have account */}
        <View className="items-center pb-6">
          <TouchableOpacity onPress={handleSignIn} disabled={isLoading}>
            <Text className="text-gray-600 text-base">
              {t('already_have_account')}{' '}
              <Text className="text-secondary font-semibold">{t('log_in')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RegisterForm;