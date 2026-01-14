import React from 'react';
import { View, Text } from 'react-native';
import { Truck, Zap } from 'lucide-react-native';
import { colors } from "@/constants/color";

const PromoBadges = () => {
  return (
    <View className="flex-row px-4 justify-between pt-4">
      <View className="flex-row items-center p-3 rounded-xl w-[48%]">
        <Truck size={25} color={colors.darkRed} />
        <View className="ml-2">
          <Text className="font-semibold text-lg text-darkRed">Free Shipping</Text>
          <Text className="text-xs text-darkRed">
            Buy ₦102,000 more to get
          </Text>
        </View>
      </View>

      <View className="flex-row items-center p-3 w-[48%] ml-4">
        <Zap size={25} color={colors.darkRed} />
        <View className="ml-2">
          <Text className="font-semibold text-lg text-darkRed">Super Deals</Text>
          <Text className="text-xs text-darkRed">
            View more
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PromoBadges;
