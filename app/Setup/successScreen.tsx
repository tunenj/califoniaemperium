import images from "@/constants/images";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { useLanguage } from "@/context/LanguageContext"; // Add import

const ProfileSetupSuccess: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage(); // Add hook

  const handleProceed = () => {
    // Change this to your actual dashboard route
    router.replace("/main");
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
          <CheckCircle size={42} color="#16A34A" />
        </View>

        {/* Heading */}
        <Text className="text-xl font-bold text-black mb-2 text-center">
          {t('successful')}
        </Text>

        {/* Subtitle */}
        <Text className="text-gray-500 text-center mb-10">
          {t('profile_updated_successfully')}
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          className="w-full bg-secondary rounded-xl py-4 items-center"
          activeOpacity={0.85}
          onPress={handleProceed}
        >
          <Text className="text-white text-lg font-semibold">
            {t('proceed_to_dashboard')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileSetupSuccess;