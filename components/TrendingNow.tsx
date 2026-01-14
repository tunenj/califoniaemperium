import React from "react";
import { View, Text } from "react-native";
import ProductCard from "./home/ProductCard";

interface Props {
  products: any[];
}

const TrendingNow: React.FC<Props> = ({ products }) => {
  return (
    <View className="mt-2 bg-white rounded-2xl mx-2">
      {/* Header */}
      <View className="mb-2 px-4 mt-6">
        <Text className="font-semibold text-base text-black">Trending Now</Text>
        <Text className="text-xs text-black">Best sellers this week</Text>
      </View>

      {/* Grid layout instead of scroll */}
      <View className="flex-row flex-wrap justify-between px-4 mt-4">
        {products.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
};

export default TrendingNow;
