import React from "react";
import { View, Text } from "react-native";
import StoreCard from "./StoreCard";
import images from "@/constants/images";

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
    <View className="mt-6 px-4">
      <View className="flex-row justify-between mb-3">
        <View>
          <Text className="font-semibold text-base">Featured Stores</Text>
          <Text className="text-xs text-gray-500">
            Discover top-rated vendors
          </Text>
        </View>

        <Text className="text-red-500 text-sm">View more</Text>
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
