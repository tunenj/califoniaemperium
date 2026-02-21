import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useLanguage } from '@/context/LanguageContext';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { colors } from "@/constants/color";

interface VendorData {
  id: string;
  user: string;
  user_email: string;
  user_name: string;
  business_name: string;
  business_slug: string;
  business_type: string;
  business_email: string;
  business_phone: string;
  description: string;
  logo: string | null;
  banner: string | null;
  verification_status: string;
  is_verified: boolean;
  verified_at: string;
  is_active: boolean;
  is_accepting_orders: boolean;
  rating_average: string;
  rating_count: number;
  total_sales: number;
  return_policy: string;
  shipping_policy: string;
  website: string;
  facebook: string;
  twitter: string;
  instagram: string;
  created_at: string;
  updated_at: string;
  pending_products_count: number;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  commission_rate: string;
  total_revenue: string;
  bank_name: string;
  account_holder_name: string;
}

interface UpdateVendorResponse {
  success: boolean;
  message: string;
  data: VendorData;
}

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

export default function StoreProfileScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [businessSlug, setBusinessSlug] = useState<string>(
    params.business_slug as string || ""
  );

  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    description: "",
    business_email: "",
    business_phone: "",
    address_line1: "",
    city: "",
    state: "",
    country: "NG",
  });

  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<ImageFile | null>(null);
  const [logoFile, setLogoFile] = useState<ImageFile | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [originalData, setOriginalData] = useState<VendorData | null>(null);

  const categories = [
    { value: "electronics", label: t('electronics') || "Electronics" },
    { value: "fashion", label: t('fashion') || "Fashion" },
    { value: "groceries", label: t('groceries') || "Groceries" },
    { value: "health_beauty", label: t('health_beauty') || "Health & Beauty" },
    { value: "home_kitchen", label: t('home_kitchen') || "Home & Kitchen" },
    { value: "others", label: t('others') || "Others" },
  ];

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      setFetching(true);

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Required',
          text2: 'Please sign in again',
          position: 'top',
          visibilityTime: 4000,
          topOffset: 30,
        });
        return;
      }

      const response = await api.get(endpoints.getVendorList);

      // Data is inside results array — pick the first vendor
      const vendorData: VendorData = response.data.results[0];

      if (!vendorData) {
        Toast.show({
          type: 'error',
          text1: 'Not Found',
          text2: 'No vendor profile found.',
          position: 'top',
          visibilityTime: 4000,
          topOffset: 30,
        });
        return;
      }

      setOriginalData(vendorData);
      setBusinessSlug(vendorData.business_slug);

      setFormData({
        business_name: vendorData.business_name || "",
        business_type: vendorData.business_type || "",
        description: vendorData.description || "",
        business_email: vendorData.business_email || "",
        business_phone: vendorData.business_phone || "",
        address_line1: vendorData.address_line1 || "",
        city: vendorData.city || "",
        state: vendorData.state || "",
        country: vendorData.country || "NG",
      });

      if (vendorData.banner) setBannerImage(vendorData.banner);
      if (vendorData.logo) setLogoImage(vendorData.logo);

    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: error.response?.data?.message || "Failed to load profile",
        position: 'top',
        visibilityTime: 4000,
        topOffset: 30,
      });
    } finally {
      setFetching(false);
    }
  };

  const pickImage = async (imageType: "banner" | "logo") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Toast.show({
        type: 'error',
        text1: 'Permission Required',
        text2: 'Camera roll permission is needed to upload images',
        position: 'top',
        visibilityTime: 4000,
        topOffset: 30,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: imageType === "banner" ? [4, 1] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const uri = asset.uri;

      const filename = uri.split('/').pop() || `${imageType}_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

      const file: ImageFile = { uri, name: filename, type: mimeType };

      if (imageType === "banner") {
        setBannerImage(uri);
        setBannerFile(file);
      } else {
        setLogoImage(uri);
        setLogoFile(file);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Parse API field errors into readable message
  const parseErrorDetails = (details: string): string => {
    try {
      const matches = details.match(/'(\w+)':\s*\[ErrorDetail\(string='(.+?)',\s*code=/g);
      if (matches && matches.length > 0) {
        return matches
          .map((m: string) => {
            const field = m.match(/'(\w+)':/)?.[1]?.replace(/_/g, ' ');
            const msg = m.match(/string='(.+?)'/)?.[1];
            return `${field}: ${msg}`;
          })
          .join('\n');
      }
    } catch (_) {}
    return details;
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const slugToUse = businessSlug || originalData?.business_slug;

      if (!slugToUse) {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: 'Business slug is missing. Please try again.',
          position: 'top',
          visibilityTime: 4000,
          topOffset: 30,
        });
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();

      // Only append fields that have changed
      if (originalData) {
        if (formData.business_name !== originalData.business_name)
          formDataToSend.append('business_name', formData.business_name);

        if (formData.business_type !== originalData.business_type)
          formDataToSend.append('business_type', formData.business_type);

        if (formData.description !== originalData.description)
          formDataToSend.append('description', formData.description);

        if (formData.business_email !== originalData.business_email)
          formDataToSend.append('business_email', formData.business_email);

        if (formData.business_phone !== originalData.business_phone)
          formDataToSend.append('business_phone', formData.business_phone);

        if (formData.address_line1 !== originalData.address_line1)
          formDataToSend.append('address_line1', formData.address_line1);

        if (formData.city !== originalData.city)
          formDataToSend.append('city', formData.city);

        if (formData.state !== originalData.state)
          formDataToSend.append('state', formData.state);

        if (formData.country !== originalData.country)
          formDataToSend.append('country', formData.country);
      }

      // Append image files if selected
      if (bannerFile) {
        formDataToSend.append('banner', {
          uri: bannerFile.uri,
          type: bannerFile.type,
          name: bannerFile.name,
        } as any);
      }

      if (logoFile) {
        formDataToSend.append('logo', {
          uri: logoFile.uri,
          type: logoFile.type,
          name: logoFile.name,
        } as any);
      }

      // Check if anything changed
      const hasTextChanges = originalData && (
        formData.business_name !== originalData.business_name ||
        formData.business_type !== originalData.business_type ||
        formData.description !== originalData.description ||
        formData.business_email !== originalData.business_email ||
        formData.business_phone !== originalData.business_phone ||
        formData.address_line1 !== originalData.address_line1 ||
        formData.city !== originalData.city ||
        formData.state !== originalData.state ||
        formData.country !== originalData.country
      );

      const hasImageChanges = bannerFile || logoFile;

      if (!hasTextChanges && !hasImageChanges) {
        Toast.show({
          type: 'info',
          text1: 'No Changes',
          text2: 'No changes detected to save',
          position: 'top',
          visibilityTime: 3000,
          topOffset: 30,
        });
        setLoading(false);
        return;
      }

      const response = await api.patch<UpdateVendorResponse>(
        endpoints.editVendorDetails(slugToUse),
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: t('success') || 'Success',
          text2: response.data.message || 'Store profile updated successfully',
          position: 'top',
          visibilityTime: 4000,
          topOffset: 30,
        });

        const updatedVendor = response.data.data;

        setOriginalData(updatedVendor);

        if (updatedVendor.business_slug) {
          setBusinessSlug(updatedVendor.business_slug);
        }

        if (updatedVendor.banner) setBannerImage(updatedVendor.banner);
        if (updatedVendor.logo) setLogoImage(updatedVendor.logo);

        setFormData({
          business_name: updatedVendor.business_name || "",
          business_type: updatedVendor.business_type || "",
          description: updatedVendor.description || "",
          business_email: updatedVendor.business_email || "",
          business_phone: updatedVendor.business_phone || "",
          address_line1: updatedVendor.address_line1 || "",
          city: updatedVendor.city || "",
          state: updatedVendor.state || "",
          country: updatedVendor.country || "NG",
        });

        setBannerFile(null);
        setLogoFile(null);

      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }

    } catch (error: any) {

      let errorMessage = "Failed to save profile";

      if (error.response?.data?.error?.details) {
        // Parse field-level errors from API e.g. address_line1, city, state
        errorMessage = parseErrorDetails(error.response.data.error.details);
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 30,
      });

    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanges =
      originalData?.business_name !== formData.business_name ||
      originalData?.business_type !== formData.business_type ||
      originalData?.description !== formData.description ||
      originalData?.business_email !== formData.business_email ||
      originalData?.business_phone !== formData.business_phone ||
      originalData?.address_line1 !== formData.address_line1 ||
      originalData?.city !== formData.city ||
      originalData?.state !== formData.state ||
      originalData?.country !== formData.country ||
      bannerFile !== null ||
      logoFile !== null;

    if (hasChanges) {
      Alert.alert(
        t('discard_changes') || "Discard Changes",
        "Any unsaved changes will be lost",
        [
          { text: t('continue_editing') || "Continue Editing", style: "cancel" },
          {
            text: t('discard') || "Discard",
            style: "destructive",
            onPress: () => {
              if (originalData) {
                setFormData({
                  business_name: originalData.business_name || "",
                  business_type: originalData.business_type || "",
                  description: originalData.description || "",
                  business_email: originalData.business_email || "",
                  business_phone: originalData.business_phone || "",
                  address_line1: originalData.address_line1 || "",
                  city: originalData.city || "",
                  state: originalData.state || "",
                  country: originalData.country || "NG",
                });
                setBannerImage(originalData.banner);
                setLogoImage(originalData.logo);
                setBannerFile(null);
                setLogoFile(null);
              }
            }
          },
        ]
      );
    }
  };

  if (fetching) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={colors.darkRed} />
        <Text className="text-gray-500 mt-2">
          {t('loading_profile') || "Loading profile..."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5">
          {/* Header */}
          <Text className="text-lg font-semibold text-gray-900">
            {t('store_profile') || "Store Profile"}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {t('manage_store_info_branding') || "Manage your store information and branding"}
          </Text>

          {/* Banner Upload */}
          <TouchableOpacity
            className="mt-5 h-36 rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 items-center justify-center overflow-hidden"
            onPress={() => pickImage("banner")}
            disabled={loading}
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
                  {t('upload_store_banner') || "Upload Store Banner"}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {t('recommended_banner_size') || "Recommended: 1200x300"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Logo */}
          <View className="flex-row items-center mt-[-24px] ml-4">
            <TouchableOpacity
              className="w-16 h-16 rounded-lg bg-gray-200 border-2 border-white items-center justify-center overflow-hidden"
              onPress={() => pickImage("logo")}
              disabled={loading}
            >
              {logoImage ? (
                <Image
                  source={{ uri: logoImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="storefront-outline" size={28} color="#9ca3af" />
              )}
            </TouchableOpacity>
            <Text className="ml-3 text-xs text-gray-500">
              {t('logo') || "Logo"}
            </Text>
          </View>

          {/* Form */}
          <View className="mt-6 space-y-6">

            {/* Store Name */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                {t('store_name') || "Store Name"}
              </Text>
              <TextInput
                placeholder={t('enter_store_name') || "Enter store name"}
                value={formData.business_name}
                onChangeText={(value) => handleInputChange('business_name', value)}
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
                editable={!loading}
              />
            </View>

            {/* Category */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                {t('category') || "Category"}
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-gray-100 rounded-lg px-4 py-3"
                onPress={() => setCategoryOpen((prev) => !prev)}
                disabled={loading}
              >
                <Text className={`text-sm ${formData.business_type ? "text-gray-800" : "text-gray-400"}`}>
                  {categories.find(c => c.value === formData.business_type)?.label || (t('select') || "Select")}
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
                      key={item.value}
                      className="px-4 py-3 border-b border-gray-200"
                      onPress={() => {
                        handleInputChange('business_type', item.value);
                        setCategoryOpen(false);
                      }}
                    >
                      <Text className="text-sm text-gray-800">{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Description */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                {t('description') || "Description"}
              </Text>
              <TextInput
                placeholder={t('tell_about_store') || "Tell customers about your store"}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3 h-24"
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                {t('email') || "Email"}
              </Text>
              <TextInput
                placeholder={t('enter_email_address') || "Enter email address"}
                value={formData.business_email}
                onChangeText={(value) => handleInputChange('business_email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
                editable={!loading}
              />
            </View>

            {/* Phone */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                {t('phone_number') || "Phone Number"}
              </Text>
              <TextInput
                placeholder={t('enter_phone_number') || "Enter phone number"}
                value={formData.business_phone}
                onChangeText={(value) => handleInputChange('business_phone', value)}
                keyboardType="phone-pad"
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
                editable={!loading}
              />
            </View>

            {/* Address */}
            <View>
              <Text className="text-xs text-gray-400 mb-2">
                {t('store_address') || "Store Address"}
              </Text>
              <TextInput
                placeholder={t('enter_store_address') || "Enter store address"}
                value={formData.address_line1}
                onChangeText={(value) => handleInputChange('address_line1', value)}
                className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
                editable={!loading}
              />
            </View>

            {/* City and State */}
            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-2">
                  {t('city') || "City"}
                </Text>
                <TextInput
                  placeholder={t('enter_city') || "Enter city"}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
                  editable={!loading}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-2">
                  {t('state') || "State"}
                </Text>
                <TextInput
                  placeholder={t('enter_state') || "Enter state"}
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  className="text-sm text-gray-800 bg-gray-100 rounded-lg px-4 py-3"
                  editable={!loading}
                />
              </View>
            </View>

          </View>
        </View>

        {/* Bottom Buttons */}
        <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-200">
          <View className="flex-row justify-end items-center space-x-4 gap-6">
            <TouchableOpacity onPress={handleCancel} disabled={loading}>
              <Text className="text-sm text-secondary border border-secondary px-6 py-2 rounded-2xl font-medium">
                {t('cancel') || "Cancel"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-secondary px-6 py-2 rounded-2xl"
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-sm text-white font-medium">
                  {t('save') || "Save"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Toast must be at root level to appear above everything */}
      <Toast />
    </SafeAreaView>
  );
}