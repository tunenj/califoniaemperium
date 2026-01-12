import React from "react";
import { View, Text } from "react-native";
import ProductCard from "./ProductCard";

interface Props {
  products: any[];
}

const ProductGrid: React.FC<Props> = ({ products }) => {
  return (
    <View className="mt-0.5 bg-white rounded-2xl mx-2">
      <View className="mb-2 px-4 mt-6">
        <Text className="font-semibold text-base text-black">Featured Products</Text>
        <Text className="text-xs text-black">Handpicked for you</Text>
      </View>
      <View className="flex-row flex-wrap justify-between px-4 mt-4">
        {products.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
};

export default ProductGrid;
