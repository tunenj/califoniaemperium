import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import images from "@/constants/images";

const PromoBanner = () => {
  return (
    <View className="mx-2 my-2 bg-[#FFD966] rounded-xl p-4 flex-row justify-between items-center">
      {/* Left side: icon + texts stacked vertically */}
      <View className="flex-row items-start space-x-2">
        <Image
          source={images.promoIcon}
          className="w-16 h-10"
          resizeMode="contain"
        />

        {/* Texts stacked vertically */}
        <View className="flex-col">
          <Text className="font-bold text-base text-white">Flash Deal</Text>
          <Text className="font-bold text-lg text-white mt-1">
            Up to 50% Off
          </Text>
          <Text className="text-xs text-white mt-1">
            Limited time offers on selected items
          </Text>
        </View>
      </View>
      {/* Right side: button */}
      <TouchableOpacity
        className="bg-darkRed px-4 py-2 rounded-full mt-8"
        onPress={() => {
          // Add your navigation or action here
        }}
      >
        <Text className="text-white font-semibold text-xs">Shop Now</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PromoBanner;
