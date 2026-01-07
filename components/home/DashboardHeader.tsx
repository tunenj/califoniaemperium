import React from 'react';
import { View, Text, Image, TextInput } from 'react-native';
import images from '@/constants/images';

const DashboardHeader = () => {
  return (
    <View className="bg-red-700 px-4 pt-6 pb-4 rounded-b-3xl">
      {/* Greeting */}
      <Text className="text-white text-lg font-semibold">
        Good evening 👋
      </Text>
      <Text className="text-white text-sm opacity-90">
        What are you shopping today?
      </Text>

      {/* Search */}
      <View className="mt-4 bg-white rounded-xl px-4 py-3">
        <TextInput
          placeholder="Search products"
          className="text-gray-700"
        />
      </View>

      {/* Banner */}
      <Image
        source={images.banner}
        className="w-full h-36 mt-4 rounded-xl"
        resizeMode="cover"
      />
    </View>
  );
};

export default DashboardHeader;
