import images from "@/constants/images";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLanguage } from '@/context/LanguageContext'; // Import hook

const ADMIN_EMAIL = "yakubyusuf6@gmail.com";

const EmailLoginScreen: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage(); // Add hook

  // Roles: Vendor or Customer
  const [role, setRole] = useState<"vendor" | "customer">("vendor");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Admin detection (frontend demo)
  const isAdmin = email.trim().toLowerCase() === ADMIN_EMAIL;

  // Validate form
  const isFormValid =
    email.trim() !== "" && email.includes("@") && password.trim() !== "";

  // Handlers
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleSwitchRole = () => {
    setRole((prev) => (prev === "vendor" ? "customer" : "vendor"));
  };

  const handleForgotPassword = () => {
    router.push("/forgotPassword");
  };

  const handleSignUp = () => {
    router.push("/signUp");
  };

  const handleLogin = () => {
    if (!isFormValid) return;

    console.log("Login Attempt:", {
      email,
      role,
      isAdmin,
    });

    // ADMIN
    if (isAdmin) {
      router.replace("/(admin)/home");
      return;
    }

    // VENDOR
    if (role === "vendor") {
      router.replace("/(vendor)/dashboard");
      return;
    }

    // CUSTOMER
    router.replace("/(customer)/main");
  };

  // Helper function to get login title
  const getLoginTitle = () => {
    if (isAdmin) {
      return t('admin_login');
    }
    return `${t('login_as')} ${role === "vendor" ? t('business') : t('customer')}`;
  };

  // Helper function to get switch text
  const getSwitchText = () => {
    return `${t('switch_to')} ${role === "vendor" ? t('customer') : t('business')}`;
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Header */}
      <View className="bg-[#C62828] h-1/3 min-h-[250px]">
        <View className="flex-1 items-center justify-center pt-12">
          <Image
            source={images.onboarding}
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bottom Section */}
      <View className="flex-1 bg-white -mt-12 rounded-t-3xl px-8 pt-8">
        {/* Back + Title */}
        <View className="relative mb-8">
          <TouchableOpacity
            onPress={handleBack}
            className="absolute top-0 left-0 p-2 z-10"
          >
            <Ionicons name="arrow-back" size={28} color="#C62828" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-2xl font-bold text-black mb-2">
              {getLoginTitle()}
            </Text>

            {/* Hide role switch for admin */}
            {!isAdmin && (
              <TouchableOpacity
                className="flex-row items-center"
                onPress={handleSwitchRole}
              >
                <Image
                  source={images.switchIcon}
                  className="w-5 h-5 mr-2"
                  resizeMode="contain"
                />
                <Text className="text-base text-gray-500 underline">
                  {getSwitchText()}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form */}
        <View className="mb-8">
          {/* Email */}
          <Text className="text-gray-700 text-base mb-2">
            {t('email')}
          </Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-4 text-base border-b-2 border-[#C62828]"
            placeholder={t('enter_your_email')}
            placeholderTextColor="#444"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <Text className="text-gray-700 text-base mt-6 mb-2">
            {t('password')}
          </Text>
          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 text-base pr-12 border-b-2 border-[#C62828]"
              placeholder={t('enter_password')}
              placeholderTextColor="#444"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Ionicons name="eye-off-outline" size={24} color="#999" />
              ) : (
                <Ionicons name="eye-outline" size={24} color="#999" />
              )}
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            className="items-end mt-3"
            onPress={handleForgotPassword}
          >
            <Text className="text-[#C62828] text-sm">
              {t('forgot_password')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          disabled={!isFormValid}
          onPress={handleLogin}
          className={`rounded-full py-4 items-center mb-8 ${
            isFormValid ? "bg-[#C62828]" : "bg-gray-300"
          }`}
        >
          <Text
            className={`text-lg font-semibold ${
              isFormValid ? "text-white" : "text-gray-600"
            }`}
          >
            {t('login')}
          </Text>
        </TouchableOpacity>

        {/* Sign Up */}
        <View className="items-center">
          <Text className="text-gray-600 text-base">
            {t('dont_have_account')}{" "}
            <Text
              className="text-[#C62828] font-semibold"
              onPress={handleSignUp}
            >
              {t('sign_up')}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EmailLoginScreen;