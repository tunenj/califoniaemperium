// app/(auth)/CreatePassword.tsx
import images from "@/constants/images";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

type UserRole = 'business' | 'customer';

const CreatePassword: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage(); // Add hook

  // Helper function to get string value from params
  const getParamString = (param: any): string => {
    if (!param) return '';
    return Array.isArray(param) ? param[0] || '' : param;
  };

  // Extract ALL parameters properly
  const mode = getParamString(params.mode) || "create"; // 'create' | 'reset'
  const firstName = getParamString(params.firstName) || "User";
  const lastName = getParamString(params.lastName) || "";
  const email = getParamString(params.email) || "";
  const phoneNumber = getParamString(params.phoneNumber) || "";
  const method = getParamString(params.method) || "sms";
  const role = (getParamString(params.role) || 'business') as UserRole;
  const isCustomerParam = getParamString(params.isCustomer);

  // Determine the actual role
  const userRole: UserRole = role === 'customer' || isCustomerParam === 'true' ? 'customer' : 'business';

  const isCreate = mode === "create";
  const isReset = mode === "reset";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    setIsButtonEnabled(
      password.trim().length > 0 && confirmPassword.trim().length > 0
    );
  }, [password, confirmPassword]);

  const handleSubmit = useCallback(() => {
    if (!isButtonEnabled) return;

    if (password.length < 8) {
      Alert.alert(
        t('password_too_short_title') || 'Password Too Short',
        t('password_too_short_message') || 'Password must be at least 8 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        t('passwords_dont_match_title') || 'Passwords Don\'t Match',
        t('passwords_dont_match_message') || 'Please make sure both passwords match.'
      );
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
      Alert.alert(
        t('weak_password_title') || 'Weak Password',
        t('weak_password_message') || 'Password must contain uppercase, lowercase, number, and special character.'
      );
      return;
    }

    if (isReset) {
      router.replace("/PasswordChangedSuccess");
      return;
    }

    // Navigate to SuccessSetup with ALL parameters including role
    router.replace({
      pathname: "/SuccessSetup",
      params: {
        firstName,
        lastName,
        email,
        phoneNumber,
        role: userRole,
        isCustomer: userRole === 'customer' ? 'true' : 'false',
      },
    });
  }, [
    password, 
    confirmPassword, 
    isButtonEnabled, 
    isReset, 
    router, 
    firstName, 
    lastName, 
    email, 
    phoneNumber, 
    userRole,
    t
  ]);

  return (
    <View className="flex-1 bg-white">
      {/* Red Header */}
      <View className="bg-secondary h-1/3 min-h-[250px]">
        <View className="flex-1 items-center justify-center">
          <Image
            source={images.onboarding}
            className="w-16 h-16"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-10">
        <TouchableOpacity
          className="absolute left-4 top-4 z-10"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#C62828" />
        </TouchableOpacity>

        {/* Heading */}
        <Text className="text-2xl font-bold text-center mb-2">
          {isReset ? t('change_your_password') || 'Change Your Password' : `${t('welcome') || 'Welcome'}, ${firstName}`}
        </Text>

        {/* Subheading */}
        <Text className="text-gray-500 text-center mb-8">
          {isReset
            ? t('ensure_to_remember_password') || 'Ensure to remember your password.'
            : t('create_password_for_account') || 'Create a password for your account.'}
        </Text>

        {/* Password */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-2">
            {isReset ? t('create_new_password') || 'Create New Password' : t('create_password') || 'Create Password'}
          </Text>

          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 pr-12"
              placeholder={t('enter_password') || 'Enter password'}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FontAwesome name="eye-slash" size={22} color="#666" />
              ) : (
                <FontAwesome name="eye" size={22} color="#666" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View className="mb-8">
          <Text className="text-sm text-gray-600 mb-2">
            {t('re_enter_password') || 'Re-enter Password'}
          </Text>

          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 pr-12"
              placeholder={t('re_enter_password_placeholder') || 'Re-enter password'}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <FontAwesome name="eye-slash" size={22} color="#666" />
              ) : (
                <FontAwesome name="eye" size={22} color="#666" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${
            isButtonEnabled ? "bg-secondary" : "bg-gray-300"
          }`}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          <Text className="text-white text-lg font-semibold">
            {isReset 
              ? t('confirm_password_reset') || 'Confirm Password Reset'
              : t('create_password_button') || 'Create Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreatePassword;