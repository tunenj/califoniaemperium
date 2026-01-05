// app/(tabs)/welcome.tsx
import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type UserType = 'business' | 'customer' | null;

export default function WelcomeScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<UserType>(null);

  const handleSelectType = (type: UserType) => {
    setSelectedType(type);
  };

  const handleSignUp = () => {
    if (selectedType) {
      router.push(`/(auth)/signUp?type=${selectedType}`);
    }
  };

  const handleSignIn = () => {
    router.push('/(Onboarding)/OnboardingSignIn');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >

      {/* Top Section */}
      <View className="bg-secondary h-1/3 min-h-[250px]">
        <View className="flex-1 px-6 pt-20">
          {/* Arrow in its own container */}
          <View className="relative left-26">
            <TouchableOpacity
              className="w-10 h-10 rounded-full shadow-lg"
              onPress={handleBack}
            >
              <ArrowLeft size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Logo/Image in its own container */}
          <View className="items-center justify-center mb-4 shadow-lg">
            <Image
              source={images.onboarding}
              className="w-20 h-20"
              resizeMode="contain"
            />
          </View>

        </View>
        <Text className="text-2xl text-white mb-12 text-center">
          Welcome to CaliforniaEmporium
        </Text>
      </View>

      {/* Bottom Section */}
      <View className="bg-white flex-1 -mt-8 rounded-t-3xl">
        <View className="px-6 pt-8">
          {/* Title */}
          <View className="items-center mb-8">
            <Text className="text-xl text-black text-center">
              Register as Business or Customer
            </Text>
          </View>

          {/* Selection Cards */}
          <View className="space-y-6">
            {/* Business Card */}
            <TouchableOpacity
              className={`p-6 rounded-2xl border mt-4 bg-white
                ${selectedType === 'business'
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
                    className={`absolute right-0 top-4 w-4 h-4 rounded border
                      ${selectedType === 'business'
                        ? 'bg-secondary border-secondary'
                        : 'border-gray-400'
                      }`}
                  />
                  <Text className="text-xl font-bold text-gray-900 mb-1 z-10">
                    Business
                  </Text>
                  <Text className="text-gray-600 z-10">
                    Am here to provide service
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Customer Card */}
            <TouchableOpacity
              className={`p-6 rounded-2xl border mt-4 bg-white
                ${selectedType === 'customer'
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
                    className={`absolute right-0 top-4 w-4 h-4 rounded border
                      ${selectedType === 'customer'
                        ? 'bg-secondary border-secondary'
                        : 'border-gray-400'
                      }`}
                  />
                  <Text className="text-xl font-bold text-gray-900 mb-1 z-10">
                    Customer
                  </Text>
                  <Text className="text-gray-600 z-10">
                    Am here to seek service
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View className="mt-12">
            {/* Sign Up */}
            <TouchableOpacity
              className={`py-4 rounded-2xl ${selectedType ? 'bg-secondary' : 'bg-gray-300'
                } shadow-lg`}
              onPress={handleSignUp}
              disabled={!selectedType}
            >
              <View className="flex-row items-center justify-center">
                <Text
                  className={`text-xl font-semibold mr-2 ${selectedType ? 'text-white' : 'text-gray-500'
                    }`}
                >
                  Sign Up
                </Text>
                <ArrowRight
                  size={22}
                  color={selectedType ? 'white' : '#9CA3AF'}
                />
              </View>
            </TouchableOpacity>

            {/* Log In */}
            <TouchableOpacity
              className="py-6 items-center"
              onPress={handleSignIn}
            >
              <Text className="text-gray-600 text-lg">
                Already have an account?{' '}
                <Text className="text-accent">Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
