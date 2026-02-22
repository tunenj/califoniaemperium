import React from "react";
import { View, Text, TouchableOpacity, ImageBackground, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/constants/color";

interface StoreCardProps {
  title: string;
  bg: string | null | undefined;
  front: string | null | undefined;
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
      style={{ width: '48%' }}
      className="mb-8"
      activeOpacity={0.8}
      onPress={onVisitStore}
    >
      <View className="bg-gray-50 rounded-xl overflow-hidden">
        {/* Store Background Image - Show only if banner exists */}
        {bg ? (
          <ImageBackground
            source={{ uri: bg }}
            style={{ height: 144, width: '100%' }}
            resizeMode="cover"
          >
            {/* Follow Button */}
            <TouchableOpacity
              style={{ position: 'absolute', top: 8, right: 8 }}
              className="w-8 h-8 bg-white/80 rounded-full items-center justify-center"
              onPress={(e) => {
                e.stopPropagation();
                onFollow();
              }}
            >
              <MaterialIcons name="favorite-border" size={18} color={colors.darkRed} />
            </TouchableOpacity>

            {/* Store Logo - Show only if logo exists */}
            {front && (
              <View style={{ position: 'absolute', bottom: 8, left: 8 }}>
                <View className="w-12 h-12 bg-white rounded-lg border-2 border-white overflow-hidden">
                  <Image
                    source={{ uri: front }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}

            {/* Verified Badge */}
            {isVerified && (
              <View style={{ position: 'absolute', bottom: 8, right: 8 }}>
                <View className="bg-green-500 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs">✓ Verified</Text>
                </View>
              </View>
            )}
          </ImageBackground>
        ) : (
          <View style={{ height: 144, width: '100%' }} className="bg-gray-200">
            {/* Follow Button */}
            <TouchableOpacity
              style={{ position: 'absolute', top: 8, right: 8 }}
              className="w-8 h-8 bg-white/80 rounded-full items-center justify-center"
              onPress={(e) => {
                e.stopPropagation();
                onFollow();
              }}
            >
              <MaterialIcons name="favorite-border" size={18} color={colors.darkRed} />
            </TouchableOpacity>

            {/* Store Logo - Show only if logo exists */}
            {front ? (
              <View style={{ position: 'absolute', bottom: 8, left: 8 }}>
                <View className="w-12 h-12 bg-white rounded-lg border-2 border-white overflow-hidden">
                  <Image
                    source={{ uri: front }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            ) : (
              <View style={{ position: 'absolute', bottom: 8, left: 8 }}>
                <View className="w-12 h-12 bg-gray-300 rounded-lg items-center justify-center">
                  <Text className="text-gray-600 text-xs">No Logo</Text>
                </View>
              </View>
            )}

            {/* Verified Badge */}
            {isVerified && (
              <View style={{ position: 'absolute', bottom: 8, right: 8 }}>
                <View className="bg-green-500 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs">✓ Verified</Text>
                </View>
              </View>
            )}
          </View>
        )}

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