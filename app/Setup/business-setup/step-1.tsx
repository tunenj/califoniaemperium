// Step1.tsx - Updated with access token handling and user API integration
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AnimatedStep from "@/components/AnimatedStep";
import StepIndicator from "@/components/StepIndicator";
import { useSetup } from "@/context/VendorApplicationContext";
import { countries } from "@/data/countries";
import { useLanguage } from "@/context/LanguageContext";
import api from '@/api/api'; // Added import
import { endpoints } from '@/api/endpoints'; // Added import

export default function Step1() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data, update } = useSetup();
  const { t } = useLanguage();

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false); // Added for user update state

  // Helper function to safely get string from params
  const getParamString = (param: any): string => {
    if (!param) return '';
    return Array.isArray(param) ? param[0] || '' : param;
  };

  // ✅ NEW: Function to fetch user details from API
  const fetchUserDetails = async (accessToken: string) => {
    try {
      console.log('🔍 Fetching user details from API...');
      
      const response = await api.get(endpoints.getUserDetails, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.data) {
        const userData = response.data;
        console.log('✅ User details fetched:', {
          firstName: userData.first_name,
          lastName: userData.last_name,
          email: userData.email,
        });

        // Update local state with fetched user data
        update({
          firstName: userData.first_name || data.firstName,
          lastName: userData.last_name || data.lastName,
          email: userData.email || data.email,
        });

        return userData;
      }
    } catch (error: any) {
      console.error('❌ Error fetching user details:', error);
      // Don't throw error - we can continue with existing data
    }
    return null;
  };

  // ✅ NEW: Function to update user details via API
  const updateUserDetails = async (firstName: string, lastName: string) => {
    if (!firstName || !lastName) {
      console.log('⚠️ Skipping user update: Missing first or last name');
      return false;
    }

    try {
      setIsUpdatingUser(true);
      console.log('🔄 Updating user details via API...', { firstName, lastName });

      const accessToken = await AsyncStorage.getItem('authToken');
      if (!accessToken) {
        console.error('No access token found for user update');
        return false;
      }

      const updateData = {
        first_name: firstName,
        last_name: lastName,
      };

      const response = await api.patch(endpoints.updateUserDetails, updateData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
        console.log('✅ User details updated successfully:', response.data);
        return true;
      }
    } catch (error: any) {
      console.error('❌ Error updating user details:', error);
      // Don't show error to user - this is a background sync
    } finally {
      setIsUpdatingUser(false);
    }
    return false;
  };

  // ✅ NEW: Verify and save access token on mount
  useEffect(() => {
    const initializeTokenAndData = async () => {
      try {
        console.log('🔐 Step1: Initializing access token...');

        // Check if token exists in AsyncStorage
        let accessToken = await AsyncStorage.getItem('authToken');
        
        if (!accessToken) {
          console.log('⚠️ No token in AsyncStorage, checking params...');
          
          // Try to get from params
          const tokenFromParams = getParamString(params.accessToken);
          const initialTokens = getParamString(params.initialTokens);
          
          if (tokenFromParams) {
            // Direct access token from params
            accessToken = tokenFromParams;
            await AsyncStorage.setItem('authToken', tokenFromParams);
            console.log('✅ Access token saved from params (direct)');
          } else if (initialTokens) {
            // Parse from initialTokens JSON
            try {
              const parsedTokens = JSON.parse(initialTokens);
              if (parsedTokens.access_token) {
                accessToken = parsedTokens.access_token;
                await AsyncStorage.setItem('authToken', parsedTokens.access_token);
                console.log('✅ Access token saved from params (JSON)');
                
                // Also save refresh token if available
                if (parsedTokens.refresh_token) {
                  await AsyncStorage.setItem('refreshToken', parsedTokens.refresh_token);
                  console.log('✅ Refresh token saved from params');
                }
              }
            } catch (parseError) {
              console.error('Error parsing initialTokens:', parseError);
            }
          }
        } else {
          console.log('Access token already exists in AsyncStorage');
        }

        // Verify token exists
        if (!accessToken) {
          console.error('No access token found anywhere');
          Alert.alert(
            t('session_expired') || 'Session Expired',
            t('please_login_again') || 'Please login again to continue.',
            [
              {
                text: t('login') || 'Login',
                onPress: () => router.replace('/signIn'),
              },
            ]
          );
          return;
        }

        setTokenVerified(true);
        console.log('✅ Access token verified and ready');

        // ✅ NEW: Fetch user details from API using the token
        const userData = await fetchUserDetails(accessToken);

        // Load saved setup data (overwrites with API data if available)
        const savedData = await AsyncStorage.getItem('setupData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          // Merge with user data from API (API data takes precedence)
          update({
            ...parsedData,
            ...(userData && {
              firstName: userData.first_name || parsedData.firstName,
              lastName: userData.last_name || parsedData.lastName,
              email: userData.email || parsedData.email,
            }),
          });
          console.log('✅ Loaded saved setup data (merged with API)');
        } else if (userData) {
          // If no saved data, use API data
          update({
            firstName: userData.first_name,
            lastName: userData.last_name,
            email: userData.email,
          });
          console.log('✅ Using user data from API');
        }

        // Pre-fill data from params if available (params take lowest priority)
        const emailFromParams = getParamString(params.email);
        const phoneFromParams = getParamString(params.phoneNumber);
        const firstNameFromParams = getParamString(params.firstName);
        const lastNameFromParams = getParamString(params.lastName);

        if (emailFromParams || phoneFromParams || firstNameFromParams || lastNameFromParams) {
          update({
            email: emailFromParams || data.email,
            phone: phoneFromParams || data.phone,
            firstName: firstNameFromParams || data.firstName,
            lastName: lastNameFromParams || data.lastName,
          });
          console.log('✅ Pre-filled data from params');
        }

      } catch (error) {
        console.error('❌ Error initializing token:', error);
        Alert.alert(
          t('error') || 'Error',
          t('failed_to_initialize') || 'Failed to initialize. Please try again.',
          [
            {
              text: t('retry') || 'Retry',
              onPress: () => initializeTokenAndData(),
            },
            {
              text: t('login') || 'Login',
              onPress: () => router.replace('/signIn'),
              style: 'cancel',
            },
          ]
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeTokenAndData();
  }, []);

  // Email validation
  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Phone validation
  const isValidPhone = (phone: string) => {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\D/g, ''));
  };

  const fullName =
    data.fullName ||
    `${data.firstName || ""} ${data.lastName || ""}`.trim();

  const selectedCountry =
    countries.find((c) => c.code === data.countryCode) ||
    countries.find((c) => c.code === "+234");

  // Validation
  const isFullNameValid = fullName.length >= 2;
  const isGenderValid = Boolean(data.gender);
  const isEmailValid = Boolean(data.email) && isValidEmail(data.email || '');
  const isPhoneValid = Boolean(data.phone) && isValidPhone(data.phone || '');
  const isAddressValid = Boolean(data.address) && (data.address || '').length >= 5;

  const isValid = isFullNameValid && isGenderValid && isEmailValid && isPhoneValid && isAddressValid && tokenVerified;

  const genders = [
    { label: t('male'), value: "male" },
    { label: t('female'), value: "female" },
    { label: t('prefer_not_to_say'), value: "other" },
  ];

  const handleNext = async () => {
    if (!tokenVerified) {
      Alert.alert(
        t('session_error') || 'Session Error',
        t('please_restart_setup') || 'Please restart the setup process.'
      );
      return;
    }

    if (!isValid) {
      // Show validation errors
      if (!isFullNameValid) {
        alert(t('enter_valid_full_name'));
        return;
      }
      if (!isEmailValid) {
        alert(t('enter_valid_email'));
        return;
      }
      if (!isPhoneValid) {
        alert(t('enter_valid_phone'));
        return;
      }
      if (!isAddressValid) {
        alert(t('enter_valid_address'));
        return;
      }
      return;
    }

    // Extract first and last name from full name
    const firstName = fullName.split(' ')[0];
    const lastName = fullName.split(' ').slice(1).join(' ') || ''; // Handle single name case

    // ✅ NEW: Update user details via API in background
    if (firstName && lastName) {
      updateUserDetails(firstName, lastName).then(success => {
        if (success) {
          console.log('✅ User details synced with API');
        } else {
          console.log('⚠️ User details not synced (will retry later)');
        }
      });
    }

    // Save data and proceed to next step
    const updatedData = {
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      email: data.email,
      phone: data.phone,
      countryCode: data.countryCode || selectedCountry?.code,
      address: data.address,
      gender: data.gender,
    };
    
    await update(updatedData);
    
    // Also save to AsyncStorage
    try {
      const existingData = await AsyncStorage.getItem('setupData');
      const mergedData = existingData 
        ? { ...JSON.parse(existingData), ...updatedData }
        : updatedData;
      await AsyncStorage.setItem('setupData', JSON.stringify(mergedData));
      console.log('✅ Step1 data saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }
    
    // Navigate to step 2 (no need to pass token - it's in AsyncStorage)
    router.push("/Setup/business-setup/step-2");
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="lock-closed" size={48} color="#9ca3af" />
          <Text className="text-gray-500 mt-4">{t('verifying_session') || 'Verifying session...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tokenVerified) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text className="text-xl font-semibold text-gray-800 mt-4 text-center">
            {t('session_expired') || 'Session Expired'}
          </Text>
          <Text className="text-gray-600 mt-2 text-center">
            {t('please_login_again') || 'Please login again to continue.'}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/signIn')}
            className="mt-6 bg-red-600 px-8 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">{t('login') || 'Login'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AnimatedStep>
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 pt-4 flex-1">
          {/* Header */}
          <View className="mb-4">
            <View className="w-20 h-20 items-center justify-center mx-auto mb-4">
              <Image
                source={require("@/assets/icons/setupIcon.png")}
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
            {t('personal_details')} ({t('step')} 1/3)
          </Text>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-xs text-black mb-1">
              {t('full_name')} *
            </Text>
            <TextInput
              value={fullName}
              onChangeText={(v) => update({ fullName: v })}
              placeholder={t('enter_full_name')}
              className={`border-b py-2 text-gray-700 ${isFullNameValid ? 'border-gray-300' : 'border-red-500'}`}
            />
            {!isFullNameValid && (
              <Text className="text-xs text-red-500 mt-1">
                {t('enter_valid_full_name')}
              </Text>
            )}
          </View>

          {/* Gender Dropdown */}
          <View className="mb-4">
            <Text className="text-xs text-gray-400 mb-1">
              {t('gender')} *
            </Text>
            <TouchableOpacity
              onPress={() => setShowGenderPicker(true)}
              className={`border-b py-2 ${isGenderValid ? 'border-gray-300' : 'border-red-500'}`}
            >
              <Text className={data.gender ? "text-black" : "text-gray-400"}>
                {data.gender
                  ? t(data.gender)
                  : t('select_from_list')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs text-gray-400">
                {t('email')} *
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
              className={`border-b py-2 ${isEmailValid ? 'border-gray-300' : 'border-red-500'}`}
            />
            {!isEmailValid && data.email && (
              <Text className="text-xs text-red-500 mt-1">
                {t('enter_valid_email')}
              </Text>
            )}
          </View>

          {/* Phone Number */}
          <View className="mb-4">
            <Text className="text-xs text-gray-400 mb-1">
              {t('phone_number')} *
            </Text>
            <View className={`flex-row border-b items-center ${isPhoneValid ? 'border-gray-300' : 'border-red-500'}`}>
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
            {!isPhoneValid && data.phone && (
              <Text className="text-xs text-red-500 mt-1">
                {t('enter_valid_phone')}
              </Text>
            )}
          </View>

          {/* Address */}
          <View className="mb-8">
            <Text className="text-xs text-gray-400 mb-1">
              {t('residential_address')} *
            </Text>
            <TextInput
              placeholder={t('enter_address')}
              value={data.address || ""}
              onChangeText={(v) => update({ address: v })}
              className={`border-b py-2 ${isAddressValid ? 'border-gray-300' : 'border-red-500'}`}
              multiline
              numberOfLines={2}
            />
            {!isAddressValid && data.address && (
              <Text className="text-xs text-red-500 mt-1">
                {t('enter_valid_address')}
              </Text>
            )}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            disabled={!isValid || isUpdatingUser}
            onPress={handleNext}
            className={`mt-10 py-4 rounded-lg items-center ${
              isValid && !isUpdatingUser ? "bg-red-600" : "bg-gray-300"
            }`}
          >
            {isUpdatingUser ? (
              <Text className="text-white font-medium">
                {t('syncing') || 'Syncing...'}
              </Text>
            ) : (
              <Text className="text-white font-medium">
                {t('next_to_business_details')} →
              </Text>
            )}
          </TouchableOpacity>

          {/* Progress Info */}
          <Text className="text-xs text-gray-400 text-center mt-4">
            {t('step_of', { current: 1, total: 3 })}
          </Text>
        </View>

        {/* Country Picker Modal */}
        <Modal visible={showCountryPicker} animationType="slide" transparent={true}>
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">
                {t('select_country_code')}
              </Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={countries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between"
                  onPress={() => {
                    update({ countryCode: item.code });
                    setShowCountryPicker(false);
                  }}
                >
                  <View className="flex-1">
                    <Text className="text-base font-medium">
                      {item.label}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {item.code}
                    </Text>
                  </View>
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