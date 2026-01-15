import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { 
  Image, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Modal, 
  FlatList 
} from 'react-native';
import { countries } from '@/data/countries';

const LoginScreen: React.FC = () => {
  const router = useRouter();

  const [role, setRole] = useState<'vendor' | 'customer'>('vendor');
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find(c => c.value === 'nigeria')
  );

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const isFormValid = phoneNumber.trim() !== '' && password.trim() !== '';

  const handleBack = () => router.back();

  const handleSwitchRole = () => {
    setRole(prev => (prev === 'vendor' ? 'customer' : 'vendor'));
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgotPassword');
  };

  const handleLogin = () => {
    const fullPhone = `${selectedCountry?.code}${phoneNumber}`;
    console.log('Login Attempt:', {
      role,
      phone: fullPhone,
    });

    if (role === 'vendor') {
      router.replace('/(vendor)/home');
    } else {
      router.replace('/(customer)/home');
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/signUp');
  };

  return (
    <View className="flex-1 bg-white">
      
      {/* Header */}
      <View className="bg-[#C62828] h-1/3 min-h-[250px] relative">
        <View className="flex-1 items-center justify-center pt-12">
          <Image
            source={images.onboarding}
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 bg-white -mt-12 rounded-t-3xl px-8 pt-8">
        
        {/* Back + Title */}
        <View className="relative mb-8">
          <TouchableOpacity onPress={handleBack} className="absolute top-0 left-0 p-2">
            <ArrowLeft size={28} color="#C62828" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-2xl font-bold text-black mb-2">
              Login as {role === 'vendor' ? 'Business' : 'Customer'}
            </Text>

            <TouchableOpacity className="flex-row items-center" onPress={handleSwitchRole}>
              <Image source={images.switchIcon} className="w-5 h-5 mr-2" resizeMode="contain" />
              <Text className="text-base text-gray-500 underline">
                Switch to {role === 'vendor' ? 'Customer' : 'Business'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View className="mb-8">
          {/* Phone */}
          <Text className="text-gray-700 text-base mb-2">Phone Number</Text>

          <View className="flex-row items-center bg-gray-100 rounded-lg border-b-2 border-[#C62828] mb-6">
            
            {/* Country Picker */}
            <TouchableOpacity
              className="flex-row items-center px-3 py-4 border-r border-gray-200"
              style={{ width: 100 }}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text className="text-base font-medium">{selectedCountry?.code || '+234'}</Text>
            </TouchableOpacity>

            <TextInput
              className="flex-1 py-4 px-3 text-base"
              placeholder="812 345 6789"
              placeholderTextColor="#444"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          {/* Password */}
          <Text className="text-gray-700 text-base mb-2">Password</Text>

          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 text-base pr-12 border-b-2 border-[#C62828]"
              secureTextEntry={!showPassword}
              placeholder="Enter Password"
              placeholderTextColor="#444"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity className="absolute right-4 top-4" onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={24} color="#999" /> : <Eye size={24} color="#999" />}
            </TouchableOpacity>
          </View>

          {/* Forgot */}
          <TouchableOpacity className="items-end mt-3" onPress={handleForgotPassword}>
            <Text className="text-[#C62828] text-sm">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          disabled={!isFormValid}
          onPress={handleLogin}
          className={`rounded-full py-4 items-center mb-8 ${
            isFormValid ? 'bg-[#C62828]' : 'bg-gray-300'
          }`}
        >
          <Text className={`text-lg font-semibold ${isFormValid ? 'text-white' : 'text-gray-600'}`}>
            Login
          </Text>
        </TouchableOpacity>

        {/* Sign Up */}
        <View className="items-center mb-6">
          <Text className="text-gray-600 text-base">
            Don&apos;t have an account?{' '}
            <Text className="text-[#C62828] font-semibold" onPress={handleSignUp}>
              Sign Up
            </Text>
          </Text>
        </View>
      </View>

      {/* Country Picker Modal */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/20">
          <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
            <Text className="text-xl font-semibold mb-4">Select Country</Text>
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
                  <Text className="text-base">{`${item.label} (${item.code})`}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoginScreen;
