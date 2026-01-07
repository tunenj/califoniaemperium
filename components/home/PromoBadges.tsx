import React from 'react';
import { View, Text } from 'react-native';
import { Truck, Zap } from 'lucide-react-native';

const PromoBadges = () => {
  return (
    <View className="flex-row px-4 justify-between">
      <View className="flex-row items-center bg-white p-3 rounded-xl w-[48%] shadow">
        <Truck size={20} color="#ef4444" />
        <View className="ml-2">
          <Text className="font-semibold text-sm">Free Shipping</Text>
          <Text className="text-xs text-gray-500">
            Min ₦20000 order
          </Text>
        </View>
      </View>

      <View className="flex-row items-center bg-white p-3 rounded-xl w-[48%] shadow">
        <Zap size={20} color="#ef4444" />
        <View className="ml-2">
          <Text className="font-semibold text-sm">Super Deals</Text>
          <Text className="text-xs text-gray-500">
            View more
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PromoBadges;
