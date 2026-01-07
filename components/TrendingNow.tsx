import React from "react";
import { View, Text, ScrollView } from "react-native";
import ProductCard from "./home/ProductCard";

interface Props {
  products: any[];
}

const TrendingNow: React.FC<Props> = ({ products }) => {
  return (
    <View className="mt-4">
      <View className="flex-row justify-between px-4 mb-3">
        <Text className="font-semibold text-base">Trending Now</Text>
        <Text className="text-red-500 text-sm">View more</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-4"
      >
        {products.map((item) => (
          <View key={item.id} className="mr-4 w-48">
            <ProductCard item={item} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default TrendingNow;
