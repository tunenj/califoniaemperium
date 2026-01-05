import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BusinessRegisterForm: React.FC = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'whatsapp' | 'sms'>('sms');
  const [isCustomer, setIsCustomer] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSignIn = () => {
    router.push('/(auth)/signIn');
  };

  // New: Handle proceeding to OTP verification
  const handleProceedToVerification = () => {
    // Basic validation
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Navigate to OTP screen, passing necessary data
    router.push({
      pathname: '/(auth)/OtpVerification',
      params: {
        firstName,
        lastName,
        phoneNumber,
        method: selectedMethod, // 'whatsapp' or 'sms'
        isCustomer: isCustomer.toString(),
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Red Header with Bag Icon - maintaining original curved/overlap style */}
      <View className="bg-secondary h-1/3 min-h-[250px] relative">
        <View className="flex-1 items-center justify-center">
          <Image
            source={images.onboarding}
            className="w-16 h-16"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bottom Curved White Section */}
      <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-8">
        {/* Title and Switch */}
        <View className="relative mb-8">
          {/* Back Arrow at top-left corner */}
          <TouchableOpacity
            className="absolute top-0 left-0 p-2 z-10"
            onPress={handleBack}
          >
            <ArrowLeft size={28} color="#C62828" />
          </TouchableOpacity>

          <View className="mb-8 items-center">
            <Text className="text-lg font-semibold text-black mb-1">
              {isCustomer ? 'Register as Customer' : 'Register as Business'}
            </Text>

            <TouchableOpacity
              className="flex-row"
              onPress={() => setIsCustomer(!isCustomer)}
            >
              <Image source={images.switchIcon} className="w-6 h-6 mr-2" />
              <Text className="text-lg text-gray-400 font-medium underline">
                {isCustomer ? 'Switch to Business' : 'Switch to customer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-600 text-sm mb-1">First Name</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-4 text-base border-b border-secondary"
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
                className="bg-gray-100 rounded-lg px-4 py-4 text-base border-b border-secondary"
                placeholder="Enter Last Name"
                placeholderTextColor="black"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View>
            <Text className="text-gray-600 text-sm mb-1">Phone Number</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 text-base border-b border-secondary"
              placeholder="Enter phone number"
              placeholderTextColor="black"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Verification Method */}
        <View className="p-2 mb-6">
          <Text className="text-lg text-gray-400 mb-4">Verify to continue</Text>
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
                resizeMode="contain"
              />
              <Text
                className={`text-sm font-medium ${
                  selectedMethod === 'whatsapp' ? 'text-white' : 'text-gray-600'
                }`}
              >
                WhatsApp
              </Text>
            </TouchableOpacity>

            {/* SMS */}
            <TouchableOpacity
              className={`flex-1 flex-row items-center p-4 rounded-xl border-2 ${
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
                color={selectedMethod === 'sms' ? 'white' : '#666666'}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`text-sm font-medium ${
                  selectedMethod === 'sms' ? 'text-white' : 'text-gray-600'
                }`}
              >
                SMS
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Link */}
        <View className="items-center">
          <TouchableOpacity onPress={handleSignIn}>
            <Text className="text-gray-600 text-base text-center">
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