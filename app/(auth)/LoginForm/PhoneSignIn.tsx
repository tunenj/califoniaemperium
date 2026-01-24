// app/(auth)/LoginScreen.tsx
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
} from "react-native";
import { countries } from "@/data/countries";
import {
  validatePhoneNumber,
  formatPhoneNumber,
} from "@/utils/phoneValidation";
import { useLanguage } from '@/context/LanguageContext'; // Import hook

interface Country {
  value: string;
  label: string;
  code: string;
}

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage(); // Add hook

  const defaultCountry =
    countries.find(c => c.value === "canada") ?? countries[0];

  const [role, setRole] = useState<"vendor" | "customer">("vendor");
  const [selectedCountry, setSelectedCountry] =
    useState<Country>(defaultCountry);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  /* -------------------- HELPERS -------------------- */
  const getCleanCountryCode = useCallback(() => {
    return selectedCountry.code.replace(/\D/g, "");
  }, [selectedCountry.code]);

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

  /* -------------------- ACTIONS -------------------- */
  const handleLogin = () => {
    const errors: string[] = [];
    const cleanCode = getCleanCountryCode();

    if (!phoneNumber.trim()) {
      errors.push(t('phone_number_required'));
    } else {
      const validation = validatePhoneNumber(phoneNumber, cleanCode);
      if (!validation.isValid) {
        errors.push(validation.error || t('invalid_phone_number'));
      }
    }

    if (!password.trim()) {
      errors.push(t('password_required'));
    } else if (password.length < 6) {
      errors.push(t('password_min_length'));
    }

    if (errors.length) {
      Alert.alert(t('login_error'), errors.join("\n"));
      return;
    }

    if (role === "vendor") {
      router.replace("/(vendor)/dashboard");
    } else {
      router.replace("/(customer)/main");
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
    return `${t('login_as')} ${role === "vendor" ? t('business') : t('customer')}`;
  };

  const getSwitchText = () => {
    return `${t('switch_to')} ${role === "vendor" ? t('customer') : t('business')}`;
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
          >
            <Image source={images.switchIcon} className="w-5 h-5 mr-2" />
            <Text className="text-gray-500 underline">
              {getSwitchText()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phone */}
        <Text className="text-gray-700 mb-2">
          {t('phone_number')}
        </Text>
        <View
          className={`flex-row bg-gray-100 rounded-lg border-b-2 ${phoneError ? "border-red-500" : "border-[#C62828]"
            } mb-6`}
        >
          <TouchableOpacity
            className="px-3 py-4 border-r border-gray-200"
            style={{ width: 100 }}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text className="font-medium">{selectedCountry.code}</Text>
          </TouchableOpacity>

          <TextInput
            className="flex-1 px-3 py-4"
            placeholder={t('enter_phone_number')}
            placeholderTextColor="#9CA3AF"
            value={formattedPhoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="phone-pad"
          />
        </View>

        {/* Password */}
        <Text className="text-gray-700 mb-2">
          {t('password')}
        </Text>
        <View className="relative mb-4">
          <TextInput
            secureTextEntry={!showPassword}
            placeholder={t('enter_password')}
            placeholderTextColor="#9CA3AF"
            className="bg-gray-100 rounded-lg px-4 py-4 pr-12 border-b-2 border-[#C62828]"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowPassword(!showPassword)}
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
          disabled={!isFormValid}
          onPress={handleLogin}
          className={`rounded-full py-4 items-center mb-8 ${isFormValid ? "bg-[#C62828]" : "bg-gray-300"
            }`}
        >
          <Text className="text-white font-semibold text-lg">
            {t('login')}
          </Text>
        </TouchableOpacity>
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
              {t('select_country')}
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