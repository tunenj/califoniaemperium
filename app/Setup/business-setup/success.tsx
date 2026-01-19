import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import images from "@/constants/images";

export default function ProfileSetupSuccess() {
  const router = useRouter();

  const handleProceed = () => {
    // Change to your actual dashboard route if different
    router.replace("/(vendor)/home");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Red Header */}
      <View className="bg-secondary h-1/3 min-h-[260px]">
        <View className="flex-1 items-center justify-center">
          <Image
            source={images.onboarding}
            className="w-16 h-16"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* White Card */}
      <View className="flex-1 bg-white -mt-10 rounded-t-3xl px-6 pt-16 items-center">
        {/* Success Icon */}
        <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
          <CheckCircle size={48} color="#16A34A" />
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-black mb-3 text-center">
          Successful
        </Text>

        {/* Description */}
        <Text className="text-gray-500 text-center mb-10 leading-5">
          Our team is currently reviewing your details, and the process may take
          up to 24 hours. We’ll notify you once it’s complete!
        </Text>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleProceed}
          activeOpacity={0.85}
          className="w-full bg-secondary rounded-xl py-4 items-center"
        >
          <Text className="text-white text-lg font-semibold">
            Proceed to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
