import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import StoreCard from "./StoreCard";
import images from "@/constants/images";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/constants/color";


const FeaturedStores = () => {
  const cardData = [
    {
      title: "TechHub",
      bg: images.electronicsBg,
      front: images.electronicsIcon,
    },
    {
      title: "Fashion Forward",
      bg: images.fashionBg,
      front: images.fashionIcon,
    },
    {
      title: "Home Essential",
      bg: images.groceryBg,
      front: images.groceryIcon,
    },
    {
      title: "Sports Zone",
      bg: images.computerBg,
      front: images.computerIcon,
    },
  ];

  return (
    <View className="mt-2 px-4  bg-white rounded-2xl mx-2">
      <View className="flex-row justify-between mb-3 mt-6">
        <View>
          <Text className="font-semibold text-base">Featured Stores</Text>
          <Text className="text-xs text-gray-500">
            Discover top-rated vendors
          </Text>
        </View>
        <TouchableOpacity className="flex-row items-center space-x-1">
          <Text className="text-darkRed text-sm">View more</Text>
          <ChevronRight size={16} color={colors.darkRed} />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap justify-between">
        {cardData.map((item, index) => (
          <StoreCard
            key={index}
            title={item.title}
            bg={item.bg}
            front={item.front}
          />
        ))}
      </View>
    </View>
  );
};

export default FeaturedStores;
