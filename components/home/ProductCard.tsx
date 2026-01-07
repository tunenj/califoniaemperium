import React from 'react';
import { View, Text, Image } from 'react-native';

interface Props {
  item: any;
}

const ProductCard: React.FC<Props> = ({ item }) => {
  return (
    <View className="bg-white w-[48%] rounded-xl mb-4 shadow">
      <Image
        source={item.image}
        className="w-full h-32 rounded-t-xl"
        resizeMode="contain"
      />

      <View className="p-3">
        <Text className="font-semibold text-sm">
          {item.title}
        </Text>

        <View className="flex-row items-center mt-1">
          <Text className="text-yellow-500 text-xs">
            ★ {item.rating}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-red-600 font-bold">
            {item.price}
          </Text>
          <Text className="text-xs text-gray-400">
            🛒
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ProductCard;
