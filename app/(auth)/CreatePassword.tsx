import images from "@/constants/images";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, ShoppingBag } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, Image } from "react-native";

const CreatePassword: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    mode = "create", // 'create' | 'reset'
    firstName = "User",
  } = params;

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
        "Password Too Short",
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Passwords Do Not Match",
        "Please make sure both passwords match."
      );
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
      Alert.alert(
        "Weak Password",
        "Password must include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (isReset) {
      router.replace("/(auth)/PasswordChangedSuccess");
      return;
    }

    router.replace("/(auth)/SuccessSetup");
  }, [password, confirmPassword, isButtonEnabled, isReset, router]);

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
          <ArrowLeft size={28} color="#C62828" />
        </TouchableOpacity>

        {/* Heading */}
        <Text className="text-2xl font-bold text-center mb-2">
          {isReset ? "Change your password" : `Welcome, ${firstName}`}
        </Text>

        {/* Subheading */}
        <Text className="text-gray-500 text-center mb-8">
          {isReset
            ? "Ensure to enter password you can remember"
            : "Create a password for your account"}
        </Text>

        {/* Password */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-2">
            {isReset ? "Create New Password" : "Create Password"}
          </Text>

          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 pr-12"
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View className="mb-8">
          <Text className="text-sm text-gray-600 mb-2">
            Re-enter New Password
          </Text>

          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 pr-12"
              placeholder="Re-enter password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
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
            {isReset ? "Confirm password reset" : "Create Password"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreatePassword;
