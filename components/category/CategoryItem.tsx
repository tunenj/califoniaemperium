import React from "react";
import { View, Text, Image, TouchableOpacity, ImageSourcePropType, StyleProp, ViewStyle } from "react-native";
import { useLanguage } from "@/context/LanguageContext"; // Add import

type CategoryItemProps = {
  label: string;
  image: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
};

const CategoryItem = ({ label, image }: CategoryItemProps) => {
  const { t } = useLanguage(); // Add hook

  return (
    <TouchableOpacity className="items-center mr-4">
      <View className="w-16 h-16 rounded-full items-center justify-center">
        <Image source={image} className="w-16 h-16" resizeMode="contain" />
      </View>
      <Text className="text-sm mt-1 text-gray-700">
        {t(label) || label || ' '}  {/* Fallback to original or empty */}
      </Text>
    </TouchableOpacity>
  );
};

export default CategoryItem;