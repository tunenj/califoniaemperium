// app/(auth)/BusinessRegisterForm.tsx
import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  // Check if all required fields are filled
  React.useEffect(() => {
    const isEnabled = email.trim() !== '' && password.trim() !== '';
    setIsButtonEnabled(isEnabled);
  }, [email, password]);

  const handleBack = () => {
    router.back();
  };

  const handleSignIn = () => {
    router.push('/(auth)/signIn');
  };

  const handleContinue = () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    // Password validation
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long');
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      Alert.alert(
        'Weak Password',
        'Password should contain at least:\n• One uppercase letter\n• One lowercase letter\n• One number\n• One special character'
      );
      return;
    }

    // Navigate to OTP verification for email confirmation
    router.push({
      pathname: '/(auth)/OtpVerification',
      params: {
        email,
        isCustomer: isCustomer.toString(),
        source: 'email', // Indicate this came from email registration
      },
    });
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

        {/* Name Fields */}
        <View className="mb-6">
          {/* Email Field */}
          <View className="mb-4">
            <Text className="text-gray-600 text-sm mb-1">Email</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-4 text-base border-b border-secondary"
              placeholder="Enter your email"
              placeholderTextColor="black"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Field */}
          <View className="mb-8">
            <Text className="text-gray-600 text-sm mb-1">Create Password</Text>
            <View className="relative">
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-4 text-base pr-12 border-b border-secondary"
                placeholder="Enter Password"
                placeholderTextColor="black"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={24} color="#666" />
                ) : (
                  <Eye size={24} color="#666" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center mb-8 ${isButtonEnabled ? 'bg-secondary' : 'bg-gray-300'}`}
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={!isButtonEnabled}
        >
          <Text className={`text-lg font-semibold ${isButtonEnabled ? 'text-white' : 'text-gray-500'}`}>
            Continue
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="items-center">
          <TouchableOpacity onPress={handleSignIn}>
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