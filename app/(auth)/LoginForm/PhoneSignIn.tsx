import images from "@/constants/images";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  Alert,
  BackHandler,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { countries } from "@/data/countries";
import {
  validatePhoneNumber,
  formatPhoneNumber,
} from "@/utils/phoneValidation";
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

interface Country {
  value: string;
  label: string;
  code: string;
}

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const defaultCountry =
    countries.find(c => c.value === "canada") ?? countries[0];

  const [role, setRole] = useState<"vendor" | "customer">("vendor");
  const [selectedCountry, setSelectedCountry] =
    useState<Country>(defaultCountry);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  /* -------------------- HELPERS -------------------- */
  const getCleanCountryCode = useCallback(() => {
    return selectedCountry.code.replace(/\D/g, "");
  }, [selectedCountry.code]);

  const getFullPhoneNumber = useCallback(() => {
    const cleanCode = getCleanCountryCode();
    return cleanCode + phoneNumber;
  }, [phoneNumber, getCleanCountryCode]);

  /* -------------------- PHONE -------------------- */
  const handlePhoneNumberChange = useCallback(
    (text: string) => {
      const digitsOnly = text.replace(/\D/g, "");
      const cleanCode = getCleanCountryCode();

      setPhoneNumber(digitsOnly);
      setFormattedPhoneNumber(
        formatPhoneNumber(digitsOnly, cleanCode)
      );

      if (phoneError) setPhoneError("");
    },
    [getCleanCountryCode, phoneError]
  );

  useEffect(() => {
    if (!phoneNumber) return;

    const cleanCode = getCleanCountryCode();
    const validation = validatePhoneNumber(phoneNumber, cleanCode);

    if (!validation.isValid && validation.error) {
      setPhoneError(validation.error);
    } else {
      setPhoneError("");
      setFormattedPhoneNumber(
        formatPhoneNumber(phoneNumber, cleanCode)
      );
    }
  }, [phoneNumber, getCleanCountryCode]);

  /* -------------------- PASSWORD -------------------- */
  useEffect(() => {
    if (passwordError && password.length > 0) {
      setPasswordError("");
    }
  }, [password, passwordError]);

  const isFormValid =
    phoneNumber.trim() !== "" &&
    password.trim() !== "" &&
    !phoneError;

  /* -------------------- API LOGIN -------------------- */
  const handleLogin = async () => {
    const errors: string[] = [];
    const cleanCode = getCleanCountryCode();

    // Validation
    if (!phoneNumber.trim()) {
      errors.push(t('phone_number_required') || "Phone number is required");
    } else {
      const validation = validatePhoneNumber(phoneNumber, cleanCode);
      if (!validation.isValid) {
        errors.push(validation.error || t('invalid_phone_number') || "Invalid phone number");
      }
    }

    if (!password.trim()) {
      errors.push(t('password_required') || "Password is required");
    } else if (password.length < 6) {
      errors.push(t('password_min_length') || "Password must be at least 6 characters");
    }

    if (errors.length) {
      Alert.alert(
        t('login_error') || "Login Error", 
        errors.join("\n")
      );
      return;
    }

    setIsLoading(true);

    try {
      const fullPhoneNumber = getFullPhoneNumber();
      
      console.log("Phone login attempt:", {
        phone: fullPhoneNumber,
        role: role === "vendor" ? "business" : "customer"
      });

      const requestBody = {
        phone: fullPhoneNumber, // Send full international number
        password: password,
        role: role === "vendor" ? "business" : "customer", // Map to backend role names
      };

      const response = await api.post(endpoints.phoneLogin, requestBody);

      console.log("Phone login response:", {
        status: response.status,
        data: response.data,
      });

      // Check if login was successful
      const isSuccessful =
        response.status === 200 ||
        response.status === 201 ||
        response.data?.success === true ||
        response.data?.status === "success" ||
        response.data?.access_token ||
        response.data?.token ||
        response.data?.message?.toLowerCase().includes('success') ||
        response.data?.message?.toLowerCase().includes('logged in');

      if (isSuccessful) {
        // Extract user data from response
        const userData = response.data?.data || response.data?.user || response.data;
        const accessToken = response.data?.access_token || response.data?.token;
        
        // Store token if available
        if (accessToken) {
          // Example: await AsyncStorage.setItem('accessToken', accessToken);
          console.log("Access token received:", accessToken);
        }

        // Extract role from response if available
        const userRole = userData?.role || role;

        // Navigate based on role
        if (userRole === "admin" || userRole === "superadmin") {
          router.replace("/(admin)/home");
        } else if (userRole === "vendor" || userRole === "business") {
          router.replace("/(vendor)/dashboard");
        } else if (userRole === "customer" || userRole === "user") {
          router.replace("/(customer)/main");
        } else {
          // Fallback based on selected role
          if (role === "vendor") {
            router.replace("/(vendor)/dashboard");
          } else {
            router.replace("/(customer)/main");
          }
        }

        // Show success message
        Alert.alert(
          t('login_successful') || "Login Successful",
          response.data?.message || t('welcome_back') || "Welcome back!",
          [{ text: "OK" }]
        );
      } else {
        // Handle unsuccessful login
        const errorMessage = response.data?.message || 
                           response.data?.error || 
                           t('login_failed_message') || 
                           "Login failed. Please check your credentials.";
        
        Alert.alert(
          t('login_failed') || "Login Failed",
          errorMessage
        );
      }
    } catch (error: any) {
      console.error("Phone login error details:", {
        error: error,
        response: error.response,
        message: error.message
      });

      let errorMessage = t('login_failed_message') || "An error occurred. Please try again.";
      
      if (error.response?.status === 400 || error.response?.status === 401) {
        errorMessage = error.response?.data?.message || 
                      error.response?.data?.error || 
                      "Invalid phone number or password.";
      } else if (error.response?.status === 404) {
        errorMessage = t('account_not_found') || "Account not found. Please sign up first.";
      } else if (error.response?.status === 422) {
        // Validation errors
        const validationErrors = error.response?.data?.errors || {};
        if (validationErrors.phone) {
          errorMessage = Array.isArray(validationErrors.phone) 
            ? validationErrors.phone[0] 
            : validationErrors.phone;
        } else if (validationErrors.password) {
          errorMessage = Array.isArray(validationErrors.password) 
            ? validationErrors.password[0] 
            : validationErrors.password;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Check if user needs verification
      const errorText = errorMessage.toLowerCase();
      if (errorText.includes('verify') || errorText.includes('not verified')) {
        Alert.alert(
          t('verification_required') || "Verification Required",
          errorMessage,
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Verify", 
              onPress: () => {
                const fullPhoneNumber = getFullPhoneNumber();
                router.push({
                  pathname: '/OtpVerification',
                  params: {
                    phone: fullPhoneNumber,
                    source: 'phone',
                    method: 'phone',
                    countryCode: selectedCountry.code,
                  },
                });
              }
            }
          ]
        );
      } else if (errorText.includes('not found') || errorText.includes('no account')) {
        // Account not found - suggest sign up
        Alert.alert(
          t('account_not_found') || "Account Not Found",
          errorMessage,
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Sign Up", 
              onPress: () => router.push("/signUp")
            }
          ]
        );
      } else {
        Alert.alert(
          t('login_failed') || "Login Failed",
          errorMessage
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  /* -------------------- ANDROID BACK -------------------- */
  useEffect(() => {
    const backAction = () => {
      if (showCountryPicker) {
        setShowCountryPicker(false);
        return true;
      }
      return false;
    };

    const handler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => handler.remove();
  }, [showCountryPicker]);

  // Helper functions for translated text
  const getLoginTitle = () => {
    return `${t('login_as') || "Login as"} ${role === "vendor" ? t('business') || "Business" : t('customer') || "Customer"}`;
  };

  const getSwitchText = () => {
    return `${t('switch_to') || "Switch to"} ${role === "vendor" ? t('customer') || "Customer" : t('business') || "Business"}`;
  };

  /* -------------------- UI -------------------- */
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-[#C62828] h-1/3 min-h-[250px] items-center justify-center">
        <Image
          source={images.onboarding}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View className="flex-1 bg-white -mt-12 rounded-t-3xl px-8 pt-8">
        {/* Back */}
        <TouchableOpacity
          className="absolute top-4 left-4 z-10"
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={28} color="#C62828" />
        </TouchableOpacity>

        {/* Title */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-bold mb-2">
            {getLoginTitle()}
          </Text>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() =>
              setRole(role === "vendor" ? "customer" : "vendor")
            }
            disabled={isLoading}
          >
            <Image source={images.switchIcon} className="w-5 h-5 mr-2" />
            <Text className="text-gray-500 underline">
              {getSwitchText()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phone */}
        <Text className="text-gray-700 mb-2">
          {t('phone_number') || "Phone Number"}
        </Text>
        <View
          className={`flex-row bg-gray-100 rounded-lg border-b-2 ${phoneError ? "border-red-500" : "border-[#C62828]"
            } mb-6`}
        >
          <TouchableOpacity
            className="px-3 py-4 border-r border-gray-200"
            style={{ width: 100 }}
            onPress={() => setShowCountryPicker(true)}
            disabled={isLoading}
          >
            <Text className="font-medium">{selectedCountry.code}</Text>
          </TouchableOpacity>

          <TextInput
            className="flex-1 px-3 py-4"
            placeholder={t('enter_phone_number') || "Enter phone number"}
            placeholderTextColor="#9CA3AF"
            value={formattedPhoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>
        {phoneError ? (
          <Text className="text-red-500 text-xs mb-2">{phoneError}</Text>
        ) : null}

        {/* Password */}
        <Text className="text-gray-700 mb-2">
          {t('password') || "Password"}
        </Text>
        <View className="relative mb-4">
          <TextInput
            secureTextEntry={!showPassword}
            placeholder={t('enter_password') || "Enter password"}
            placeholderTextColor="#9CA3AF"
            className="bg-gray-100 rounded-lg px-4 py-4 pr-12 border-b-2 border-[#C62828]"
            value={password}
            onChangeText={setPassword}
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

        {/* Login */}
        <TouchableOpacity
          disabled={!isFormValid || isLoading}
          onPress={handleLogin}
          className={`rounded-full py-4 items-center mb-8 ${isFormValid && !isLoading ? "bg-[#C62828]" : "bg-gray-300"
            }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-lg">
              {t('login') || "Login"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="items-center mb-4">
          <TouchableOpacity
            onPress={() => router.push("/signUp")}
            disabled={isLoading}
          >
            <Text className="text-gray-600 text-base">
              {t('dont_have_account') || "Don't have an account?"}{" "}
              <Text className="text-[#C62828] font-semibold">
                {t('sign_up') || "Sign Up"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <View className="items-center">
          <TouchableOpacity
            onPress={() => router.push("/forgotPassword")}
            disabled={isLoading}
          >
            <Text className="text-[#C62828] text-sm">
              {t('forgot_password') || "Forgot Password?"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Country Picker */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/30 justify-end"
          onPress={() => setShowCountryPicker(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-6 max-h-[70%]"
            onPressIn={() => { }}
          >
            <Text className="text-xl font-semibold mb-4">
              {t('select_country') || "Select Country"}
            </Text>

            <FlatList
              data={countries}
              keyExtractor={item => `${item.value}-${item.code}`}
              initialNumToRender={20}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-4 border-b border-gray-100 flex-row justify-between"
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text>{item.label}</Text>
                  <Text className="text-gray-500">{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default LoginScreen;