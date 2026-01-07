import React from 'react';
import { View, Text } from 'react-native';

const PromoBanner = () => {
  return (
    <View className="mx-4 my-6 bg-yellow-400 rounded-xl p-4 flex-row justify-between items-center">
      <View>
        <Text className="font-bold text-base">
          Up to 50% Off
        </Text>
        <Text className="text-xs">
          On selected products
        </Text>
      </View>

      <Text className="bg-black text-white px-4 py-2 rounded-full text-xs">
        Shop Now
      </Text>
    </View>
  );
};

export default PromoBanner;
