import React from "react";
import { View, Text, Image, TouchableOpacity, ImageSourcePropType, StyleProp, ViewStyle } from "react-native";

type CategoryItemProps = {
  label: string;
  image: ImageSourcePropType;
  style?: StyleProp<ViewStyle>; // <-- add this line
};

const CategoryItem = ({ label, image }: CategoryItemProps) => {
  return (
    <TouchableOpacity className="items-center mr-4">
      <View className="w-16 h-16 rounded-full items-center justify-center">
        <Image source={image} className="w-16 h-16" resizeMode="contain" />
      </View>
      <Text className="text-sm mt-1 text-gray-700">{label}</Text>
    </TouchableOpacity>
  );
};

export default CategoryItem;
