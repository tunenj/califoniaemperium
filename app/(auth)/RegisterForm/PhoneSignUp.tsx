// app/(auth)/BusinessRegisterForm.tsx
import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Modal,
  FlatList,
  BackHandler,
  Alert,
} from 'react-native';
import { countries } from '@/data/countries';

type UserRole = 'business' | 'customer';

const BusinessRegisterForm: React.FC = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [selectedCountry, setSelectedCountry] = useState(
    countries.find(c => c.value === 'nigeria')
  );

  const [selectedMethod, setSelectedMethod] = useState<'whatsapp' | 'sms'>('sms');

  // ✅ Role instead of isCustomer
  const [role, setRole] = useState<UserRole>('business');

  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleBack = () => router.back();
  const handleSignIn = () => router.push('/(auth)/signIn');

  const handleProceedToVerification = () => {
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    router.push({
      pathname: '/(auth)/OtpVerification',
      params: {
        firstName,
        lastName,
        phoneNumber: `${selectedCountry?.code}${phoneNumber}`,
        method: selectedMethod,
        role,              // ✅ business | customer
        source: 'phone',   // ✅ explicitly phone flow
      },
    });
  };

  /** Close country picker on Android back */
  useEffect(() => {
    const backAction = () => {
      if (showCountryPicker) {
        setShowCountryPicker(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [showCountryPicker]);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-secondary h-1/3 min-h-[250px]">
        <View className="flex-1 items-center justify-center">
          <Image
            source={images.onboarding}
            className="w-16 h-16"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Form */}
      <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-8">
        {/* Back */}
        <TouchableOpacity
          className="absolute top-4 left-4 z-10"
          onPress={handleBack}
        >
          <ArrowLeft size={28} color="#C62828" />
        </TouchableOpacity>

        {/* Title + Role Switch */}
        <View className="mb-8 items-center">
          <Text className="text-lg font-semibold text-black mb-1">
            {role === 'customer'
              ? 'Register as Customer'
              : 'Register as Business'}
          </Text>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() =>
              setRole(role === 'business' ? 'customer' : 'business')
            }
          >
            <Image source={images.switchIcon} className="w-6 h-6 mr-2" />
            <Text className="text-lg text-gray-400 font-medium underline">
              {role === 'customer'
                ? 'Switch to Business'
                : 'Switch to Customer'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Names */}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-gray-600 text-sm mb-1">First Name</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 border-b border-secondary"
              placeholder="Enter First Name"
              placeholderTextColor="black"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          <View className="flex-1 ml-2">
            <Text className="text-gray-600 text-sm mb-1">Last Name</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 border-b border-secondary"
              placeholder="Enter Last Name"
              placeholderTextColor="black"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Phone */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm mb-1">Phone Number</Text>
          <View className="flex-row items-center bg-gray-100 rounded-lg border-b border-secondary">
            <TouchableOpacity
              className="px-3 py-4 border-r border-gray-200"
              style={{ width: 100 }}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text className="text-base font-medium">
                {selectedCountry?.code || '+234'}
              </Text>
            </TouchableOpacity>

            <TextInput
              className="flex-1 px-3 py-4 text-base"
              placeholder="Enter phone number"
              placeholderTextColor="black"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Country Picker */}
        <Modal visible={showCountryPicker} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={() => setShowCountryPicker(false)}>
            <View className="flex-1 justify-end bg-black/20">
              <TouchableWithoutFeedback>
                <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
                  <Text className="text-xl font-semibold mb-4">
                    Select Country
                  </Text>
                  <FlatList
                    data={countries}
                    keyExtractor={c => c.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className="py-4 border-b border-gray-100"
                        onPress={() => {
                          setSelectedCountry(item);
                          setShowCountryPicker(false);
                        }}
                      >
                        <Text className="text-base">
                          {item.label} ({item.code})
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Verification Method */}
        <View className="mb-6">
          <Text className="text-lg text-gray-400 mb-4">
            Verify to continue
          </Text>

          <View className="flex-row">
            {/* WhatsApp */}
            <TouchableOpacity
              className={`flex-1 flex-row items-center p-4 mr-3 rounded-xl border ${
                selectedMethod === 'whatsapp'
                  ? 'bg-secondary border-secondary'
                  : 'bg-white border-secondary'
              }`}
              onPress={() => {
                setSelectedMethod('whatsapp');
                handleProceedToVerification();
              }}
            >
              <Image
                source={images.whatsappIcon}
                className="w-6 h-6 mr-2"
              />
              <Text
                className={`text-sm font-medium ${
                  selectedMethod === 'whatsapp'
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
              >
                WhatsApp
              </Text>
            </TouchableOpacity>

            {/* SMS */}
            <TouchableOpacity
              className={`flex-1 flex-row items-center p-4 rounded-xl border ${
                selectedMethod === 'sms'
                  ? 'bg-secondary border-secondary'
                  : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() => {
                setSelectedMethod('sms');
                handleProceedToVerification();
              }}
            >
              <Phone
                size={24}
                color={selectedMethod === 'sms' ? 'white' : '#666'}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`text-sm font-medium ${
                  selectedMethod === 'sms'
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
              >
                SMS
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login */}
        <View className="items-center">
          <TouchableOpacity onPress={handleSignIn}>
            <Text className="text-gray-600 text-base">
              Already have an account?{' '}
              <Text className="text-secondary font-semibold">Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default BusinessRegisterForm;
