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


const CustomerProfileSetup: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  /** Helper to get string value from params */
  const getParamString = (param: any): string => {
    if (!param) return "";
    return Array.isArray(param) ? param[0] || "" : param;
  };

  // Get registered user data
  const firstName = getParamString(params.firstName) || "User";
  const lastName = getParamString(params.lastName) || "";
  const registeredEmail =
    getParamString(params.email) || "viviancooker@gmail.com";
  const phoneNumber = getParamString(params.phoneNumber) || "";

  const fullName = `${firstName} ${lastName}`.trim() || "Vivian Cooker";

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
      Alert.alert("Error", "Email cannot be empty");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setEmail(newEmail);
    setShowEmailModal(false);
    Alert.alert("Success", "Email updated successfully");
  };

  const genderOptions = ["Female", "Male", "Prefer not to say", "Other"];

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
          Welcome, {firstName}
        </Text>

        <Text className="text-gray-500 text-center">
          Set up your business profile
        </Text>
      </View>

      {/* Section Title */}
      <View className="items-center">
        <View className="w-16 h-16 items-center justify-center mb-3">
          <User size={24} color="#9CA3AF" />
        </View>

        <Text className="text-lg font-semibold text-black">
          Personal Details
        </Text>

        <View className="h-[2px] bg-secondary w-20 mt-2" />
      </View>

      {/* Form */}
      <ScrollView className="space-y-5" showsVerticalScrollIndicator={false}>
        <View>
          <Text className="text-gray-500 text-sm mb-1">Full Name</Text>
          <TextInput
            value={profileName}
            onChangeText={setProfileName}
            className="border-b border-gray-300 py-3 text-base text-black"
          />
        </View>

        <View>
          <Text className="text-gray-500 text-sm mb-1">Gender</Text>
          <TouchableOpacity
            onPress={() => setShowGenderModal(true)}
            className="flex-row items-center justify-between border-b border-gray-300 py-3"
          >
            <Text
              className={`text-base ${gender ? "text-black" : "text-gray-400"
                }`}
            >
              {gender ?? "Select from list"}
            </Text>
            <ChevronDown size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-500 text-sm">Email</Text>
            <TouchableOpacity onPress={() => setShowEmailModal(true)}>
              <Text className="text-secondary text-sm">
                <Pencil size={14} color="#C62828" /> Change
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
          <Text className="text-gray-500 text-sm mb-1">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Enter phone number"
            placeholderTextColor="#9CA3AF"
            className="border-b border-gray-300 py-3 text-base text-black"
          />
        </View>

        <View>
          <Text className="text-gray-500 text-sm mb-1">Billing Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
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
            Next
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gender Modal */}
      <Modal visible={showGenderModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-6 text-center">
              Select Gender
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
            <Text className="text-xl font-bold mb-4">Change Email</Text>

            <TextInput
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
            />

            <TouchableOpacity
              className="py-4 rounded-lg bg-secondary"
              onPress={handleUpdateEmail}
            >
              <Text className="text-center text-white font-semibold">
                Update
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomerProfileSetup;
