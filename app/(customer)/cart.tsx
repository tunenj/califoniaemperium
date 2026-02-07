// app/(customer)/cart.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Trash2, ShoppingCart, Heart } from 'lucide-react-native';
import { LinearGradient } from "expo-linear-gradient";
import { useCart } from '../../context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

export default function CartScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getCartTotal,
    getItemCount,
    syncing: cartSyncing,
  } = useCart();

  const {
    addToWishlist,
    syncing: wishlistSyncing,
    isInWishlist,
  } = useWishlist();

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [updatingItems, setUpdatingItems] = useState<{ [key: string]: boolean }>({});
  const [removingItems, setRemovingItems] = useState<{ [key: string]: boolean }>({});
  const [savingItems, setSavingItems] = useState<{ [key: string]: boolean }>({});

  // Totals
  const shippingFee = items.length > 0 ? 4000 : 0;
  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.075);
  const total = Math.max(0, subtotal + shippingFee + tax - appliedDiscount);

  // Helper function to validate UUID
  const isValidUUID = (uuid: string): boolean => {
    if (!uuid || typeof uuid !== 'string') return false;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid.trim());
  };

  // Handle quantity update
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      const success = await updateQuantity(itemId, newQuantity);

      if (!success) {
        Alert.alert(t('error') || 'Error', t('failed_to_update_quantity') || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert(t('error') || 'Error', t('failed_to_update_quantity') || 'Failed to update quantity');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId: string) => {
    try {
      setRemovingItems(prev => ({ ...prev, [itemId]: true }));

      Alert.alert(
        t('remove_item') || 'Remove Item',
        t('remove_item_confirmation') || 'Are you sure you want to remove this item?',
        [
          { text: t('cancel') || 'Cancel', style: 'cancel' },
          {
            text: t('remove') || 'Remove',
            style: 'destructive',
            onPress: async () => {
              const success = await removeItem(itemId);
              if (!success) {
                Alert.alert(t('error') || 'Error', t('failed_to_remove_item') || 'Failed to remove item');
              }
            }
          },
        ]
      );
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert(t('error') || 'Error', t('failed_to_remove_item') || 'Failed to remove item');
    } finally {
      setRemovingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Save item to wishlist - FIXED: addToWishlist expects a string, not an object
  const handleSaveForLater = async (itemId: string, cartItem: any) => {
    if (!isAuthenticated) {
      Alert.alert(
        t('sign_in_required') || 'Sign In Required',
        t('sign_in_to_save_items') || 'Please sign in to save items to your wishlist',
        [
          { text: t('cancel') || 'Cancel', style: 'cancel' },
          {
            text: t('sign_in') || 'Sign In',
            onPress: () => router.push('/(auth)/signIn')
          }
        ]
      );
      return;
    }

    try {
      setSavingItems(prev => ({ ...prev, [itemId]: true }));

      // Get product ID from cart item
      const productId = cartItem.productId;

      console.log('🔄 Attempting to save to wishlist:', {
        itemId,
        productId,
        productName: cartItem.productName,
        isUUID: isValidUUID(productId),
        productIdType: typeof productId,
      });

      // Validate product ID
      if (!productId) {
        Alert.alert('Error', 'Product ID is missing.');
        setSavingItems(prev => ({ ...prev, [itemId]: false }));
        return;
      }

      // Ensure it's a string
      const productIdStr = String(productId).trim();

      // Check if it's a valid UUID
      if (!isValidUUID(productIdStr)) {
        console.error('❌ Invalid UUID format:', productIdStr);

        // Try to extract UUID if it's embedded in a longer string
        const uuidMatch = productIdStr.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        if (uuidMatch) {
          const extractedUuid = uuidMatch[0];
          console.log('✅ Extracted UUID:', extractedUuid);

          // Use the extracted UUID
          return await saveToWishlistWithId(itemId, cartItem, extractedUuid);
        } else {
          Alert.alert(
            'Invalid Product ID',
            `The product ID "${productIdStr.substring(0, 50)}..." is not a valid UUID format.\n\nPlease contact support.`,
            [{ text: 'OK' }]
          );
          setSavingItems(prev => ({ ...prev, [itemId]: false }));
          return;
        }
      }

      // If it's already a valid UUID
      await saveToWishlistWithId(itemId, cartItem, productIdStr);

    } catch (error) {
      console.error('❌ Error in handleSaveForLater:', error);
      Alert.alert('Error', 'Failed to save item to wishlist.');
      setSavingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Helper function to save with validated UUID - FIXED: Pass string to addToWishlist
  const saveToWishlistWithId = async (itemId: string, cartItem: any, productId: string) => {
    try {
      console.log('✅ Valid UUID confirmed:', productId);

      // FIX: addToWishlist expects a STRING parameter (productId), not an object
      console.log('📤 Calling addToWishlist with string productId:', productId);

      // Check if already in wishlist first
      try {
        const alreadyInWishlist = await isInWishlist(productId);
        if (alreadyInWishlist) {
          Alert.alert(
            'Already Saved',
            'This item is already in your wishlist.',
            [
              {
                text: 'View Wishlist',
                onPress: () => router.push('/(customer)/wishlist')
              },
              { text: 'OK', style: 'cancel' }
            ]
          );
          setSavingItems(prev => ({ ...prev, [itemId]: false }));
          return;
        }
      } catch (checkError) {
        console.warn('Could not check wishlist status:', checkError);
        // Continue anyway
      }

      // FIXED: Pass just the productId string to addToWishlist
      const result = await addToWishlist(productId);

      console.log('📥 API Response:', result);

      if (result.success) {
        // Success! Remove from cart
        try {
          await removeItem(itemId);
        } catch (removeError) {
          console.warn('Could not remove from cart:', removeError);
          // Still show success message
        }

        Alert.alert(
          'Saved Successfully!',
          `${cartItem.productName} has been added to your wishlist.`,
          [
            {
              text: 'View Wishlist',
              onPress: () => router.push('/(customer)/wishlist')
            },
            {
              text: 'Continue Shopping',
              style: 'cancel'
            }
          ]
        );
      } else {
        // API returned error
        let errorMsg = result.message || 'Failed to save to wishlist';

        // Provide helpful error messages
        if (errorMsg.includes('400') || errorMsg.includes('invalid')) {
          errorMsg = `API Validation Error:\n\nProduct ID: ${productId}\n\nPlease ensure this is a valid product UUID.`;
        }

        Alert.alert('Error', errorMsg);
      }

    } catch (error: unknown) {
      console.error('❌ API Call Error:', error);

      let errorMessage = 'Network error occurred.';

      // Extract detailed error info using type guards
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        console.log('Response status:', apiError.response?.status);
        console.log('Response data:', apiError.response?.data);

        if (apiError.response?.data?.error) {
          const apiErr = apiError.response.data.error;
          errorMessage = `API Error (${apiError.response.status}):\n\n`;

          if (apiErr.details) {
            errorMessage += `Details: ${apiErr.details}`;
          } else if (apiErr.message) {
            errorMessage += `Message: ${apiErr.message}`;
          } else {
            errorMessage += JSON.stringify(apiErr, null, 2);
          }
        } else {
          errorMessage = `Server Error (${apiError.response.status}): ${JSON.stringify(apiError.response.data, null, 2)}`;
        }
      } else if (error && typeof error === 'object' && 'request' in error) {
        errorMessage = 'No response received from server.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      Alert.alert('API Error', errorMessage);
    } finally {
      setSavingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Checkout
  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert(
        t('empty_cart') || 'Empty Cart',
        t('add_items_before_checkout') || 'Please add items to your cart before checking out',
        [
          { text: t('continue_shopping') || 'Continue Shopping', onPress: () => router.push('/(vendor)/dashboard') },
          { text: t('ok') || 'OK', style: 'cancel' },
        ]
      );
      return;
    }

    if (cartSyncing || wishlistSyncing) {
      Alert.alert(
        t('please_wait') || 'Please Wait',
        t('cart_is_updating_please_wait') || 'Your cart is being updated, please wait...',
        [{ text: t('ok') || 'OK' }]
      );
      return;
    }

    router.push('/checkout');
  };

  // Promo code
  const applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      Alert.alert(t('error') || 'Error', t('please_enter_promo_code') || 'Please enter a promo code');
      return;
    }

    const validCodes: Record<string, number> = {
      SAVE10: 0.1,
      WELCOME20: 0.2,
      FREESHIP: shippingFee,
    };

    if (!(code in validCodes)) {
      Alert.alert(t('invalid_code') || 'Invalid Code', t('promo_code_invalid_expired') || 'Promo code is invalid or expired');
      return;
    }

    const discount = validCodes[code];
    const discountAmount =
      discount < 1 ? Math.round(subtotal * discount) : discount;

    setAppliedDiscount(discountAmount);

    Alert.alert(
      t('success') || 'Success',
      `${t('promo_code_applied_saved') || 'Promo code applied! You saved'} ₦${discountAmount.toLocaleString()}`
    );
  };

  // Clear cart
  const handleClearCart = () => {
    Alert.alert(
      t('clear_cart') || 'Clear Cart',
      t('remove_all_items_confirmation') || 'Are you sure you want to remove all items from your cart?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('clear_all') || 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const success = await clearCart();
            if (!success) {
              Alert.alert(t('error') || 'Error', t('failed_to_clear_cart') || 'Failed to clear cart');
            }
          }
        },
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
              <ShoppingCart size={22} color="#C62828" />
              <Text className="text-xl font-bold text-secondary ml-2">
                {t('your_cart') || 'Your Cart'}
              </Text>
            </View>
          </View>

          <View className="flex-1 justify-center items-center px-8">
            <View className="w-48 h-48 bg-gray-100 rounded-full items-center justify-center mb-8">
              <Text className="text-6xl">🛒</Text>
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-3">
              {t('cart_is_empty') || 'Your cart is empty'}
            </Text>
            <Text className="text-gray-500 text-center mb-8">
              {t('no_items_added_yet') || 'No items added yet. Start shopping to add items!'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(customer)/explore')}
              className="bg-secondary rounded-full px-8 py-3 w-full"
            >
              <Text className="text-white font-semibold text-lg text-center">
                {t('start_shopping') || 'Start Shopping'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-6">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 pt-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Text className="text-xl font-bold text-gray-900">
                {t('your_cart') || 'Your Cart'} ({getItemCount()})
              </Text>
              {(cartSyncing || wishlistSyncing) && (
                <ActivityIndicator size="small" color="#DC2626" style={{ marginLeft: 8 }} />
              )}
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handleClearCart}
                className="p-2"
                disabled={cartSyncing || wishlistSyncing}
              >
                <Trash2 size={20} color={(cartSyncing || wishlistSyncing) ? "#9CA3AF" : "#EF4444"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Cart Items */}
          {items.map((item) => {
            const isUpdating = updatingItems[item.id] || false;
            const isRemoving = removingItems[item.id] || false;
            const isSaving = savingItems[item.id] || false;
            const productIdStr = String(item.productId);
            const isValidUuid = isValidUUID(productIdStr);

            return (
              <View
                key={item.id}
                className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 relative"
              >
                {(isRemoving || isSaving) && (
                  <View className="absolute inset-0 bg-white bg-opacity-80 z-10 items-center justify-center rounded-2xl">
                    <ActivityIndicator size="large" color="#DC2626" />
                    <Text className="mt-2 text-gray-600">
                      {isRemoving ? 'Removing item...' : 'Saving to wishlist...'}
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between mb-3">
                  <Text className="font-medium text-gray-800">
                    {item.storeName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(item.id)}
                    disabled={cartSyncing || isRemoving || isSaving}
                  >
                    {isRemoving ? (
                      <ActivityIndicator size="small" color="#DC2626" />
                    ) : (
                      <Text className="text-red-500 text-sm">{t('remove') || 'Remove'}</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View className="flex-row">
                  <View className="w-24 h-24 rounded-xl bg-gray-100 items-center justify-center overflow-hidden">
                    {item.image }
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="font-semibold text-gray-900 mb-1">
                      {item.productName}
                    </Text>

                    {(item.color || item.size) && (
                      <Text className="text-gray-500 text-sm mb-2">
                        {item.color && `${t('color') || 'Color'}: ${item.color} `}
                        {item.size && `• ${t('size') || 'Size'}: ${item.size}`}
                      </Text>
                    )}

                    <Text className="font-bold text-lg mb-4">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </Text>

                    <View className="flex-row items-center">
                      <View className="flex-row bg-gray-50 rounded-lg p-1 items-center">
                        <TouchableOpacity
                          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={cartSyncing || isUpdating || item.quantity <= 1}
                          className={`w-8 h-8 items-center justify-center rounded ${(cartSyncing || isUpdating || item.quantity <= 1)
                              ? 'opacity-50'
                              : ''
                            }`}
                        >
                          <Text className="text-lg text-gray-700">-</Text>
                        </TouchableOpacity>

                        <View className="mx-4 min-w-8 items-center">
                          {isUpdating ? (
                            <ActivityIndicator size="small" color="#DC2626" />
                          ) : (
                            <Text className="font-semibold text-gray-900">
                              {item.quantity}
                            </Text>
                          )}
                        </View>

                        <TouchableOpacity
                          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={cartSyncing || isUpdating}
                          className={`w-8 h-8 items-center justify-center rounded ${(cartSyncing || isUpdating) ? 'opacity-50' : ''
                            }`}
                        >
                          <Text className="text-lg text-gray-700">+</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleSaveForLater(item.id, item)}
                        className="ml-auto flex-row items-center"
                        disabled={cartSyncing || isSaving || !isValidUuid}
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color="#2563EB" />
                        ) : (
                          <>
                            <Heart
                              size={16}
                              color={isValidUuid ? "#2563EB" : "#9CA3AF"}
                              style={{ marginRight: 4 }}
                            />
                            <Text className={`text-sm ${isValidUuid ? 'text-blue-600' : 'text-gray-500'
                              } ${(cartSyncing || isSaving) ? 'opacity-50' : ''}`}>
                              {isValidUuid ? (t('save_for_later') || 'Save for Later') : 'Invalid ID'}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Promo Code */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="font-medium mb-3">{t('have_promo_code') || 'Have a promo code?'}</Text>
            <View className="flex-row">
              <TextInput
                placeholder={t('enter_promo_code') || 'Enter promo code'}
                value={promoCode}
                onChangeText={setPromoCode}
                className="flex-1 border border-gray-300 rounded-l-xl px-4 py-3"
                editable={!cartSyncing}
              />
              <TouchableOpacity
                onPress={applyPromoCode}
                className={`px-6 rounded-r-xl justify-center ${cartSyncing ? 'bg-gray-400' : 'bg-gray-900'
                  }`}
                disabled={cartSyncing}
              >
                <Text className="text-white">{t('apply') || 'Apply'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary */}
          <View className="bg-white rounded-2xl p-5 mb-8 border border-gray-100">
            <View className="flex-row justify-between mb-3">
              <Text>{t('subtotal') || 'Subtotal'}</Text>
              <Text>₦{subtotal.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text>{t('shipping') || 'Shipping'}</Text>
              <Text>₦{shippingFee.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text>{t('tax') || 'Tax'}</Text>
              <Text>₦{tax.toLocaleString()}</Text>
            </View>

            {appliedDiscount > 0 && (
              <View className="flex-row justify-between mb-3">
                <Text className="text-green-600">{t('discount') || 'Discount'}</Text>
                <Text className="text-green-600">-₦{appliedDiscount.toLocaleString()}</Text>
              </View>
            )}

            <View className="h-px bg-gray-200 my-4" />

            <View className="flex-row justify-between mb-6">
              <Text className="text-xl font-bold">{t('total') || 'Total'}</Text>
              <Text className="text-2xl font-bold text-red-600">
                ₦{total.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCheckout}
              className={`rounded-2xl py-4 items-center ${(cartSyncing || wishlistSyncing) ? 'bg-gray-400' : 'bg-red-500'
                }`}
              disabled={cartSyncing || wishlistSyncing}
            >
              {(cartSyncing || wishlistSyncing) ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-bold text-lg ml-2">
                    {cartSyncing ? (t('updating_cart') || 'Updating Cart') : (t('processing') || 'Processing')}
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-lg">
                  {t('proceed_to_checkout') || 'Proceed to Checkout'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}