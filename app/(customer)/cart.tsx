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


export default function CartScreen() {
  const router = useRouter();
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
        'Empty Cart',
        'Please add items to your cart before checking out.',
        [
          { text: 'Continue Shopping', onPress: () => router.push('/(tabs)/home') },
          { text: 'OK', style: 'cancel' },
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
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    const validCodes: Record<string, number> = {
      SAVE10: 0.1,
      WELCOME20: 0.2,
      FREESHIP: shippingFee,
    };

    if (!(code in validCodes)) {
      Alert.alert('Invalid Code', 'The promo code you entered is invalid or expired.');
      return;
    }

    const discount = validCodes[code];
    const discountAmount =
      discount < 1 ? Math.round(subtotal * discount) : discount;

    setAppliedDiscount(discountAmount);

    Alert.alert(
      'Success',
      `Promo code applied! Saved ₦${discountAmount.toLocaleString()}`
    );
  };

  // Clear cart
  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearCart },
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
                Your Cart
              </Text>
            </View>

            <View className="w-10" />
          </View>

          <View className="flex-1 justify-center items-center px-8">
            <View className="w-48 h-48 bg-gray-100 rounded-full items-center justify-center mb-8">
              <Text className="text-6xl">🛒</Text>
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Your cart is empty
            </Text>
            <Text className="text-gray-500 text-center mb-8">
              Looks like you haven&apos;t added any items yet.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(customer)/home')}
              className="bg-secondary rounded-full px-8 py-3 w-full"
            >
              <Text className="text-white font-semibold text-lg text-center">
                Start Shopping
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
              Your Cart ({getItemCount()})
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
                  <Text className="text-red-500 text-sm">Remove</Text>
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
                      {item.color && `Color: ${item.color} `}
                      {item.size && `• Size: ${item.size}`}
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
                        Save for later
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Promo Code */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="font-medium mb-3">Have a promo code?</Text>
            <View className="flex-row">
              <TextInput
                placeholder="Enter promo code"
                value={promoCode}
                onChangeText={setPromoCode}
                className="flex-1 border border-gray-300 rounded-l-xl px-4 py-3"
              />
              <TouchableOpacity
                onPress={applyPromoCode}
                className="bg-gray-900 px-6 rounded-r-xl justify-center"
              >
                <Text className="text-white">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary */}
          <View className="bg-white rounded-2xl p-5 mb-8 border border-gray-100">
            <View className="flex-row justify-between mb-3">
              <Text>Subtotal</Text>
              <Text>₦{subtotal.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text>Shipping</Text>
              <Text>₦{shippingFee.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text>Tax</Text>
              <Text>₦{tax.toLocaleString()}</Text>
            </View>

            <View className="h-px bg-gray-200 my-4" />

            <View className="flex-row justify-between mb-6">
              <Text className="text-xl font-bold">Total</Text>
              <Text className="text-2xl font-bold text-red-600">
                ₦{total.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCheckout}
              className="bg-red-500 rounded-2xl py-4 items-center"
            >
              <Text className="text-white font-bold text-lg">
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
