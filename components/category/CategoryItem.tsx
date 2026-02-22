import React from "react";
import { View, Text, Image, TouchableOpacity, ImageSourcePropType, StyleProp, ViewStyle } from "react-native";
import { useLanguage } from "@/context/LanguageContext";

type CategoryItemProps = {
  label: string;
  image: { uri: string } | ImageSourcePropType | null;
  price?: string;
  discount?: number;
  productId?: string;
  style?: StyleProp<ViewStyle>;
};

const CategoryItem = ({ label, image, price, discount, productId, style }: CategoryItemProps) => {
  const { t } = useLanguage();

  const handlePress = () => {
    if (productId) {
      console.log('Navigate to product:', productId);
      // Add navigation logic here
    }
  };

  const formatPrice = (priceValue?: string) => {
    if (!priceValue) return '';
    const numPrice = parseFloat(priceValue);
    return `₦${numPrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      style={style}
    >
      <View className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        {/* Product Image Container */}
        <View className="relative">
          {image ? (
            <Image 
              source={image} 
              className="w-full h-28" 
              resizeMode="cover" 
            />
          ) : (
            <View className="w-full h-28 bg-gray-100 items-center justify-center">
              <Text className="text-gray-400 text-xs">{t('no_image') || 'No Image'}</Text>
            </View>
          )}
          
          {/* Discount Badge */}
          {discount && discount > 0 && (
            <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded">
              <Text className="text-white text-xs font-bold">
                -{discount}%
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="p-2">
          <Text 
            className="text-xs text-gray-800 font-medium mb-1" 
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
          
          {price && (
            <Text className="text-sm font-bold text-red-600">
              {formatPrice(price)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryItem;