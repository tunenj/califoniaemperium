import images from "@/constants/images";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

<<<<<<< HEAD
const EmailLoginScreen: React.FC = () => {
  const router = useRouter();

  // Roles: Business (Vendor) or Customer
  const [role, setRole] = useState<"vendor" | "customer">("vendor");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validate form: email must contain '@' and password not empty
  const isFormValid =
    email.trim() !== "" && email.includes("@") && password.trim() !== "";

  // Handlers
  const handleBack = () => router.back();

  const handleSwitchRole = () => {
    setRole((prev) => (prev === "vendor" ? "customer" : "vendor"));
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgotPassword");
  };

  const handleSignUp = () => {
    router.push("/(auth)/signUp");
  };

  const handleLogin = () => {
    console.log("Login Attempt:", {
      role,
      email,
      password,
    });

    if (role === "vendor") {
      router.replace("/(vendor)/home");
    } else {
      router.replace("/(customer)/home");
    }
=======
const BusinessLoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isBusiness, setIsBusiness] = useState(true); // true for Business, false for Customer

  // Compute form filled AFTER declaring email and password
  const isFormFilled =
    email.trim() !== "" && email.includes("@") && password.trim() !== "";
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSwitch = () => {
    setIsBusiness(!isBusiness);
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    router.push("/(auth)/forgotPassword");
  };

  const handleLogin = () => {
    // Handle login logic here
    // For now, just navigate or log
    console.log("Logging in as", isBusiness ? "Business" : "Customer");
  };

  const handleSignUp = () => {
    // Navigate to sign up / register screen
    router.push("/(auth)/signUp"); // Adjust path as needed
>>>>>>> origin/main
  };

  return (
    <View className="flex-1 bg-white">
<<<<<<< HEAD
      {/* Top Red Header */}
      <View className="bg-[#C62828] h-1/3 min-h-[250px] relative">
        <View className="flex-1 items-center justify-center pt-12">
          <Image
            source={images.onboarding}
=======
      {/* Top Red Header with Bag Icon */}
      <View className="bg-[#C62828] h-1/3 min-h-[250px] relative">
        <View className="flex-1 items-center justify-center pt-12">
          <Image
            source={images.onboarding} // Assuming this is your shopping bag icon
>>>>>>> origin/main
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>
      </View>

<<<<<<< HEAD
      {/* Bottom White Section */}
      <View className="flex-1 bg-white -mt-12 rounded-t-3xl px-8 pt-8">
        {/* Back + Title */}
        <View className="relative mb-8">
          <TouchableOpacity
            onPress={handleBack}
            className="absolute top-0 left-0 p-2 z-10"
=======
      {/* Bottom White Section (slightly overlapping) */}
      <View className="flex-1 bg-white -mt-12 rounded-t-3xl px-8 pt-8">
        {/* Back Arrow and Title Section */}
        <View className="relative mb-8">
          {/* Back Arrow */}
          <TouchableOpacity
            className="absolute top-0 left-0 p-2 z-10"
            onPress={handleBack}
>>>>>>> origin/main
          >
            <ArrowLeft size={28} color="#C62828" />
          </TouchableOpacity>

<<<<<<< HEAD
          <View className="items-center">
            <Text className="text-2xl font-bold text-black mb-2">
              Login as {role === "vendor" ? "Business" : "Customer"}
=======
          {/* Title and Switch */}
          <View className="items-center">
            <Text className="text-2xl font-bold text-black mb-2">
              Log in as {isBusiness ? "Business" : "Customer"}
>>>>>>> origin/main
            </Text>

            <TouchableOpacity
              className="flex-row items-center"
<<<<<<< HEAD
              onPress={handleSwitchRole}
=======
              onPress={handleSwitch}
>>>>>>> origin/main
            >
              <Image
                source={images.switchIcon}
                className="w-5 h-5 mr-2"
                resizeMode="contain"
              />
              <Text className="text-base text-gray-500 underline">
<<<<<<< HEAD
                Switch to {role === "vendor" ? "Customer" : "Business"}
=======
                Switch to {isBusiness ? "customer" : "Business"}
>>>>>>> origin/main
              </Text>
            </TouchableOpacity>
          </View>
        </View>

<<<<<<< HEAD
        {/* Form */}
=======
        {/* Form Fields */}
>>>>>>> origin/main
        <View className="mb-8">
          {/* Email */}
          <Text className="text-gray-700 text-base mb-2">Email</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-4 text-base border-b-2 border-[#C62828]"
            placeholder="Enter your email"
<<<<<<< HEAD
            placeholderTextColor="#444"
=======
            placeholderTextColor="black"
>>>>>>> origin/main
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <Text className="text-gray-700 text-base mt-6 mb-2">Password</Text>
          <View className="relative">
            <TextInput
<<<<<<< HEAD
              className="bg-gray-100 rounded-lg px-4 py-4 text-base pr-12 border-b-2 border-[#C62828]"
              placeholder="Enter Password"
              placeholderTextColor="#444"
=======
              className="bg-gray-100 rounded-lg px-4 py-4 text-base pr-12 border-b-2 border-secondary"
              placeholder="Enter Password"
              placeholderTextColor="black"
>>>>>>> origin/main
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setShowPassword(!showPassword)}
            >
<<<<<<< HEAD
              {showPassword ? <EyeOff size={24} color="#999" /> : <Eye size={24} color="#999" />}
=======
              {showPassword ? (
                <EyeOff size={24} color="#999" />
              ) : (
                <Eye size={24} color="#999" />
              )}
>>>>>>> origin/main
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
<<<<<<< HEAD
          <TouchableOpacity className="items-end mt-3" onPress={handleForgotPassword}>
=======
          <TouchableOpacity
            className="items-end mt-3"
            onPress={handleForgotPassword}
          >
>>>>>>> origin/main
            <Text className="text-[#C62828] text-sm">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
<<<<<<< HEAD
          disabled={!isFormValid}
          onPress={handleLogin}
          className={`rounded-full py-4 items-center mb-8 ${
            isFormValid ? "bg-[#C62828]" : "bg-gray-300"
          }`}
        >
          <Text
            className={`text-lg font-semibold ${isFormValid ? "text-white" : "text-gray-600"}`}
=======
          className={`rounded-full py-4 items-center mb-8 ${
            isFormFilled ? "bg-red-600 opacity-100" : "bg-gray-300 opacity-80"
          }`}
          onPress={handleLogin}
          disabled={!isFormFilled}
        >
          <Text
            className={`text-lg font-semibold ${
              isFormFilled ? "text-white" : "text-gray-500"
            }`}
>>>>>>> origin/main
          >
            Login
          </Text>
        </TouchableOpacity>

<<<<<<< HEAD
        {/* Sign Up */}
        <View className="items-center">
          <Text className="text-gray-600 text-base">
            Don't have an account?{" "}
            <Text className="text-[#C62828] font-semibold" onPress={handleSignUp}>
              Sign Up
=======
        {/* Sign Up Link */}
        <View className="items-center">
          <Text className="text-gray-600 text-base">
            Don&apos;t have an account?{" "}
            <Text
              className="text-[#C62828] font-semibold"
              onPress={handleSignUp}
            >
              Sign up
>>>>>>> origin/main
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

<<<<<<< HEAD
export default EmailLoginScreen;
=======
export default BusinessLoginScreen;
>>>>>>> origin/main
