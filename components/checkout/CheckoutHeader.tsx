import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CheckoutHeader = () => {
  const router = useRouter();

  return (
    <View className="bg-white px-4 py-4 flex-row items-center justify-between pt-12">
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
        <AntDesign name="arrow-left" size={22} color="#00000" />
      </TouchableOpacity>

      <View className="flex-row items-center">
        <Feather name="shopping-cart" size={18} color="#00000" />
        <Text className="text-black font-bold ml-2 text-lg">Checkout</Text>
      </View>

      <View style={{ width: 22 }} />
    </View>
  );
};

export default CheckoutHeader;
