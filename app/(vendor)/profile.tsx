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
import { useLanguage } from '@/context/LanguageContext'; // Add import

export default function StoreProfileScreen() {
  const { t } = useLanguage(); // Add hook
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const categories = [
    t('electronics'),
    t('fashion'),
    t('groceries'),
    t('health_beauty'),
    t('home_kitchen'),
    t('others'),
  ];

  const pickImage = async (type: "banner" | "logo") => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        t('permission_required'),
        t('camera_roll_permission_needed')
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
            {t('store_profile')}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {t('manage_store_info_branding')}
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
                  {t('upload_store_banner')}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {t('recommended_banner_size')}
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
            <Text className="ml-3 text-xs text-gray-500">{t('logo')}</Text>
          </View>

          {/* Form */}
          <View className="mt-6 space-y-6">
            {/* Store Name */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                {t('store_name')}
              </Text>
              <TextInput
                placeholder={t('enter_store_name')}
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
              />
            </View>

            {/* Category */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">{t('category')}</Text>

              <TouchableOpacity
                className="flex-row items-center justify-between bg-gray-100 rounded-lg px-4 py-3"
                onPress={() => setCategoryOpen((prev) => !prev)}
              >
                <Text
                  className={`text-sm ${category ? "text-gray-800" : "text-gray-400"
                    }`}
                >
                  {category || t('select')}
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
                {t('description')}
              </Text>
              <TextInput
                placeholder={t('tell_about_store')}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3 h-24"
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">{t('email')}</Text>
              <TextInput
                placeholder={t('enter_email_address')}
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
                {t('phone_number')}
              </Text>
              <TextInput
                placeholder={t('enter_phone_number')}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
              />
            </View>

            {/* Address */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                {t('store_address')}
              </Text>
              <TextInput
                placeholder={t('enter_store_address')}
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
                  t('discard_changes'),
                  t('changes_will_be_lost'),
                  [
                    { text: t('continue_editing'), style: "cancel" },
                    { text: t('discard'), style: "destructive" },
                  ]
                )
              }
            >
              <Text className="text-sm text-secondary border border-secondary px-6 py-2 rounded-2xl font-medium mb-6 -mr-3">
                {t('cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-secondary px-6 py-2 rounded-2xl mb-6"
              onPress={() =>
                Alert.alert(
                  t('success'),
                  t('store_profile_saved_successfully')
                )
              }
            >
              <Text className="text-sm text-white font-medium">
                {t('save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}