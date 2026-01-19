import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

export default function StoreProfileScreen() {
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const categories = [
    "Electronics",
    "Fashion",
    "Groceries",
    "Health & Beauty",
    "Home & Kitchen",
    "Others",
  ];

  const pickImage = async (type: "banner" | "logo") => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "banner" ? [4, 1] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].uri;
      if (type === "banner") {
        setBannerImage(uri);
      } else {
        setLogoImage(uri);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5">
          {/* Header */}
          <Text className="text-lg font-semibold text-gray-900">
            Store profile
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            Manage your store information and branding.
          </Text>

          {/* Banner Upload */}
          <TouchableOpacity
            className="mt-5 h-36 rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 items-center justify-center overflow-hidden"
            onPress={() => pickImage("banner")}
          >
            {bannerImage ? (
              <Image
                source={{ uri: bannerImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <>
                <Ionicons name="image-outline" size={28} color="#9ca3af" />
                <Text className="text-sm font-medium text-gray-600 mt-2">
                  Upload store banner
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  Recommended: 1200 x 300px
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Logo */}
          <View className="flex-row items-center mt-[-24px] ml-4">
            <TouchableOpacity
              className="w-16 h-16 rounded-lg bg-gray-200 border-2 border-white items-center justify-center overflow-hidden"
              onPress={() => pickImage("logo")}
            >
              {logoImage ? (
                <Image
                  source={{ uri: logoImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="storefront-outline"
                  size={28}
                  color="#9ca3af"
                />
              )}
            </TouchableOpacity>
            <Text className="ml-3 text-xs text-gray-500">Logo</Text>
          </View>

          {/* Form */}
          <View className="mt-6 space-y-6">
            {/* Store Name */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                Store Name
              </Text>
              <TextInput
                placeholder="Enter store name"
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
              />
            </View>

            {/* Category */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">Category</Text>

              <TouchableOpacity
                className="flex-row items-center justify-between bg-gray-100 rounded-lg px-4 py-3"
                onPress={() => setCategoryOpen((prev) => !prev)}
              >
                <Text
                  className={`text-sm ${category ? "text-gray-800" : "text-gray-400"
                    }`}
                >
                  {category || "Select"}
                </Text>
                <Ionicons
                  name={categoryOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#9ca3af"
                />
              </TouchableOpacity>

              {categoryOpen && (
                <View className="bg-gray-100 rounded-lg mt-2 overflow-hidden">
                  {categories.map((item) => (
                    <TouchableOpacity
                      key={item}
                      className="px-4 py-3 border-b border-gray-200"
                      onPress={() => {
                        setCategory(item);
                        setCategoryOpen(false);
                      }}
                    >
                      <Text className="text-sm text-gray-800">
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Description */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                Description
              </Text>
              <TextInput
                placeholder="Tell us about your store"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3 h-24"
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">Email</Text>
              <TextInput
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
              />
            </View>

            {/* Phone */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                Phone Number
              </Text>
              <TextInput
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
              />
            </View>

            {/* Address */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                Store Address
              </Text>
              <TextInput
                placeholder="Enter store address"
                value={address}
                onChangeText={setAddress}
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
              />
            </View>
          </View>
        </View>
        {/* Bottom Buttons */}
        <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4">
          <View className="flex-row justify-end items-center space-x-4 gap-6">
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Discard changes?",
                  "Your changes will be lost.",
                  [
                    { text: "Continue Editing", style: "cancel" },
                    { text: "Discard", style: "destructive" },
                  ]
                )
              }
            >
              <Text className="text-sm text-secondary border border-secondary px-6 py-2 rounded-2xl font-medium mb-6 -mr-3">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-secondary px-6 py-2 rounded-2xl mb-6"
              onPress={() =>
                Alert.alert(
                  "Success",
                  "Store profile saved successfully!"
                )
              }
            >
              <Text className="text-sm text-white font-medium">
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>


    </SafeAreaView>
  );
}
