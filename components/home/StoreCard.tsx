import React from "react";
import { View, Text, TouchableOpacity, ImageBackground, Image } from "react-native";
import { Heart } from "lucide-react-native";
import { colors } from "@/constants/color";

interface StoreCardProps {
  title: string;
  bg: any;
  front: any;
  rating?: string;
  sales?: number;
  isVerified?: boolean;
  onVisitStore: () => void;
  onFollow: () => void;
}

const StoreCard: React.FC<StoreCardProps> = ({
  title,
  bg,
  front,
  rating = "0.0",
  sales = 0,
  isVerified = false,
  onVisitStore,
  onFollow,
}) => {
  // Format sales number
  const formatSales = (salesNum: number) => {
    if (salesNum >= 1000) {
      return `${(salesNum / 1000).toFixed(1)}k sales`;
    }
    return `${salesNum} sales`;
  };

  return (
    <TouchableOpacity
      className="w-[48%] mb-8"
      activeOpacity={0.8}
      onPress={onVisitStore}
    >
      <View className="bg-gray-50 rounded-xl overflow-hidden">
        {/* Store Background Image */}
        <ImageBackground
          source={bg}
          className="h-36 w-full items-center justify-center"
          resizeMode="cover"
        >
          {/* Follow Button */}
          <TouchableOpacity
            className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full items-center justify-center"
            onPress={(e) => {
              e.stopPropagation();
              onFollow();
            }}
          >
            <Heart size={18} color={colors.darkRed} />
          </TouchableOpacity>

          {/* Store Logo */}
          <View className="w-12 h-12 mt-4 mb-6">
            <Image
              source={front}
              className="rounded-xl relative -bottom-12 -left-14 z-10"
              resizeMode="contain"
            />
          </View>

          {/* Verified Badge */}
          {isVerified && (
            <View className="absolute bottom-2 right-2 bg-green-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs">✓ Verified</Text>
            </View>
          )}
        </ImageBackground>

        {/* Store Info */}
        <View className="p-3">
          <Text 
            className="text-sm font-semibold text-gray-800 mb-1" 
            numberOfLines={1}
          >
            {title}
          </Text>
          
          {/* Rating and Sales */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-yellow-500 text-xs">★</Text>
              <Text className="text-xs text-gray-600 ml-1">{rating}</Text>
            </View>
            
            {sales > 0 && (
              <Text className="text-xs text-gray-500">
                {formatSales(sales)}
              </Text>
            )}
          </View>
          
          {/* Visit Store Button */}
          <TouchableOpacity
            className="mt-2 bg-darkRed py-2 rounded-lg"
            onPress={onVisitStore}
          >
            <Text className="text-white text-xs text-center font-medium">
              Visit Store
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StoreCard;