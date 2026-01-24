// app/(customer)/cart.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput, SafeAreaView
} from 'react-native';

import { useRouter } from 'expo-router';
import { ChevronLeft, Trash2, ShoppingCart } from 'lucide-react-native';
import { LinearGradient } from "expo-linear-gradient";
import { useCart } from '../../context/CartContext';
import { useLanguage } from '@/context/LanguageContext'; // Add import

export default function CartScreen() {
  const router = useRouter();
  const { t } = useLanguage(); // Add hook
  
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    moveToSaved,
    getCartTotal,
    savedItems,
    restoreFromSaved,
    removeFromSaved,
    getItemCount,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Totals
  const shippingFee = items.length > 0 ? 4000 : 0;
  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.075);
  const total = Math.max(0, subtotal + shippingFee + tax - appliedDiscount);

  // Checkout
  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert(
        t('empty_cart'),
        t('add_items_before_checkout'),
        [
          { text: t('continue_shopping'), onPress: () => router.push('/(vendor)/dashboard') },
          { text: t('ok'), style: 'cancel' },
        ]
      );
      return;
    }
    router.push('/checkout');
  };

  // Promo code
  const applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      Alert.alert(t('error'), t('please_enter_promo_code'));
      return;
    }

    const validCodes: Record<string, number> = {
      SAVE10: 0.1,
      WELCOME20: 0.2,
      FREESHIP: shippingFee,
    };

    if (!(code in validCodes)) {
      Alert.alert(t('invalid_code'), t('promo_code_invalid_expired'));
      return;
    }

    const discount = validCodes[code];
    const discountAmount =
      discount < 1 ? Math.round(subtotal * discount) : discount;

    setAppliedDiscount(discountAmount);

    Alert.alert(
      t('success'),
      t('promo_code_applied_saved', { amount: discountAmount.toLocaleString() })
    );
  };

  // Clear cart
  const handleClearCart = () => {
    Alert.alert(
      t('clear_cart'),
      t('remove_all_items_confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('clear_all'), style: 'destructive', onPress: clearCart },
      ]
    );
  };

  // Empty cart
  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LinearGradient
          colors={["#B13239", "#4D0812"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 44, width: "100%" }}
        />
        <View className="flex-1 px-4">
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <ShoppingCart size={22} color="#C62828"/>
              <Text className="text-xl font-bold text-secondary ml-2">
                {t('your_cart')}
              </Text>
            </View>

            <View className="w-10" />
          </View>

          <View className="flex-1 justify-center items-center px-8">
            <View className="w-48 h-48 bg-gray-100 rounded-full items-center justify-center mb-8">
              <Text className="text-6xl">🛒</Text>
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-3">
              {t('cart_is_empty')}
            </Text>
            <Text className="text-gray-500 text-center mb-8">
              {t('no_items_added_yet')}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(customer)/main')}
              className="bg-secondary rounded-full px-8 py-3 w-full"
            >
              <Text className="text-white font-semibold text-lg text-center">
                {t('start_shopping')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 pt-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              {t('your_cart')} ({getItemCount()})
            </Text>
            <TouchableOpacity onPress={handleClearCart} className="p-2">
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Cart Items */}
          {items.map((item) => (
            <View
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-4 border border-gray-100"
            >
              <View className="flex-row justify-between mb-3">
                <Text className="font-medium text-gray-800">
                  {item.storeName}
                </Text>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Text className="text-red-500 text-sm">{t('remove')}</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row">
                <Image source={item.image} className="w-24 h-24 rounded-xl" />
                <View className="flex-1 ml-4">
                  <Text className="font-semibold text-gray-900 mb-1">
                    {item.productName}
                  </Text>

                  {(item.color || item.size) && (
                    <Text className="text-gray-500 text-sm mb-2">
                      {item.color && `${t('color')}: ${item.color} `}
                      {item.size && `• ${t('size')}: ${item.size}`}
                    </Text>
                  )}

                  <Text className="font-bold text-lg mb-4">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </Text>

                  <View className="flex-row items-center">
                    <View className="flex-row bg-gray-50 rounded-lg p-1">
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Text className="text-lg">-</Text>
                      </TouchableOpacity>

                      <Text className="mx-4 font-semibold">
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Text className="text-lg">+</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => moveToSaved(item.id)}
                      className="ml-auto"
                    >
                      <Text className="text-blue-500 text-sm">
                        {t('save_for_later')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Promo Code */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="font-medium mb-3">{t('have_promo_code')}</Text>
            <View className="flex-row">
              <TextInput
                placeholder={t('enter_promo_code')}
                value={promoCode}
                onChangeText={setPromoCode}
                className="flex-1 border border-gray-300 rounded-l-xl px-4 py-3"
              />
              <TouchableOpacity
                onPress={applyPromoCode}
                className="bg-gray-900 px-6 rounded-r-xl justify-center"
              >
                <Text className="text-white">{t('apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary */}
          <View className="bg-white rounded-2xl p-5 mb-8 border border-gray-100">
            <View className="flex-row justify-between mb-3">
              <Text>{t('subtotal')}</Text>
              <Text>₦{subtotal.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text>{t('shipping')}</Text>
              <Text>₦{shippingFee.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text>{t('tax')}</Text>
              <Text>₦{tax.toLocaleString()}</Text>
            </View>

            <View className="h-px bg-gray-200 my-4" />

            <View className="flex-row justify-between mb-6">
              <Text className="text-xl font-bold">{t('total')}</Text>
              <Text className="text-2xl font-bold text-red-600">
                ₦{total.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCheckout}
              className="bg-red-500 rounded-2xl py-4 items-center"
            >
              <Text className="text-white font-bold text-lg">
                {t('proceed_to_checkout')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}