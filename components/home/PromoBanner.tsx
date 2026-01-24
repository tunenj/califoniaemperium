import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import images from "@/constants/images";
import { useLanguage } from "@/context/LanguageContext"; // Add this import

const PromoBanner = () => {
  const { t } = useLanguage(); // Add this hook

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
          <Text className="font-bold text-base text-white">
            {t("flash_deal") || "Flash Deal"} {/* Use translation */}
          </Text>
          <Text className="font-bold text-lg text-white mt-1">
            {t("up_to_50_off") || "Up to 50% Off"} {/* Use translation */}
          </Text>
          <Text className="text-xs text-white mt-1">
            {t("limited_time_offers") || "Limited time offers on selected items"} {/* Use translation */}
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
        <Text className="text-white font-semibold text-xs">
          {t("shop_now") || "Shop Now"} {/* Use translation */}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PromoBanner;