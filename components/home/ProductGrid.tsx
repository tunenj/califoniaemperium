import React from "react";
import { View } from "react-native";
import ProductCard from "./ProductCard";

interface Props {
  products: any[];
}

const ProductGrid: React.FC<Props> = ({ products }) => {
  return (
    <View className="flex-row flex-wrap justify-between px-4 mt-4">
      {products.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </View>
  );
};

export default ProductGrid;
