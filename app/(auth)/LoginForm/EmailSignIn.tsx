import images from "@/constants/images";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/api/api";
import { endpoints } from "@/api/endpoints";
import { showToast } from "@/utils/toastHelper";
import { useAuth } from "@/context/AuthContext"; // ✅ import your auth hook

const EmailLoginScreen: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth(); // ✅ get login function from context

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid =
    email.trim() !== "" && email.includes("@") && password.trim() !== "";

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  const handleForgotPassword = () => {
    router.push("/forgotPassword");
  };

  const handleSignUp = () => {
    router.push("/signUp");
  };

  const handleLogin = async () => {
    if (!isFormValid || isLoading) return;

    setIsLoading(true);

    try {
      const response = await api.post(endpoints.emailLogin, {
        email: email.trim().toLowerCase(),
        password,
      });

      const { success, data, message } = response.data;

      if (!success) {
        showToast(message || "Login failed. Please try again.", "error");
        return;
      }

      const user = data.user;
      const tokens = data.tokens;

      if (!tokens?.access || !user?.role) {
        showToast("Invalid login response", "error");
        return;
      }

      // ✅ Store token and role in AuthContext
      await login(tokens.access, user.role);

      // ✅ Backend-driven routing based on role
      switch (user.role) {
        case "admin":
        case "superadmin":
          router.replace("/(admin)/home");
          break;

        case "vendor":
          router.replace("/(vendor)/dashboard");
          break;

        case "customer":
          router.replace("/(customer)/main");
          break;

        default:
          showToast("Unknown user role", "error");
          return;
      }

      showToast(message || t("welcome_back") || "Welcome back!", "success");
    } catch (error: any) {
      let errorMessage =
        t("login_failed_message") || "Login failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast(String(errorMessage), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-[#C62828] h-1/3 min-h-[250px]">
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
          <TouchableOpacity
            onPress={handleBack}
            className="absolute top-0 left-0 p-2 z-10"
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={28} color="#C62828" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-2xl font-bold text-black mb-2">
              {t("login") || "Login"}
            </Text>
          </View>
        </View>

        {/* Form */}
        <View className="mb-8">
          <Text className="text-gray-700 text-base mb-2">
            {t("email") || "Email"}
          </Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-4 text-base border-b-2 border-[#C62828]"
            placeholder={t("enter_your_email") || "Enter your email"}
            placeholderTextColor="#444"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <Text className="text-gray-700 text-base mt-6 mb-2">
            {t("password") || "Password"}
          </Text>
          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 text-base pr-12 border-b-2 border-[#C62828]"
              placeholder={t("enter_password") || "Enter password"}
              placeholderTextColor="#444"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="items-end mt-3"
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <Text className="text-[#C62828] text-sm">
              {t("forgot_password") || "Forgot Password?"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          disabled={!isFormValid || isLoading}
          onPress={handleLogin}
          className={`rounded-full py-4 items-center mb-8 ${
            isFormValid && !isLoading ? "bg-[#C62828]" : "bg-gray-300"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              className={`text-lg font-semibold ${
                isFormValid && !isLoading ? "text-white" : "text-gray-600"
              }`}
            >
              {t("login") || "Login"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign Up */}
        <View className="items-center">
          <Text className="text-gray-600 text-base">
            {t("dont_have_account") || "Don't have an account?"}{" "}
            <Text
              className="text-[#C62828] font-semibold"
              onPress={!isLoading ? handleSignUp : undefined}
            >
              {t("sign_up") || "Sign Up"}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EmailLoginScreen;
