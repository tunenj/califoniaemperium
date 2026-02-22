import images from '@/constants/images';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

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

  // Toast helper functions
  const showSuccessToast = (title: string, message: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
    });
  };

  const showErrorToast = (title: string, message: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
    });
  };

  // Error parser function for API errors
  const parseApiError = (error: any): string => {
    try {
      // Default message
      let errorMessage = t('registration_failed_message') || 'An error occurred during registration.';
      
      if (!error.response?.data) {
        return error.message || errorMessage;
      }

      const errorData = error.response.data;

      // Handle your specific error structure from the 400 response
      if (errorData.error) {
        const errorObj = errorData.error;
        
        // Handle the details field which contains the validation errors
        if (errorObj.details) {
          let details = errorObj.details;
          
          // If details is a string, try to extract the email error
          if (typeof details === 'string') {
            // Try to parse the details string
            try {
              // Replace single quotes with double quotes for JSON parsing
              const jsonStr = details.replace(/'/g, '"');
              const parsedDetails = JSON.parse(jsonStr);
              details = parsedDetails;
            } catch {
              // If JSON parsing fails, use regex to extract the error message
              // Extract email error message using regex
              const emailMatch = details.match(/email['"]?:\s*\[\s*ErrorDetail\(string=['"]([^'"]+)['"]/);
              if (emailMatch && emailMatch[1]) {
                // Clean up the extracted message
                let extractedMsg = emailMatch[1];
                if (extractedMsg.includes('user with this email address already exists')) {
                  return 'This email address is already registered. Please use a different email or try logging in.';
                }
                return extractedMsg;
              }
              
              // If no match, clean up the string
              return details
                .replace(/[{}[\]']/g, '') // Remove brackets and quotes
                .replace(/ErrorDetail\(string=/g, '')
                .replace(/, code=\w+\)/g, '')
                .replace(/user with this email address already exists\./g, 'This email address is already registered.')
                .trim();
            }
          }
          
          // Handle parsed details object
          if (details && typeof details === 'object') {
            // Check for email field errors
            if (details.email) {
              const emailError = details.email;
              if (Array.isArray(emailError) && emailError.length > 0) {
                const firstError = emailError[0];
                if (typeof firstError === 'string') {
                  return firstError.includes('user with this email address already exists') 
                    ? 'This email address is already registered.' 
                    : firstError;
                }
                if (firstError?.string) {
                  return firstError.string.includes('user with this email address already exists')
                    ? 'This email address is already registered.'
                    : firstError.string;
                }
              }
              return String(emailError);
            }
            
            // Handle other field errors
            const firstField = Object.keys(details)[0];
            if (firstField && details[firstField]) {
              const fieldError = details[firstField];
              if (Array.isArray(fieldError) && fieldError.length > 0) {
                const errorStr = String(fieldError[0]);
                return errorStr.includes('user with this email address already exists')
                  ? 'This email address is already registered.'
                  : errorStr;
              }
            }
          }
          
          // Use the message if available
          if (errorObj.message) {
            let message = errorObj.message;
            if (typeof message === 'string') {
              // Clean up the message
              message = message
                .replace(/[{}[\]']/g, '')
                .replace(/ErrorDetail\(string=/g, '')
                .replace(/, code=\w+\)/g, '');
              
              if (message.includes('user with this email address already exists')) {
                return 'This email address is already registered.';
              }
              return message;
            }
          }
        }
        
        return errorObj.message || errorMessage;
      }
      
      // Fallback to message field
      if (errorData.message) {
        let message = errorData.message;
        if (typeof message === 'string') {
          message = message
            .replace(/[{}[\]']/g, '')
            .replace(/ErrorDetail\(string=/g, '')
            .replace(/, code=\w+\)/g, '');
          
          if (message.includes('user with this email address already exists')) {
            return 'This email address is already registered.';
          }
          return message;
        }
      }
      
      return errorMessage;
      
    } catch {
      return 'An unexpected error occurred. Please try again.';
    }
  };

  // Register API with toast notifications
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

      const response = await api.post(endpoints.register, payload);
      const responseData = response.data;

      if (responseData && responseData.success) {
        // Check for tokens in different possible locations
        const tokens = 
          responseData.data?.tokens ||
          responseData.tokens ||
          responseData.data;
        
        const accessToken = tokens?.access || tokens?.access_token;
        const refreshToken = tokens?.refresh || tokens?.refresh_token;

        // Validate tokens
        if (!accessToken) {
          showErrorToast(
            t('registration_error') || 'Registration Error',
            'Registration succeeded but authentication failed. Please try logging in.'
          );
          
          setTimeout(() => {
            router.replace('/signIn');
          }, 2000);
          
          return;
        }

        // Validate token format
        const accessTokenStr = String(accessToken).trim();
        const refreshTokenStr = String(refreshToken || '').trim();

        if (!accessTokenStr || accessTokenStr.length < 10) {
          showErrorToast(
            t('registration_error') || 'Registration Error',
            'Invalid authentication token received. Please try again.'
          );
          return;
        }

        // Save tokens with verification
        try {
          await AsyncStorage.setItem('authToken', accessTokenStr);
          
          if (refreshTokenStr) {
            await AsyncStorage.setItem('refreshToken', refreshTokenStr);
          }
          
          // Verify tokens were saved
          const verifyToken = await AsyncStorage.getItem('authToken');
          
          if (!verifyToken) {
            throw new Error('Token verification failed - token not found after save');
          }
          
          // Show success toast before navigation
          showSuccessToast(
            t('registration_successful') || 'Registration Successful',
            responseData.message || 'Please verify your email to continue.'
          );
          
        } catch (storageError) {
          // Log the error for debugging
          console.error('Storage error during token save:', storageError);
          
          showErrorToast(
            t('storage_error') || 'Storage Error',
            'Failed to save your session. Please check app permissions and try again.'
          );
          return;
        }

        // Small delay to ensure storage completes and user sees success message
        await new Promise(resolve => setTimeout(resolve, 300));

        // Final verification
        const finalCheck = await AsyncStorage.getItem('authToken');
        if (!finalCheck) {
          showErrorToast(
            t('storage_error') || 'Storage Error',
            'Session could not be saved. Please try again.'
          );
          return;
        }

        // Navigate to OTP verification
        setTimeout(() => {
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
        }, 1500);
        
      } else {
        const errorMsg = responseData.message || t('registration_failed_message') || 'Registration failed. Please try again.';
        showErrorToast(t('registration_failed') || 'Registration Failed', errorMsg);
      }
    } catch (error: any) {
      // Log the error for debugging
      console.error('Registration error:', error);
      
      // Parse the error message using our helper function
      const errorMessage = parseApiError(error);
      
      // Show specific message for 400 errors
      if (error.response?.status === 400) {
        if (errorMessage.includes('email address already exists') || 
            errorMessage.includes('already registered')) {
          showErrorToast(
            t('registration_failed') || 'Registration Failed',
            'This email is already registered. Please use a different email or sign in.'
          );
        } else {
          showErrorToast(
            t('registration_failed') || 'Registration Failed',
            errorMessage
          );
        }
      } else {
        showErrorToast(
          t('registration_failed') || 'Registration Failed',
          errorMessage
        );
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!canSubmit || isLoading) return;
    registerUser();
  };

  const renderValidationIcon = (isValid: boolean) =>
    isValid ? (
      <MaterialIcons name="check-circle" size={16} color="#10B981" />
    ) : (
      <MaterialIcons name="cancel" size={16} color="#EF4444" />
    );

  return (
    <View className="flex-1 bg-white">
      {/* Header Image */}
      <View className="bg-secondary h-1/3 min-h-[250px] relative">
        <View className="flex-1 items-center justify-center">
          <Image source={images.onboarding} className="w-16 h-16" resizeMode="contain" />
        </View>
      </View>

      <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-8">
        <TouchableOpacity 
          className="absolute top-0 left-0 p-2 z-10" 
          onPress={handleBack} 
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={28} color="#C62828" />
        </TouchableOpacity>

        {/* Title & Role Switch */}
        <View className="mb-8 items-center">
          <Text className="text-2xl font-bold text-black mb-1">
            {`${t('register_as')} ${isCustomer ? t('customer') : t('business')}`}
          </Text>
          <TouchableOpacity 
            className="flex-row items-center mt-2" 
            onPress={() => setIsCustomer(!isCustomer)}
          >
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
          <View className="relative">
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
              className="absolute right-4 top-4"
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <FontAwesome name="eye-slash" size={20} color="#666" />
              ) : (
                <FontAwesome name="eye" size={20} color="#666" />
              )}
            </TouchableOpacity>
          </View>

          {/* Password validations */}
          {password.length > 0 && (
            <View className="mt-4 space-y-2">
              <View className="flex-row items-center">
                {renderValidationIcon(passwordValidations.minLength)}
                <Text className="ml-2 text-sm text-gray-500">{t('password_validation_min_length')}</Text>
              </View>
              <View className="flex-row items-center">
                {renderValidationIcon(passwordValidations.hasUpperCase)}
                <Text className="ml-2 text-sm text-gray-500">{t('password_validation_uppercase')}</Text>
              </View>
              <View className="flex-row items-center">
                {renderValidationIcon(passwordValidations.hasLowerCase)}
                <Text className="ml-2 text-sm text-gray-500">{t('password_validation_lowercase')}</Text>
              </View>
              <View className="flex-row items-center">
                {renderValidationIcon(passwordValidations.hasNumbers)}
                <Text className="ml-2 text-sm text-gray-500">{t('password_validation_numbers')}</Text>
              </View>
              <View className="flex-row items-center">
                {renderValidationIcon(passwordValidations.hasSpecialChar)}
                <Text className="ml-2 text-sm text-gray-500">{t('password_validation_special_char')}</Text>
              </View>
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
      
      {/* Toast component */}
      <Toast />
    </View>
  );
};

export default RegisterForm;