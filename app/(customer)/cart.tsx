// app/(customer)/cart.tsx
import React, { useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { useCart } from '../../context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

// ✅ Helper to extract image URI from various formats the API may return
const extractImageUri = (image: any): string | null => {
  if (!image) return null;
  if (typeof image === 'string') return image.startsWith('http') ? image : null;
  if (typeof image === 'object') {
    if (image.image && typeof image.image === 'string') return image.image;
    if (image.image_url && typeof image.image_url === 'string') return image.image_url;
    if (image.uri && typeof image.uri === 'string') return image.uri;
    if (image.url && typeof image.url === 'string') return image.url;
  }
  return null;
};

// ✅ Memoized Product Image Component - matches product detail page style
const ProductImage = memo(({ uri, productName }: { uri: string | null; productName?: string }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const resolvedUri = extractImageUri(uri);

  // No image or error - show stylish placeholder with product initial
  if (!resolvedUri || imageError) {
    const initial = productName ? productName.charAt(0).toUpperCase() : '?';
    return (
      <View className="w-full h-full items-center justify-center bg-gray-100 rounded-xl">
        <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mb-1">
          <Text className="text-darkRed font-bold text-lg">{initial}</Text>
        </View>
        <Text className="text-gray-400 text-xs text-center px-1" numberOfLines={1}>
          No image
        </Text>
      </View>
    );
  }

  return (
    <>
      {imageLoading && (
        <View className="absolute inset-0 items-center justify-center bg-gray-100 rounded-xl z-10">
          <ActivityIndicator size="small" color="#DC2626" />
        </View>
      )}
      <Image
        source={{ uri: resolvedUri }}
        className="w-full h-full rounded-xl"
        resizeMode="contain"
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        fadeDuration={300}
      />
    </>
  );
});

ProductImage.displayName = 'ProductImage';

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
    Alert.alert(
      t('remove_item') || 'Remove Item',
      t('remove_item_confirmation') || 'Are you sure you want to remove this item?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('remove') || 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingItems(prev => ({ ...prev, [itemId]: true }));
              const success = await removeItem(itemId);
              if (!success) {
                Alert.alert(t('error') || 'Error', t('failed_to_remove_item') || 'Failed to remove item');
              }
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert(t('error') || 'Error', t('failed_to_remove_item') || 'Failed to remove item');
            } finally {
              setRemovingItems(prev => ({ ...prev, [itemId]: false }));
            }
          }
        },
      ]
    );
  };

  // Save item to wishlist
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

      const productId = cartItem.productId;

      if (!productId) {
        Alert.alert('Error', 'Product ID is missing.');
        setSavingItems(prev => ({ ...prev, [itemId]: false }));
        return;
      }

      const productIdStr = String(productId).trim();

      if (!isValidUUID(productIdStr)) {
        const uuidMatch = productIdStr.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        if (uuidMatch) {
          await saveToWishlistWithId(itemId, cartItem, uuidMatch[0]);
        } else {
          Alert.alert('Invalid Product ID', 'The product ID is not valid. Please contact support.');
          setSavingItems(prev => ({ ...prev, [itemId]: false }));
        }
        return;
      }

      await saveToWishlistWithId(itemId, cartItem, productIdStr);

    } catch (error) {
      console.error('Error in handleSaveForLater:', error);
      Alert.alert('Error', 'Failed to save item to wishlist.');
      setSavingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const saveToWishlistWithId = async (itemId: string, cartItem: any, productId: string) => {
    try {
      const alreadyInWishlist = await isInWishlist(productId);
      if (alreadyInWishlist) {
        Alert.alert(
          'Already Saved',
          'This item is already in your wishlist.',
          [
            { text: 'View Wishlist', onPress: () => router.push('/(customer)/wishlist') },
            { text: 'OK', style: 'cancel' }
          ]
        );
        setSavingItems(prev => ({ ...prev, [itemId]: false }));
        return;
      }

      const result = await addToWishlist(productId);

      if (result.success) {
        await removeItem(itemId);
        Alert.alert(
          'Saved Successfully!',
          `${cartItem.productName} has been added to your wishlist.`,
          [
            { text: 'View Wishlist', onPress: () => router.push('/(customer)/wishlist') },
            { text: 'Continue Shopping', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to save to wishlist');
      }

    } catch (error: any) {
      console.error('API Call Error:', error);
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Network error occurred.';
      Alert.alert('API Error', errorMessage);
    } finally {
      setSavingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert(
        t('empty_cart') || 'Empty Cart',
        t('add_items_before_checkout') || 'Please add items to your cart before checking out',
        [
          { text: t('continue_shopping') || 'Continue Shopping', onPress: () => router.push('/(customer)/main') },
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
    const discountAmount = discount < 1 ? Math.round(subtotal * discount) : discount;
    setAppliedDiscount(discountAmount);
    Alert.alert(t('success') || 'Success', `${t('promo_code_applied_saved') || 'Promo code applied! You saved'} ₦${discountAmount.toLocaleString()}`);
  };

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
              <Ionicons name="chevron-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="cart-outline" size={22} color="#C62828" />
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
              <Ionicons name="chevron-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Text className="text-xl font-bold text-gray-900">
                {t('your_cart') || 'Your Cart'} ({getItemCount()})
              </Text>
              {(cartSyncing || wishlistSyncing) && (
                <ActivityIndicator size="small" color="#DC2626" style={{ marginLeft: 8 }} />
              )}
            </View>
            <TouchableOpacity
              onPress={handleClearCart}
              className="p-2"
              disabled={cartSyncing || wishlistSyncing}
            >
              <Feather name="trash-2" size={20} color={(cartSyncing || wishlistSyncing) ? "#9CA3AF" : "#EF4444"} />
            </TouchableOpacity>
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

            // ✅ Resolve image URI at render time
            const imageUri = extractImageUri(item.image);

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
                  {/* ✅ Product Image - matches product detail page style */}
                  <View className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 relative">
                    <ProductImage uri={imageUri} productName={item.productName} />
                  </View>

                  <View className="flex-1 ml-4">
                    <Text className="font-semibold text-gray-900 mb-1" numberOfLines={2}>
                      {item.productName}
                    </Text>

                    {(item.color || item.size) && (
                      <Text className="text-gray-500 text-sm mb-2">
                        {item.color && `${t('color') || 'Color'}: ${item.color} `}
                        {item.size && `• ${t('size') || 'Size'}: ${item.size}`}
                      </Text>
                    )}

                    <Text className="font-bold text-lg text-red-600 mb-4">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </Text>

                    <View className="flex-row items-center">
                      <View className="flex-row bg-gray-50 rounded-lg p-1 items-center">
                        <TouchableOpacity
                          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={cartSyncing || isUpdating || item.quantity <= 1}
                          className="w-8 h-8 items-center justify-center rounded"
                        >
                          <Text className="text-lg text-gray-700 font-bold">-</Text>
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
                          className="w-8 h-8 items-center justify-center rounded"
                        >
                          <Text className="text-lg text-gray-700 font-bold">+</Text>
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
                            <Feather
                              name="heart"
                              size={16}
                              color={isValidUuid ? "#2563EB" : "#9CA3AF"}
                              style={{ marginRight: 4 }}
                            />
                            <Text className={`text-sm ${isValidUuid ? 'text-blue-600' : 'text-gray-500'}`}>
                              {isValidUuid ? (t('save_for_later') || 'Save') : 'Invalid ID'}
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
                className={`px-6 rounded-r-xl justify-center ${cartSyncing ? 'bg-gray-400' : 'bg-gray-900'}`}
                disabled={cartSyncing}
              >
                <Text className="text-white font-medium">{t('apply') || 'Apply'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary */}
          <View className="bg-white rounded-2xl p-5 mb-8 border border-gray-100">
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-700">{t('subtotal') || 'Subtotal'}</Text>
              <Text className="font-medium">₦{subtotal.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-700">{t('shipping') || 'Shipping'}</Text>
              <Text className="font-medium">₦{shippingFee.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-700">{t('tax') || 'Tax'}</Text>
              <Text className="font-medium">₦{tax.toLocaleString()}</Text>
            </View>

            {appliedDiscount > 0 && (
              <View className="flex-row justify-between mb-3">
                <Text className="text-green-600 font-medium">{t('discount') || 'Discount'}</Text>
                <Text className="text-green-600 font-medium">-₦{appliedDiscount.toLocaleString()}</Text>
              </View>
            )}

            <View className="h-px bg-gray-200 my-4" />

            <View className="flex-row justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">{t('total') || 'Total'}</Text>
              <Text className="text-2xl font-bold text-red-600">
                ₦{total.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCheckout}
              className={`rounded-2xl py-4 items-center ${(cartSyncing || wishlistSyncing) ? 'bg-gray-400' : 'bg-red-600'}`}
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