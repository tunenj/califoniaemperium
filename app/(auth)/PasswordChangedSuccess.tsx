import images from '@/constants/images';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { MaterialIcons } from '@expo/vector-icons';

const PasswordChangedSuccess: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogin = () => {
    router.replace('/signIn');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Red Header */}
      <View className="bg-secondary h-1/3 min-h-[250px]">
        <View className="flex-1 items-center justify-center">
          <Image
            source={images.onboarding}
            className="w-16 h-16"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* White Card */}
      <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-14 items-center">
        {/* Success Icon */}
        <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
          <MaterialIcons name="check-circle" size={42} color="#16A34A" />
        </View>

        {/* Heading — EXACT text from image */}
        <Text className="text-xl font-bold text-black mb-2 text-center">
          {t('password_reset_successful') || 'Password Reset Successful'}
        </Text>

        {/* Subtitle — EXACT text from image */}
        <Text className="text-gray-500 text-center mb-10">
          {t('password_changed_successfully') || 'Your password has been changed successfully.'}
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          className="w-full bg-secondary rounded-xl py-4 items-center"
          activeOpacity={0.85}
          onPress={handleLogin}
        >
          <Text className="text-white text-lg font-semibold">
            {t('login_to_your_account') || 'Login to Your Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PasswordChangedSuccess;