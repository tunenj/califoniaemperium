import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface Props {
  title: string;
  bg: any;
  front: any;
  onVisitStore?: () => void;
  onFollow?: () => void;
}

const StoreCard: React.FC<Props> = ({ title, bg, front, onVisitStore, onFollow }) => {
  return (
    <View className="bg-white w-[48%] rounded-xl mb-2 shadow relative overflow-hidden">
      {/* Background image */}
      <Image
        source={bg}
        className="w-full h-24 rounded-t-xl"
        resizeMode="cover"
      />

      {/* Front image */}
      <Image
        source={front}
        className="w-14 h-14 rounded-xl relative bottom-4 left-3 z-10"
        resizeMode="cover"
      />

      <View className="p-4 pt-3">
        <Text className="font-semibold">{title}</Text>

        <Text className="text-xs text-gray-500 mt-1">
          Your one-stop shop for quality items
        </Text>

        <View className="flex-row items-center mt-2">
          <Text className="text-yellow-500 text-xs">★ 4.8</Text>
          <Text className="text-xs text-gray-400 ml-2">2,240</Text>
        </View>

        {/* Clickable buttons */}
        <View className="flex-row justify-between mt-3 gap-1">
          <TouchableOpacity
            className="bg-darkRed px-3 py-1 rounded-full"
            onPress={onVisitStore}
          >
            <TouchableOpacity
              className="bg-darkRed px-2 py-1 rounded-full"
              onPress={onVisitStore}
            >
              <Text className="text-xs text-white">Visit Store</Text>
            </TouchableOpacity>

          </TouchableOpacity>

          <TouchableOpacity
            className="bg-lightPink px-3 py-1 rounded-full"
            onPress={onFollow}
          >
            <Text className="text-xs text-secondary pt-1">Follow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default StoreCard;
