// app/(auth)/BusinessRegisterForm.tsx
import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailError, setEmailError] = useState('');
  
  // Password validation states
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
  });

  // Memoize validation functions to prevent unnecessary re-renders
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      setIsEmailValid(true);
      setEmailError('');
      return false;
    }
    
    const isValid = emailRegex.test(email);
    setIsEmailValid(isValid);
    
    if (!isValid) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
    
    return isValid;
  }, []);

  const validatePassword = useCallback((password: string): boolean => {
    const validations = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    setPasswordValidations(validations);
    
    return Object.values(validations).every(v => v);
  }, []);

  // Use useEffect to run validations on email/password change
  useEffect(() => {
    validateEmail(email);
  }, [email, validateEmail]);

  useEffect(() => {
    validatePassword(password);
  }, [password, validatePassword]);

  // Check if form can be submitted - use useMemo to avoid recalculating on every render
  const canSubmit = React.useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValidated = email.trim() !== '' && emailRegex.test(email);
    
    // Check all password validations
    const isPasswordValidated = 
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return isEmailValidated && isPasswordValidated;
  }, [email, password]);

  const handleBack = () => {
    router.back();
  };

  const handleSignIn = () => {
    router.push('/(auth)/signIn');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Don't call validateEmail here - let useEffect handle it
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Don't call validatePassword here - let useEffect handle it
  };

  // Check if email already exists (simulate API call)
  const checkEmailExists = async (email: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, this would be an actual API call
    // For demo, return false (email doesn't exist)
    return false;
  };

  const handleContinue = async () => {
    if (!canSubmit || isLoading) return;

    setIsLoading(true);

    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email);
      
      if (emailExists) {
        Alert.alert(
          'Email Already Registered',
          'This email is already registered. Would you like to sign in instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sign In', 
              onPress: () => router.push('/(auth)/signIn') 
            },
          ]
        );
        return;
      }

      // Navigate to OTP verification for email confirmation
      router.push({
        pathname: '/(auth)/OtpVerification',
        params: {
          email,
          source: 'email',
          role: isCustomer ? 'customer' : 'business',
          method: 'email',
        },
      });

    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        'Unable to proceed with registration. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle size={16} color="#10B981" />
    ) : (
      <XCircle size={16} color="#EF4444" />
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Red Header with Bag Icon */}
      <View className="bg-secondary h-1/3 min-h-[250px] relative">
        <View className="flex-1 items-center justify-center">
          <Image
            source={images.onboarding}
            className="w-16 h-16"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bottom Curved White Section */}
      <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-8">
        {/* Title and Switch */}
        <View className="relative">
          {/* Back Arrow at top-left corner */}
          <TouchableOpacity
            className="absolute top-0 left-0 p-2 z-10"
            onPress={handleBack}
            disabled={isLoading}
          >
            <ArrowLeft size={28} color="#C62828" />
          </TouchableOpacity>

          <View className="mb-8 items-center">
            <Text className="text-2xl font-bold text-black mb-1">
              {isCustomer ? 'Register as Customer' : 'Register as Business'}
            </Text>

            <TouchableOpacity
              className="flex-row items-center mt-2"
              onPress={() => setIsCustomer(!isCustomer)}
              disabled={isLoading}
            >
              <Image 
                source={images.switchIcon} 
                className="w-6 h-6 mr-2" 
                resizeMode="contain"
              />
              <Text className="text-lg text-gray-400 font-medium underline">
                {isCustomer ? 'Switch to Business' : 'Switch to Customer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View className="mb-6">
          {/* Email Field */}
          <View className="mb-6">
            <Text className="text-gray-600 text-sm mb-1">Email</Text>
            <TextInput
              className={`bg-gray-100 rounded-xl px-4 py-4 text-base border ${
                emailError && email.trim() ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Enter your email"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
            {emailError && email.trim() ? (
              <Text className="text-red-500 text-xs mt-1 ml-1">{emailError}</Text>
            ) : null}
          </View>

          {/* Password Field */}
          <View className="mb-6">
            <Text className="text-gray-600 text-sm mb-1">Create Password</Text>
            <View className="relative">
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-4 text-base pr-12 border border-gray-200"
                placeholder="Create a strong password"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={handlePasswordChange}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={24} color="#666" />
                ) : (
                  <Eye size={24} color="#666" />
                )}
              </TouchableOpacity>
            </View>

            {/* Password Requirements - Only show when password is not empty */}
            {password.length > 0 && (
              <View className="mt-4 space-y-2">
                <View className="flex-row items-center">
                  {renderValidationIcon(passwordValidations.minLength)}
                  <Text className={`ml-2 text-sm ${
                    passwordValidations.minLength ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    At least 8 characters
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  {renderValidationIcon(passwordValidations.hasUpperCase)}
                  <Text className={`ml-2 text-sm ${
                    passwordValidations.hasUpperCase ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    One uppercase letter
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  {renderValidationIcon(passwordValidations.hasLowerCase)}
                  <Text className={`ml-2 text-sm ${
                    passwordValidations.hasLowerCase ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    One lowercase letter
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  {renderValidationIcon(passwordValidations.hasNumbers)}
                  <Text className={`ml-2 text-sm ${
                    passwordValidations.hasNumbers ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    One number
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  {renderValidationIcon(passwordValidations.hasSpecialChar)}
                  <Text className={`ml-2 text-sm ${
                    passwordValidations.hasSpecialChar ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    One special character (!@#$%^&*)
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Terms and Conditions */}
        <View className="mb-6">
          <Text className="text-gray-500 text-xs text-center px-4">
            By continuing, you agree to our{' '}
            <Text className="text-secondary">Terms of Service</Text> and{' '}
            <Text className="text-secondary">Privacy Policy</Text>
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center mb-8 ${
            canSubmit && !isLoading ? 'bg-secondary' : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={!canSubmit || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className={`text-lg font-semibold ${
              canSubmit && !isLoading ? 'text-white' : 'text-gray-500'
            }`}>
              Continue
            </Text>
          )}
        </TouchableOpacity>

        {/* Divider - Optional */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500 text-sm">OR</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Login Link */}
        <View className="items-center pb-6">
          <TouchableOpacity onPress={handleSignIn} disabled={isLoading}>
            <Text className="text-gray-600 text-base text-center">
              Already have an account?{' '}
              <Text className="text-secondary font-semibold">Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RegisterForm;