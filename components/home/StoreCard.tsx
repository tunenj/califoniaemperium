import React from 'react';
import { View, Text, Image } from 'react-native';

interface Props {
  title: string;
  bg: any;
  front: any;
}

const StoreCard: React.FC<Props> = ({ title, bg, front }) => {
  return (
    <View className="bg-white w-[48%] rounded-xl mb-4 shadow relative overflow-hidden">

      {/* Background image */}
      <Image
        source={bg}
        className="w-full h-24 rounded-t-xl"
        resizeMode="cover"
      />

      {/* Front image */}
      <Image
        source={front}
        className="w-16 h-16 rounded-xl absolute bottom-28 left-3 z-10"
        resizeMode="cover"
      />

      <View className="p-6 pt-6">
        <Text className="font-semibold">{title}</Text>

        <Text className="text-xs text-gray-500 mt-1">
          Your one-stop shop for quality items
        </Text>

        <View className="flex-row items-center mt-2">
          <Text className="text-yellow-500 text-xs">★ 4.8</Text>
          <Text className="text-xs text-gray-400 ml-2">2,240</Text>
        </View>

        <View className="flex-row justify-between mt-3">
          <Text className="text-xs bg-red-100 text-red-500 px-3 py-1 rounded-full">
            Visit Store
          </Text>
          <Text className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            Follow
          </Text>
        </View>
      </View>
    </View>
  );
};

export default StoreCard;
