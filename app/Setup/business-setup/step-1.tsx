import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AnimatedStep from "@/components/AnimatedStep";
import StepIndicator from "@/components/StepIndicator";
import { useSetup } from "@/context/SetupContext";
import { countries } from "@/data/countries";
import { useLanguage } from "@/context/LanguageContext"; // Add import

export default function Step1() {
  const router = useRouter();
  const { data, update } = useSetup();
  const { t } = useLanguage(); // Add hook

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const fullName =
    data.fullName ||
    `${data.firstName || ""} ${data.lastName || ""}`.trim();

  const selectedCountry =
    countries.find((c) => c.code === data.countryCode) ||
    countries.find((c) => c.code === "+234");

  const isValid =
    Boolean(fullName) &&
    Boolean(data.gender) &&
    Boolean(data.email) &&
    Boolean(data.phone) &&
    Boolean(data.address);

  const genders = [
    { label: t('male'), value: "male" },
    { label: t('female'), value: "female" },
  ];

  // Get translated country names
  const getTranslatedCountry = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (!country) return { label: countryCode, code: countryCode };
    
    // You can add language-specific country names here
    // For now, using the English label
    return country;
  };

  return (
    <AnimatedStep>
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 pt-4 flex-1">
          {/* Header */}
          <View className="mb-4">
            <View className="w-20 h-20 items-center justify-center mx-auto mb-4">
              <Image
                source={require("@/assets/images/icon.png")}
                className="w-24 h-24"
                resizeMode="contain"
              />
            </View>

            {/* Back Arrow + Welcome */}
            <View className="flex-row items-center justify-center relative">
              <TouchableOpacity
                onPress={() => router.back()}
                className="absolute left-0 p-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={22} color="#000" />
              </TouchableOpacity>

              <Text className="font-semibold text-base">
                {t('welcome_user', { name: data.firstName || t('user') })}
              </Text>
            </View>

            <Text className="text-xs text-gray-400 mt-1 text-center">
              {t('setup_business_profile')}
            </Text>
          </View>

          {/* Step Indicator */}
          <StepIndicator totalSteps={3} currentStep={1} />

          {/* Section Title */}
          <Text className="font-medium text-black mb-4">
            {t('personal_details')}
          </Text>

          {/* Full Name */}
          <Text className="text-xs text-black mb-1">
            {t('full_name')}
          </Text>
          <TextInput
            value={fullName}
            onChangeText={(v) => update({ fullName: v })}
            placeholder={t('enter_full_name')}
            className="border-b py-2 mb-4 text-gray-700"
          />

          {/* Gender Dropdown */}
          <Text className="text-xs text-gray-400 mb-1">
            {t('gender')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowGenderPicker(true)}
            className="border-b py-2 mb-4"
          >
            <Text className={data.gender ? "text-black" : "text-gray-400"}>
              {data.gender
                ? t(data.gender)
                : t('select_from_list')}
            </Text>
          </TouchableOpacity>

          {/* Email */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-400 mb-1">
              {t('email')}
            </Text>
            <TouchableOpacity onPress={() => {/* Add change email logic */}}>
              <Text className="text-xs text-red-600">
                {t('change')}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={data.email || ""}
            onChangeText={(v) => update({ email: v })}
            placeholder={t('enter_email')}
            keyboardType="email-address"
            autoCapitalize="none"
            className="border-b py-2 mb-4"
          />

          {/* Phone Number */}
          <Text className="text-xs text-gray-400 mb-1">
            {t('phone_number')}
          </Text>
          <View className="flex-row border-b items-center mb-4">
            <TouchableOpacity
              className="px-3 py-4 border-r border-gray-200"
              style={{ width: 100 }}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text className="text-base font-medium">
                {selectedCountry?.code || "+234"}
              </Text>
            </TouchableOpacity>

            <TextInput
              placeholder={t('enter_phone_number')}
              value={data.phone || ""}
              onChangeText={(v) =>
                update({
                  phone: v,
                  countryCode: selectedCountry?.code || "+234",
                })
              }
              keyboardType="phone-pad"
              className="flex-1 px-3 py-4"
            />
          </View>

          {/* Address */}
          <Text className="text-xs text-gray-400 mb-1">
            {t('residential_address')}
          </Text>
          <TextInput
            placeholder={t('enter_address')}
            value={data.address || ""}
            onChangeText={(v) => update({ address: v })}
            className="border-b py-2"
          />

          {/* Next Button */}
          <TouchableOpacity
            disabled={!isValid}
            onPress={() => router.push("/Setup/business-setup/step-2")}
            className={`mt-10 py-4 rounded-lg items-center ${
              isValid ? "bg-red-600" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-medium">
              {t('next')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Country Picker Modal */}
        <Modal visible={showCountryPicker} animationType="slide" transparent={true}>
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">
                {t('select_country')}
              </Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={countries}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between"
                  onPress={() => {
                    update({ countryCode: item.code });
                    setShowCountryPicker(false);
                  }}
                >
                  <Text className="text-base">
                    {item.label} ({item.code})
                  </Text>
                  {selectedCountry?.code === item.code && (
                    <Ionicons name="checkmark" size={20} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Modal>

        {/* Gender Picker Modal */}
        <Modal visible={showGenderPicker} animationType="slide" transparent={true}>
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">
                {t('select_gender')}
              </Text>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={genders}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between"
                  onPress={() => {
                    update({ gender: item.value });
                    setShowGenderPicker(false);
                  }}
                >
                  <Text className="text-base">
                    {item.label}
                  </Text>
                  {data.gender === item.value && (
                    <Ionicons name="checkmark" size={20} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </AnimatedStep>
  );
}