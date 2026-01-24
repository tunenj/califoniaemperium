// app/(tabs)/welcome.tsx
import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLanguage } from '@/context/LanguageContext'; // Add import

type UserType = 'business' | 'customer' | null;

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useLanguage(); // Add hook
  const [selectedType, setSelectedType] = useState<UserType>(null);

  const handleSelectType = (type: UserType) => {
    setSelectedType(type);
  };

  // Always route to onboardingSignUp
  const handleSignUp = () => {
    router.push('/OnboardingSignUp');
  };

  const handleSignIn = () => {
    if (!selectedType) return;
    router.push('/signIn');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Section */}
      <View className="bg-secondary min-h-[250px]">
        <View className="flex-1 px-6 pt-20">
          {/* Back Arrow */}
          <View className="relative left-[26px]">
            <TouchableOpacity
              className="w-10 h-10 rounded-full shadow-lg"
              onPress={handleBack}
            >
              <ArrowLeft size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View className="items-center justify-center mb-4 shadow-lg">
            <Image
              source={images.onboarding}
              className="w-20 h-20"
              resizeMode="contain"
            />
          </View>
        </View>

        <Text className="text-2xl text-white mb-12 text-center">
          {t('welcome_back')}
        </Text>
      </View>

      {/* Bottom Section */}
      <View className="bg-white flex-1 -mt-8 rounded-t-3xl">
        <View className="px-6 pt-8">
          {/* Title */}
          <View className="items-center mb-8">
            <Text className="text-xl text-black text-center">
              {t('login_as_business_or_customer')}
            </Text>
          </View>

          {/* Selection Cards */}
          <View className="space-y-6">
            {/* Business */}
            <TouchableOpacity
              className={`p-6 rounded-2xl border mt-4 bg-white ${
                selectedType === 'business'
                  ? 'border-secondary'
                  : 'border-gray-200'
              }`}
              onPress={() => handleSelectType('business')}
            >
              <View className="flex-row items-center">
                <View className="flex-1 relative pl-14">
                  <Image
                    source={images.businessIcon}
                    className="absolute left-0 top-3 w-6 h-6 z-20"
                    resizeMode="contain"
                  />
                  <View
                    className={`absolute right-0 top-4 w-4 h-4 rounded border ${
                      selectedType === 'business'
                        ? 'bg-secondary border-secondary'
                        : 'border-gray-400'
                    }`}
                  />
                  <Text className="text-xl font-bold text-gray-900 mb-1">
                    {t('business')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Customer */}
            <TouchableOpacity
              className={`p-6 rounded-2xl border mt-4 bg-white ${
                selectedType === 'customer'
                  ? 'border-secondary'
                  : 'border-gray-200'
              }`}
              onPress={() => handleSelectType('customer')}
            >
              <View className="flex-row items-center">
                <View className="flex-1 relative pl-14">
                  <Image
                    source={images.customerIcon}
                    className="absolute left-0 top-3 w-6 h-6 z-20"
                    resizeMode="contain"
                  />
                  <View
                    className={`absolute right-0 top-4 w-4 h-4 rounded border ${
                      selectedType === 'customer'
                        ? 'bg-secondary border-secondary'
                        : 'border-gray-400'
                    }`}
                  />
                  <Text className="text-xl font-bold text-gray-900 mb-1">
                    {t('customer')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View className="mt-12">
            {/* Login Button */}
            <TouchableOpacity
              className={`py-4 rounded-2xl shadow-lg ${
                selectedType ? 'bg-secondary' : 'bg-gray-300'
              }`}
              onPress={handleSignIn}
              disabled={!selectedType}
            >
              <View className="flex-row items-center justify-center">
                <Text
                  className={`text-xl font-semibold mr-2 ${
                    selectedType ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {t('login')}
                </Text>
                <ArrowRight
                  size={22}
                  color={selectedType ? '#fff' : '#9CA3AF'}
                />
              </View>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <TouchableOpacity
              className="py-6 items-center"
              onPress={handleSignUp}
            >
              <Text className="text-gray-600 text-lg">
                {t('dont_have_account')}{' '}
                <Text className="text-accent">{t('sign_up')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}