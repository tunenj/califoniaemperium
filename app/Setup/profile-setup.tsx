import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Pressable,
  BackHandler
} from "react-native";
import { ArrowLeft, ChevronDown, Pencil, User } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { countries } from "@/data/countries";

interface Country {
  value: string;
  label: string;
  code: string;
}

interface UserData {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: string;
  country_code?: string;
  [key: string]: any;
}

interface ApiError {
  code?: string;
  message?: string;
  details?: any;
  action?: string;
}

const CustomerProfileSetup: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage();

  // Country code state
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.value === "canada") ?? countries[0]
  );

  // State for user data
  const [userData, setUserData] = useState<UserData>({});
  const [profileName, setProfileName] = useState("");
  const [gender, setGender] = useState<string>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  
  // Modal states
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  
  // Error states
  const [phoneError, setPhoneError] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  /** Helper to get string value from params */
  const getParamString = useCallback((param: any): string => {
    if (!param) return "";
    return Array.isArray(param) ? param[0] || "" : param;
  }, []);

  // Get initial values from params
  const initialFirstName = getParamString(params.firstName);
  const initialLastName = getParamString(params.lastName);
  const initialEmail = getParamString(params.email);
  const initialPhone = getParamString(params.phoneNumber);
  const initialCountryCode = getParamString(params.countryCode);

  // Initialize country from params or default
  useEffect(() => {
    if (initialCountryCode) {
      const country = countries.find(c => c.code === initialCountryCode);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [initialCountryCode]);

  // Helper function to get clean country code
  const getCleanCountryCode = useCallback(() => {
    return selectedCountry.code.replace(/\D/g, "");
  }, [selectedCountry.code]);

  // Format phone number
  const formatPhoneNumber = useCallback((phoneNumber: string, countryCode: string) => {
    if (!phoneNumber) return "";
    
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const cleanCode = countryCode.replace(/\D/g, "");
    
    // Remove country code from number if already included
    let numberWithoutCode = cleanNumber;
    if (cleanNumber.startsWith(cleanCode)) {
      numberWithoutCode = cleanNumber.slice(cleanCode.length);
    }
    
    // Format based on country (simplified formatting)
    if (selectedCountry.value === "nigeria") {
      // Format for Nigerian numbers: 0803 123 4567
      if (numberWithoutCode.length <= 4) {
        return numberWithoutCode;
      } else if (numberWithoutCode.length <= 7) {
        return `${numberWithoutCode.slice(0, 4)} ${numberWithoutCode.slice(4)}`;
      } else {
        return `${numberWithoutCode.slice(0, 4)} ${numberWithoutCode.slice(4, 7)} ${numberWithoutCode.slice(7, 11)}`;
      }
    }
    
    // Default formatting
    return numberWithoutCode;
  }, [selectedCountry.value]);

  // Validate phone number
  const validatePhoneNumber = useCallback((phoneNumber: string, countryCode: string): { isValid: boolean; error?: string } => {
    if (!phoneNumber.trim()) {
      return { isValid: false, error: t('phone_number_required') || "Phone number is required" };
    }
    
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const cleanCode = countryCode.replace(/\D/g, "");
    
    // Remove country code from number if already included
    let numberWithoutCode = cleanNumber;
    if (cleanNumber.startsWith(cleanCode)) {
      numberWithoutCode = cleanNumber.slice(cleanCode.length);
    }
    
    // Validation rules based on country
    if (selectedCountry.value === "nigeria") {
      // Nigerian numbers: 10 digits after removing 234
      if (numberWithoutCode.length !== 10) {
        return { 
          isValid: false, 
          error: t('invalid_nigerian_phone') || "Nigerian phone numbers must be 10 digits" 
        };
      }
      
      // Check if starts with valid Nigerian prefix
      const validPrefixes = ["70", "80", "81", "90", "91"];
      const prefix = numberWithoutCode.substring(0, 2);
      if (!validPrefixes.includes(prefix)) {
        return { 
          isValid: false, 
          error: t('invalid_nigerian_prefix') || "Invalid Nigerian phone number prefix" 
        };
      }
    }
    
    // General validation for other countries
    if (numberWithoutCode.length < 7) {
      return { 
        isValid: false, 
        error: t('phone_number_too_short') || "Phone number is too short" 
      };
    }
    
    if (numberWithoutCode.length > 15) {
      return { 
        isValid: false, 
        error: t('phone_number_too_long') || "Phone number is too long" 
      };
    }
    
    return { isValid: true };
  }, [selectedCountry.value, t]);

  // Handle phone number change
  const handlePhoneNumberChange = useCallback((text: string) => {
    const digitsOnly = text.replace(/\D/g, "");
    const cleanCode = getCleanCountryCode();
    
    setPhone(digitsOnly);
    setFormattedPhoneNumber(formatPhoneNumber(digitsOnly, cleanCode));
    
    if (phoneError) setPhoneError("");
  }, [getCleanCountryCode, formatPhoneNumber, phoneError]);

  // Validate phone number when it changes
  useEffect(() => {
    if (!phone) return;
    
    const cleanCode = getCleanCountryCode();
    const validation = validatePhoneNumber(phone, cleanCode);
    
    if (!validation.isValid && validation.error) {
      setPhoneError(validation.error);
    } else {
      setPhoneError("");
      setFormattedPhoneNumber(formatPhoneNumber(phone, cleanCode));
    }
  }, [phone, getCleanCountryCode, validatePhoneNumber, formatPhoneNumber]);

  // Handle country selection
  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    
    // Reformat phone number with new country code
    if (phone) {
      const cleanCode = country.code.replace(/\D/g, "");
      setFormattedPhoneNumber(formatPhoneNumber(phone, cleanCode));
    }
  }, [phone, formatPhoneNumber]);

  // Android back handler for country picker
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

  // Extract phone number without country code
  const extractPhoneWithoutCountryCode = useCallback((fullPhone: string, countryCode: string) => {
    if (!fullPhone) return "";
    
    const cleanPhone = fullPhone.replace(/\D/g, "");
    const cleanCode = countryCode.replace(/\D/g, "");
    
    if (cleanPhone.startsWith(cleanCode)) {
      return cleanPhone.slice(cleanCode.length);
    }
    
    return cleanPhone;
  }, []);

  // Detect country from phone number
  const detectCountryFromPhone = useCallback((phoneNumber: string) => {
    if (!phoneNumber) return countries.find(c => c.value === "canada") ?? countries[0];
    
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    
    // Check for country codes
    for (const country of countries) {
      const cleanCode = country.code.replace(/\D/g, "");
      if (cleanPhone.startsWith(cleanCode)) {
        return country;
      }
    }
    
    return countries.find(c => c.value === "canada") ?? countries[0];
  }, []);

  // Helper function to extract error message
  const extractErrorMessage = useCallback((error: any): string => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object') {
      if (error.message) return error.message;
      if (error.error) return error.error;
      if (error.details && typeof error.details === 'string') return error.details;
      
      // For debugging
      console.warn('Error object structure:', error);
      
      // Try to get first error if it's an object with nested errors
      if (error.details && typeof error.details === 'object') {
        const firstKey = Object.keys(error.details)[0];
        if (firstKey && error.details[firstKey]) {
          if (Array.isArray(error.details[firstKey])) {
            return error.details[firstKey][0] || t('something_went_wrong') || "Something went wrong";
          }
          return error.details[firstKey];
        }
      }
    }
    
    return t('something_went_wrong') || "Something went wrong";
  }, [t]);

  // Fetch user details from API
  const fetchUserDetails = useCallback(async () => {
    try {
      setIsFetchingUser(true);
      setApiError(null);
      
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.log('No auth token found');
        setApiError(t('authentication_required') || "Authentication required");
        
        // Fallback to params if no token
        initializeFromParams();
        return;
      }

      console.log('Fetching user details from:', endpoints.getUserDetails);
      
      const response = await api.get(endpoints.getUserDetails, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('User details response:', response.data);

      // Check if response is an error object
      if (response.data && (response.data.code || response.data.error)) {
        console.error('API returned error:', response.data);
        const errorMessage = extractErrorMessage(response.data);
        setApiError(errorMessage);
        initializeFromParams();
        return;
      }

      if (response.data && (response.data.data || response.data.user || response.data)) {
        const userData = response.data.data || response.data.user || response.data;
        setUserData(userData);
        
        // Set individual fields from API response
        const firstName = userData.first_name || userData.firstName || initialFirstName || "";
        const lastName = userData.last_name || userData.lastName || initialLastName || "";
        const userEmail = userData.email || initialEmail || "";
        const userPhone = userData.phone || userData.phone_number || initialPhone || "";
        const userAddress = userData.address || "";
        const userGender = userData.gender || "";
        
        // Update state
        setProfileName(`${firstName} ${lastName}`.trim());
        setGender(userGender || "");
        setEmail(userEmail);
        setNewEmail(userEmail);
        
        // Handle phone and country
        if (userPhone) {
          const detectedCountry = detectCountryFromPhone(userPhone);
          setSelectedCountry(detectedCountry);
          
          const phoneWithoutCode = extractPhoneWithoutCountryCode(userPhone, detectedCountry.code);
          setPhone(phoneWithoutCode);
          setFormattedPhoneNumber(formatPhoneNumber(phoneWithoutCode, detectedCountry.code));
        }
        
        setAddress(userAddress);
        
        console.log('User details fetched and set successfully');
      } else {
        console.log('No user data in response, using params');
        initializeFromParams();
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      const errorMessage = extractErrorMessage(error);
      setApiError(errorMessage);
      
      // Fallback to params data
      initializeFromParams();
    } finally {
      setIsFetchingUser(false);
    }
  }, [initialFirstName, initialLastName, initialEmail, initialPhone, t, detectCountryFromPhone, extractPhoneWithoutCountryCode, formatPhoneNumber, extractErrorMessage]);

  // Initialize from params if API fails
  const initializeFromParams = useCallback(() => {
    console.log('Initializing from params');
    const firstName = initialFirstName || "User";
    const lastName = initialLastName || "";
    const userEmail = initialEmail || "";
    const userPhone = initialPhone || "";
    
    setProfileName(`${firstName} ${lastName}`.trim());
    setEmail(userEmail);
    setNewEmail(userEmail);
    
    if (userPhone) {
      const detectedCountry = detectCountryFromPhone(userPhone);
      setSelectedCountry(detectedCountry);
      
      const phoneWithoutCode = extractPhoneWithoutCountryCode(userPhone, detectedCountry.code);
      setPhone(phoneWithoutCode);
      setFormattedPhoneNumber(formatPhoneNumber(phoneWithoutCode, detectedCountry.code));
    }
  }, [initialFirstName, initialLastName, initialEmail, initialPhone, detectCountryFromPhone, extractPhoneWithoutCountryCode, formatPhoneNumber]);

  // Fetch user details on component mount
  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Update user details
  const updateUserDetails = useCallback(async () => {
    try {
      setIsUpdating(true);
      setApiError(null);
      
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        Alert.alert(t('error'), t('authentication_required'));
        return false;
      }

      // Validate phone number before submission
      const cleanCode = getCleanCountryCode();
      const phoneValidation = validatePhoneNumber(phone, cleanCode);
      if (!phoneValidation.isValid) {
        Alert.alert(t('error'), phoneValidation.error || t('invalid_phone_number'));
        return false;
      }

      // Extract first and last name from profileName
      const nameParts = profileName.trim().split(' ');
      const updatedFirstName = nameParts[0] || '';
      const updatedLastName = nameParts.slice(1).join(' ') || '';

      // Format full phone number with country code
      const fullPhoneNumber = cleanCode + phone.replace(/\D/g, "");

      // Prepare update data
      const updateData: any = {
        first_name: updatedFirstName,
        last_name: updatedLastName,
        phone: fullPhoneNumber,
        email: email,
        address: address,
        gender: gender || undefined,
        country_code: selectedCountry.code,
      };

      // Remove undefined/null fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      console.log('Updating user with:', updateData);

      const response = await api.patch(endpoints.updateUserDetails, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Update response:', response.data);

      // Check if response is an error object
      if (response.data && (response.data.code || response.data.error)) {
        console.error('Update API returned error:', response.data);
        const errorMessage = extractErrorMessage(response.data);
        setApiError(errorMessage);
        Alert.alert(
          t('error') || "Error", 
          errorMessage || t('update_failed') || "Failed to update profile"
        );
        return false;
      }

      if (response.data) {
        console.log('User updated successfully:', response.data);
        
        // Update local user data
        const updatedUserData: UserData = {
          ...userData,
          first_name: updatedFirstName,
          last_name: updatedLastName,
          email: email,
          phone: fullPhoneNumber,
          address: address,
          gender: gender || undefined,
          country_code: selectedCountry.code,
        };
        setUserData(updatedUserData);
        
        Alert.alert(
          t('success') || "Success", 
          t('profile_updated_successfully') || "Profile updated successfully",
          [
            {
              text: "OK",
              onPress: () => {
                // Optionally refresh user data
                fetchUserDetails();
              }
            }
          ]
        );
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error updating user details:', error);
      const errorMessage = extractErrorMessage(error);
      
      setApiError(errorMessage);
      
      Alert.alert(t('error'), errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [profileName, phone, email, address, gender, selectedCountry, userData, getCleanCountryCode, validatePhoneNumber, t, fetchUserDetails, extractErrorMessage]);

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

  const isFormComplete = useMemo(() => {
    // Validate phone number
    const cleanCode = getCleanCountryCode();
    const phoneValidation = validatePhoneNumber(phone, cleanCode);
    
    return (
      profileName.trim() !== "" &&
      gender !== "" &&
      phone.trim() !== "" &&
      phoneValidation.isValid &&
      address.trim() !== ""
    );
  }, [profileName, gender, phone, address, getCleanCountryCode, validatePhoneNumber]);

  const handleNext = useCallback(async () => {
    if (!isFormComplete) {
      Alert.alert(t('incomplete_form'), t('please_fill_all_fields'));
      return;
    }

    setIsLoading(true);
    
    try {
      // Update user details first
      const updateSuccess = await updateUserDetails();
      
      if (updateSuccess) {
        // Navigate to success screen
        router.push("/Setup/successScreen");
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  }, [isFormComplete, updateUserDetails, router, t]);

  if (isFetchingUser) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#C62828" />
        <Text className="mt-4 text-gray-600">{t('loading_user_details') || "Loading user details..."}</Text>
      </View>
    );
  }

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
            source={require("@/assets/icons/setupIcon.png")}
            className="w-24 h-24"
            resizeMode="contain"
          />
        </View>

        <Text className="text-xl font-semibold text-black mb-1 text-center">
          {t('welcome_user', { name: profileName.split(' ')[0] || "User" })}
        </Text>

        <Text className="text-gray-500 text-center">
          {t('setup_profile')}
        </Text>
        
        {/* API Error Display */}
        {apiError ? (
          <View className="mt-2 px-4 py-2 bg-red-100 rounded-lg">
            <Text className="text-red-600 text-sm text-center">
              {apiError}
            </Text>
          </View>
        ) : null}
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
            editable={!isUpdating}
          />
        </View>

        <View>
          <Text className="text-gray-500 text-sm mb-1">{t('gender')}</Text>
          <TouchableOpacity
            onPress={() => setShowGenderModal(true)}
            className="flex-row items-center justify-between border-b border-gray-300 py-3"
            disabled={isUpdating}
          >
            <Text
              className={`text-base ${gender ? "text-black" : "text-gray-400"
                }`}
            >
              {gender || t('select_from_list')}
            </Text>
            <ChevronDown size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-500 text-sm">{t('email')}</Text>
            <TouchableOpacity 
              onPress={() => {
                setNewEmail(email);
                setShowEmailModal(true);
              }}
              disabled={isUpdating}
            >
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

        {/* Phone Number with Country Code */}
        <View>
          <Text className="text-gray-500 text-sm mb-1">{t('phone_number')}</Text>
          <View className={`flex-row bg-transparent rounded-lg border-b ${phoneError ? "border-red-500" : "border-gray-300"}`}>
            <TouchableOpacity
              className="px-3 py-4 border-r border-gray-200"
              style={{ width: 100 }}
              onPress={() => setShowCountryPicker(true)}
              disabled={isUpdating}
            >
              <Text className="font-medium text-black">{selectedCountry.code}</Text>
            </TouchableOpacity>

            <TextInput
              className="flex-1 px-3 py-4 text-black"
              placeholder={t('enter_phone_number') || "Enter phone number"}
              placeholderTextColor="#9CA3AF"
              value={formattedPhoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="phone-pad"
              editable={!isUpdating}
            />
          </View>
          {phoneError ? (
            <Text className="text-red-500 text-xs mt-1">{phoneError}</Text>
          ) : null}
        </View>

        <View>
          <Text className="text-gray-500 text-sm mb-1">{t('billing_address')}</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder={t('enter_address')}
            placeholderTextColor="#9CA3AF"
            className="border-b border-gray-300 py-3 text-base text-black"
            editable={!isUpdating}
          />
        </View>
      </ScrollView>

      {/* Next Button */}
      <View className="mb-40">
        <TouchableOpacity
          disabled={!isFormComplete || isLoading || isUpdating}
          onPress={handleNext}
          className={`py-4 rounded-xl items-center ${isFormComplete && !isLoading && !isUpdating ? "bg-secondary" : "bg-gray-200"
            }`}
        >
          {isLoading || isUpdating ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white font-semibold ml-2">
                {isUpdating ? t('updating') : t('processing')}
              </Text>
            </View>
          ) : (
            <Text
              className={`text-lg font-semibold ${isFormComplete ? "text-white" : "text-gray-400"
                }`}
            >
              {t('next')}
            </Text>
          )}
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

      {/* Country Picker Modal */}
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
            <Text className="text-xl font-semibold mb-4 text-center">
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
                  className="py-4 border-b border-gray-100 flex-row justify-between items-center"
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text className="text-base">{item.label}</Text>
                  <Text className="text-gray-500 text-base">{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CustomerProfileSetup;