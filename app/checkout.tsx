import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';

type CartItem = {
  id: string;
  storeName: string;
  productName: string;
  price: string;
  quantity: number;
  image: any;
};

const cartItems: CartItem[] = [
  {
    id: '1',
    storeName: 'Orma Store',
    productName: 'Modern Ceramic Vase',
    price: '₦15,000',
    quantity: 1,
    image: require('../assets/images/vase.png'),
  },
  {
    id: '2',
    storeName: 'TechHub Store',
    productName: 'Modern Ceramic Vase',
    price: '₦15,000',
    quantity: 1,
    image: require('../assets/images/vase.png'),
  },
  {
    id: '3',
    storeName: 'Fashion Forward Store',
    productName: 'Set Ceramic Vase',
    price: '₦15,000',
    quantity: 1,
    image: require('../assets/images/vase.png'),
  },
];

function CartScreen() {
  const router = useRouter();
  const [items, setItems] = useState(cartItems);
  const { t } = useLanguage();

  const increaseQuantity = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const subtotal =
    items.reduce(
      (sum, item) =>
        sum +
        parseInt(item.price.replace('₦', '').replace(',', '')) *
          item.quantity,
      0
    );

  const shipping = 4000;
  const total = subtotal + shipping;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2"
          >
            <Text className="text-red-500 text-lg font-semibold">
              {t('cancel')}
            </Text>
          </TouchableOpacity>

          <Text className="text-xl font-bold text-gray-900">
            {t('your_cart')}
          </Text>

          <View className="w-12" />
        </View>

        {/* Items */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          {items.map((item) => (
            <View
              key={item.id}
              className="bg-gray-50 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                <Text className="text-sm font-medium text-gray-700">
                  {item.storeName}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Image
                  source={item.image}
                  className="w-20 h-24 rounded-lg mr-4"
                  resizeMode="cover"
                />

                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {item.productName}
                  </Text>

                  <Text className="text-lg font-bold text-gray-900 mb-4">
                    {item.price}
                  </Text>

                  <View className="flex-row items-center justify-between bg-white rounded-lg p-2 border border-gray-200">
                    <TouchableOpacity
                      onPress={() => decreaseQuantity(item.id)}
                      className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                    >
                      <Text className="text-gray-600 font-semibold">-</Text>
                    </TouchableOpacity>

                    <Text className="text-lg font-bold text-gray-900 mx-4">
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() => increaseQuantity(item.id)}
                      className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                    >
                      <Text className="text-gray-600 font-semibold">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Totals */}
        <View className="bg-white rounded-2xl p-5 mt-6 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-end mb-3">
            <Text className="text-sm text-gray-500">{t('shipping')}</Text>
            <Text className="text-lg font-semibold text-gray-900">
              ₦4,000
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-semibold text-gray-700">
              {t('subtotal')}
            </Text>
            <Text className="text-xl font-bold text-gray-900">
              ₦{subtotal.toLocaleString()}
            </Text>
          </View>

          <View className="h-px bg-gray-200 mb-4" />

          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">
              {t('total')}
            </Text>
            <Text className="text-2xl font-bold text-red-500">
              ₦{total.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity className="bg-red-500 rounded-2xl py-4 items-center">
            <Text className="text-white text-lg font-semibold">
              {t('checkout')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default CartScreen;
