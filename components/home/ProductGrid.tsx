import React from "react";
import { View, Text } from "react-native";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/context/LanguageContext"; // Add this import

interface Props {
  products: any[];
}

const ProductGrid: React.FC<Props> = ({ products }) => {
  const { t } = useLanguage(); // Add this hook

  return (
    <View className="mt-0.5 bg-white rounded-2xl mx-2">
      <View className="mb-2 px-4 mt-6">
        <Text className="font-semibold text-base text-black">
          {t("featured_products") || "Featured Products"} {/* Use translation */}
        </Text>
        <Text className="text-xs text-black">
          {t("handpicked_for_you") || "Handpicked for you"} {/* Use translation */}
        </Text>
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