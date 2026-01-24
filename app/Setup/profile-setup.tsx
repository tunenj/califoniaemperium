import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { ArrowLeft, ChevronDown, Pencil, User } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/context/LanguageContext"; // Add import

const CustomerProfileSetup: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage(); // Add hook

  /** Helper to get string value from params */
  const getParamString = (param: any): string => {
    if (!param) return "";
    return Array.isArray(param) ? param[0] || "" : param;
  };

  // Get registered user data
  const firstName = getParamString(params.firstName) || t('user');
  const lastName = getParamString(params.lastName) || "";
  const registeredEmail =
    getParamString(params.email) || "viviancooker@gmail.com";
  const phoneNumber = getParamString(params.phoneNumber) || "";

  const fullName = `${firstName} ${lastName}`.trim() || t('vivian_cooker');

  const [profileName, setProfileName] = useState(fullName);
  const [gender, setGender] = useState<string | null>(null);
  const [email, setEmail] = useState(registeredEmail);
  const [phone, setPhone] = useState(phoneNumber || "");
  const [address, setAddress] = useState("");
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState(registeredEmail);

  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
    setShowGenderModal(false);
  };

  const handleUpdateEmail = () => {
    if (newEmail.trim() === "") {
      Alert.alert(t('error'), t('email_cannot_be_empty'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert(t('invalid_email'), t('enter_valid_email'));
      return;
    }

    setEmail(newEmail);
    setShowEmailModal(false);
    Alert.alert(t('success'), t('email_updated_successfully'));
  };

  const genderOptions = [t('female'), t('male')];

  /* ONLY ADDITION: check if form is complete */
  const isFormComplete = useMemo(() => {
    return (
      profileName.trim() !== "" &&
      gender !== null &&
      phone.trim() !== "" &&
      address.trim() !== ""
    );
  }, [profileName, gender, phone, address]);

  return (
    <View className="flex-1 bg-white px-6 pt-8">
      {/* Top Bar */}
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={30} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View className="items-center">
        <View className="w-20 h-20 items-center justify-center mb-4">
          <Image
            source={require("@/assets/images/icon.png")}
            className="w-24 h-24"
            resizeMode="contain"
          />
        </View>

        <Text className="text-xl font-semibold text-black mb-1 text-center">
          {t('welcome_user', { name: firstName })}
        </Text>

        <Text className="text-gray-500 text-center">
          {t('setup_business_profile')}
        </Text>
      </View>

      {/* Section Title */}
      <View className="items-center">
        <View className="w-16 h-16 items-center justify-center mb-3">
          <User size={24} color="#9CA3AF" />
        </View>

        <Text className="text-lg font-semibold text-black">
          {t('personal_details')}
        </Text>

        <View className="h-[2px] bg-secondary w-20 mt-2" />
      </View>

      {/* Form */}
      <ScrollView className="space-y-5" showsVerticalScrollIndicator={false}>
        <View>
          <Text className="text-gray-500 text-sm mb-1">{t('full_name')}</Text>
          <TextInput
            value={profileName}
            onChangeText={setProfileName}
            className="border-b border-gray-300 py-3 text-base text-black"
          />
        </View>

        <View>
          <Text className="text-gray-500 text-sm mb-1">{t('gender')}</Text>
          <TouchableOpacity
            onPress={() => setShowGenderModal(true)}
            className="flex-row items-center justify-between border-b border-gray-300 py-3"
          >
            <Text
              className={`text-base ${gender ? "text-black" : "text-gray-400"
                }`}
            >
              {gender ?? t('select_from_list')}
            </Text>
            <ChevronDown size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-500 text-sm">{t('email')}</Text>
            <TouchableOpacity onPress={() => setShowEmailModal(true)}>
              <Text className="text-secondary text-sm">
                <Pencil size={14} color="#C62828" /> {t('change')}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={email}
            editable={false}
            className="border-b border-gray-300 py-3 text-base text-black"
          />
        </View>

        <View>
          <Text className="text-gray-500 text-sm mb-1">{t('phone_number')}</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder={t('enter_phone_number')}
            placeholderTextColor="#9CA3AF"
            className="border-b border-gray-300 py-3 text-base text-black"
          />
        </View>

        <View>
          <Text className="text-gray-500 text-sm mb-1">{t('billing_address')}</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder={t('enter_address')}
            placeholderTextColor="#9CA3AF"
            className="border-b border-gray-300 py-3 text-base text-black"
          />
        </View>
      </ScrollView>

      {/* Next Button (ONLY LOGIC CHANGED) */}
      <View className="mb-40">
        <TouchableOpacity
          disabled={!isFormComplete}
          onPress={() => {
            if (isFormComplete) {
              router.push("/Setup/successScreen");
            }
          }}
          className={`py-4 rounded-xl items-center ${isFormComplete ? "bg-secondary" : "bg-gray-200"
            }`}
        >
          <Text
            className={`text-lg font-semibold ${isFormComplete ? "text-white" : "text-gray-400"
              }`}
          >
            {t('next')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gender Modal */}
      <Modal visible={showGenderModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-6 text-center">
              {t('select_gender')}
            </Text>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                className="py-4 px-4 rounded-lg bg-gray-50 mb-2"
                onPress={() => handleGenderSelect(option)}
              >
                <Text className="text-lg text-center">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Email Modal */}
      <Modal visible={showEmailModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-4">{t('change_email')}</Text>

            <TextInput
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t('enter_new_email')}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
            />

            <TouchableOpacity
              className="py-4 rounded-lg bg-secondary"
              onPress={handleUpdateEmail}
            >
              <Text className="text-center text-white font-semibold">
                {t('update')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomerProfileSetup;