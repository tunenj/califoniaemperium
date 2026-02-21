// app/(customer)/cart.tsx

import React, { useState, memo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import Toast from 'react-native-toast-message';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

// Define CartItem type
interface CartItem {
  id: string;
  productId: string;
  storeName: string;
  productName: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: any;
  variantId?: string;
  color?: string;
  size?: string;
  maxQuantity?: number;
}

interface ShippingOption {
  logistics_name: string;
  freight: string;
  estimated_delivery: string;
}

interface WishlistResult {
  success: boolean;
  message?: string;
}

// ── Toast helper ──────────────────────────────────────────────────
const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 30,
  });
};

// ── Image URI extractor ───────────────────────────────────────────
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

const formatPrice = (price: number): string => {
  if (isNaN(price)) return "€0.00";
  return `€${price.toFixed(2)}`;
};

// ── Product Image ─────────────────────────────────────────────────
const ProductImage = memo(({ uri, productName }: { uri: string | null; productName?: string }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const resolvedUri = extractImageUri(uri);

  if (!resolvedUri || imageError) {
    const initial = productName ? productName.charAt(0).toUpperCase() : '?';
    return (
      <View className="w-full h-full items-center justify-center bg-gray-100 rounded-xl">
        <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mb-1">
          <Text className="text-darkRed font-bold text-lg">{initial}</Text>
        </View>
        <Text className="text-gray-400 text-xs text-center px-1" numberOfLines={1}>No image</Text>
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
        onError={() => { setImageError(true); setImageLoading(false); }}
        fadeDuration={300}
      />
    </>
  );
});

ProductImage.displayName = 'ProductImage';

// ── Main Screen ───────────────────────────────────────────────────
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
    
    // Shipping from context
    shippingAddress,
    setShippingAddress,
    shippingOptions,
    setShippingOptions,
    selectedShipping,
    setSelectedShipping,
    shippingCost,
    getCartTotalWithShipping,
    clearShipping,
  } = useCart();

  const { addToWishlist, syncing: wishlistSyncing, isInWishlist } = useWishlist();

  const [updatingItems, setUpdatingItems] = useState<{ [key: string]: boolean }>({});
  const [removingItems, setRemovingItems] = useState<{ [key: string]: boolean }>({});
  const [savingItems, setSavingItems] = useState<{ [key: string]: boolean }>({});

  // Local UI state
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [addressExpanded, setAddressExpanded] = useState(false);

  const cartItems = items as CartItem[];
  const subtotal = getCartTotal();
  const total = getCartTotalWithShipping();

  const isValidUUID = (uuid: string): boolean => {
    if (!uuid || typeof uuid !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid.trim());
  };

  // ── Fetch shipping ────────────────────────────────────────────
  const fetchShippingOptions = useCallback(async () => {
    const { country, state, city, postal_code } = shippingAddress;

    if (!country.trim() || !city.trim()) {
      showToast('error', 'Missing Info', 'Please enter at least country and city.');
      return;
    }

    setLoadingShipping(true);
    try {
      const response = await api.post(endpoints.calculateShip, {
        shipping_country: country.trim(),
        shipping_state: state.trim(),
        shipping_city: city.trim(),
        shipping_postal_code: postal_code.trim(),
      });

      if (response.data?.success && response.data?.data?.shipping_options?.length > 0) {
        setShippingOptions(response.data.data.shipping_options);
        setShippingModalVisible(true);
      } else {
        showToast('info', 'No Options', 'No shipping options found for this address.');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Please check your address and try again.';
      showToast('error', 'Shipping Error', msg);
    } finally {
      setLoadingShipping(false);
    }
  }, [shippingAddress, setShippingOptions]);

  const handleSelectShipping = (option: ShippingOption) => {
    setSelectedShipping(option);
    setShippingModalVisible(false);
    showToast('success', 'Shipping Selected', `${option.logistics_name} · ${option.estimated_delivery}`);
  };

  const handleClearShipping = () => {
    clearShipping();
    showToast('info', 'Shipping Removed', 'Shipping method cleared.');
  };

  // ── Wishlist ──────────────────────────────────────────────────
  const saveToWishlistWithId = useCallback(async (itemId: string, cartItem: CartItem, productId: string) => {
    try {
      const alreadyInWishlist = await isInWishlist(productId);
      if (alreadyInWishlist) {
        showToast('info', 'Already Saved', 'This item is already in your wishlist.');
        return;
      }

      const result = await addToWishlist(productId) as WishlistResult;

      if (result?.success) {
        await removeItem(itemId);
        showToast('success', 'Saved!', `${cartItem.productName} moved to wishlist.`);
      } else {
        showToast('error', 'Error', (result as any)?.message || 'Failed to save to wishlist.');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || error?.message || 'Network error occurred.';
      showToast('error', 'Error', msg);
    } finally {
      setSavingItems(prev => ({ ...prev, [itemId]: false }));
    }
  }, [addToWishlist, removeItem, isInWishlist]);

  // ── Checkout ──────────────────────────────────────────────────
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('info', 'Empty Cart', 'Please add items before checking out.');
      return;
    }
    if (cartSyncing || wishlistSyncing) {
      showToast('info', 'Please Wait', 'Your cart is being updated...');
      return;
    }
    router.push('/checkout');
  };

  // ── Clear cart — keep Alert for destructive confirmation ──────
  const handleClearCart = () => {
    Alert.alert(
      t('clear_cart') || 'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const success = await clearCart();
            if (!success) {
              showToast('error', 'Error', 'Failed to clear cart.');
            } else {
              clearShipping(); // Clear shipping when cart is cleared
              showToast('success', 'Cart Cleared', 'All items have been removed.');
            }
          },
        },
      ]
    );
  };

  // ── Remove item — keep Alert for destructive confirmation ─────
  const handleRemoveItem = useCallback(async (itemId: string) => {
    Alert.alert(
      t('remove_item') || 'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('remove') || 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingItems(prev => ({ ...prev, [itemId]: true }));
              const success = await removeItem(itemId);
              if (!success) showToast('error', 'Error', 'Failed to remove item.');
            } catch {
              showToast('error', 'Error', 'Failed to remove item.');
            } finally {
              setRemovingItems(prev => ({ ...prev, [itemId]: false }));
            }
          },
        },
      ]
    );
  }, [removeItem, t]);

  // ── Update quantity ───────────────────────────────────────────
  const handleUpdateQuantity = useCallback(async (itemId: string, newQuantity: number, maxStock?: number) => {
    if (newQuantity < 1) { handleRemoveItem(itemId); return; }
    if (maxStock && newQuantity > maxStock) {
      showToast('info', 'Maximum Quantity', `Only ${maxStock} items available in stock.`);
      return;
    }
    const currentItem = cartItems.find(item => item.id === itemId);
    if (currentItem && currentItem.quantity === newQuantity) return;

    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      const success = await updateQuantity(itemId, newQuantity);
      if (!success) showToast('error', 'Error', 'Failed to update quantity.');
    } catch {
      showToast('error', 'Error', 'Failed to update quantity.');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  }, [updateQuantity, cartItems, handleRemoveItem]);

  // ── Save for later ────────────────────────────────────────────
  const handleSaveForLater = useCallback(async (item: CartItem) => {
    if (!isAuthenticated) {
      showToast('info', 'Sign In Required', 'Please sign in to save items to your wishlist.');
      return;
    }

    try {
      setSavingItems(prev => ({ ...prev, [item.id]: true }));
      const productId = String(item.productId).trim();

      if (!productId) {
        showToast('error', 'Error', 'Product ID is missing.');
        return;
      }

      if (!isValidUUID(productId)) {
        const uuidMatch = productId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        if (uuidMatch) {
          await saveToWishlistWithId(item.id, item, uuidMatch[0]);
        } else {
          showToast('error', 'Invalid Product', 'The product ID is not valid.');
        }
        return;
      }

      await saveToWishlistWithId(item.id, item, productId);
    } catch {
      showToast('error', 'Error', 'Failed to save item to wishlist.');
    } finally {
      setSavingItems(prev => ({ ...prev, [item.id]: false }));
    }
  }, [isAuthenticated, saveToWishlistWithId]);

  // ── Empty cart view ───────────────────────────────────────────
  if (cartItems.length === 0) {
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
        <Toast />
      </SafeAreaView>
    );
  }

  // ── Main cart view ────────────────────────────────────────────
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
              <Feather
                name="trash-2"
                size={20}
                color={(cartSyncing || wishlistSyncing) ? "#9CA3AF" : "#EF4444"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

          {/* Cart Items */}
          {cartItems.map((item) => {
            const isUpdating = updatingItems[item.id] || false;
            const isRemoving = removingItems[item.id] || false;
            const isSaving = savingItems[item.id] || false;
            const isValidUuid = isValidUUID(String(item.productId));
            const itemTotal = item.price * item.quantity;
            const originalTotal = item.originalPrice ? item.originalPrice * item.quantity : itemTotal;
            const hasDiscount = item.originalPrice && item.originalPrice > item.price;
            const imageUri = extractImageUri(item.image);

            return (
              <View key={item.id} className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 relative">
                {(isRemoving || isSaving) && (
                  <View className="absolute inset-0 bg-white/80 z-10 items-center justify-center rounded-2xl">
                    <ActivityIndicator size="large" color="#DC2626" />
                    <Text className="mt-2 text-gray-600">
                      {isRemoving ? 'Removing item...' : 'Saving to wishlist...'}
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between mb-3">
                  <Text className="font-medium text-gray-800">{item.storeName}</Text>
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

                    <View className="mb-2">
                      <View className="flex-row items-center">
                        <Text className="font-bold text-lg text-red-600">{formatPrice(item.price)}</Text>
                        {hasDiscount && (
                          <Text className="text-sm text-gray-400 line-through ml-2">
                            {formatPrice(item.originalPrice || 0)}
                          </Text>
                        )}
                      </View>
                      {item.quantity > 1 && (
                        <Text className="text-xs text-gray-500 mt-1">
                          Unit price: {formatPrice(item.price)}
                        </Text>
                      )}
                    </View>

                    {/* Quantity Controls */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row bg-gray-50 rounded-lg p-1 items-center">
                        <TouchableOpacity
                          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1, item.maxQuantity)}
                          disabled={cartSyncing || isUpdating || item.quantity <= 1}
                          className="w-8 h-8 items-center justify-center rounded"
                        >
                          <Text className="text-lg text-gray-700 font-bold">-</Text>
                        </TouchableOpacity>
                        <View className="mx-4 min-w-8 items-center">
                          {isUpdating ? (
                            <ActivityIndicator size="small" color="#DC2626" />
                          ) : (
                            <Text className="font-semibold text-gray-900">{item.quantity}</Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1, item.maxQuantity)}
                          disabled={cartSyncing || isUpdating || (item.maxQuantity ? item.quantity >= item.maxQuantity : false)}
                          className="w-8 h-8 items-center justify-center rounded"
                        >
                          <Text className="text-lg text-gray-700 font-bold">+</Text>
                        </TouchableOpacity>
                      </View>

                      <View className="items-end">
                        <Text className="font-bold text-red-600">{formatPrice(itemTotal)}</Text>
                        {hasDiscount && (
                          <Text className="text-xs text-green-600">
                            Save {formatPrice(originalTotal - itemTotal)}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Save for Later */}
                    <View className="flex-row justify-end mt-2">
                      <TouchableOpacity
                        onPress={() => handleSaveForLater(item)}
                        className="flex-row items-center"
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
                              {isValidUuid ? (t('save_for_later') || 'Save for later') : 'Invalid ID'}
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

          {/* ── Shipping Calculator ─────────────────────────────── */}
          <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
            <TouchableOpacity
              className="flex-row justify-between items-center"
              onPress={() => setAddressExpanded(prev => !prev)}
            >
              <View className="flex-row items-center">
                <Ionicons name="car-outline" size={20} color="#DC2626" />
                <Text className="text-base font-bold text-gray-900 ml-2">Shipping Calculator</Text>
              </View>
              <Ionicons name={addressExpanded ? "chevron-up" : "chevron-down"} size={18} color="#6b7280" />
            </TouchableOpacity>

            {/* Selected shipping badge */}
            {selectedShipping && !addressExpanded && (
              <View className="mt-3 flex-row justify-between items-center bg-green-50 px-3 py-2 rounded-xl">
                <View className="flex-1">
                  <Text className="text-green-700 font-semibold text-sm">
                    {selectedShipping.logistics_name}
                  </Text>
                  <Text className="text-green-600 text-xs mt-0.5">
                    {selectedShipping.estimated_delivery}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-green-700 font-bold mr-2">
                    €{parseFloat(selectedShipping.freight).toFixed(2)}
                  </Text>
                  <TouchableOpacity onPress={handleClearShipping}>
                    <Ionicons name="close-circle" size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {addressExpanded && (
              <View className="mt-4 space-y-3">
                <View>
                  <Text className="text-xs text-gray-500 mb-1">Country *</Text>
                  <TextInput
                    value={shippingAddress.country}
                    onChangeText={(v) => setShippingAddress({ ...shippingAddress, country: v })}
                    placeholder="e.g. US"
                    placeholderTextColor="#9ca3af"
                    className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800"
                  />
                </View>
                <View>
                  <Text className="text-xs text-gray-500 mb-1">State / Province</Text>
                  <TextInput
                    value={shippingAddress.state}
                    onChangeText={(v) => setShippingAddress({ ...shippingAddress, state: v })}
                    placeholder="e.g. California"
                    placeholderTextColor="#9ca3af"
                    className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800"
                  />
                </View>
                <View>
                  <Text className="text-xs text-gray-500 mb-1">City *</Text>
                  <TextInput
                    value={shippingAddress.city}
                    onChangeText={(v) => setShippingAddress({ ...shippingAddress, city: v })}
                    placeholder="e.g. Los Angeles"
                    placeholderTextColor="#9ca3af"
                    className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800"
                  />
                </View>
                <View>
                  <Text className="text-xs text-gray-500 mb-1">Postal Code</Text>
                  <TextInput
                    value={shippingAddress.postal_code}
                    onChangeText={(v) => setShippingAddress({ ...shippingAddress, postal_code: v })}
                    placeholder="e.g. 90001"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800"
                  />
                </View>
                <TouchableOpacity
                  onPress={fetchShippingOptions}
                  disabled={loadingShipping}
                  className={`py-3 rounded-xl items-center mt-2 ${loadingShipping ? 'bg-gray-300' : 'bg-red-600'}`}
                >
                  {loadingShipping ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-semibold ml-2">Calculating...</Text>
                    </View>
                  ) : (
                    <Text className="text-white font-semibold">Calculate Shipping</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── Order Summary ───────────────────────────────────── */}
          <View className="bg-white rounded-2xl p-5 mb-8 border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              {t('order_summary') || 'Order Summary'}
            </Text>

            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-700">
                {t('subtotal') || 'Subtotal'} ({getItemCount()} items)
              </Text>
              <Text className="font-medium">{formatPrice(subtotal)}</Text>
            </View>

            <View className="flex-row justify-between mb-3">
              <View className="flex-1">
                <Text className="text-gray-700">Shipping</Text>
                {selectedShipping && (
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {selectedShipping.logistics_name} · {selectedShipping.estimated_delivery}
                  </Text>
                )}
              </View>
              {selectedShipping ? (
                <Text className="font-medium text-gray-900">{formatPrice(shippingCost)}</Text>
              ) : (
                <TouchableOpacity onPress={() => setAddressExpanded(true)}>
                  <Text className="text-red-500 text-sm font-medium">Calculate</Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="h-px bg-gray-200 my-4" />

            <View className="flex-row justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">{t('total') || 'Total'}</Text>
              <Text className="text-2xl font-bold text-red-600">{formatPrice(total)}</Text>
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
                    {cartSyncing ? 'Updating Cart' : 'Processing'}
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

      {/* ── Shipping Options Modal ──────────────────────────────── */}
      <Modal
        visible={shippingModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setShippingModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[75%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Choose Shipping Method</Text>
              <TouchableOpacity
                onPress={() => setShippingModalVisible(false)}
                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={18} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-gray-400 mb-4">
              {shippingOptions.length} options available for your location
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {shippingOptions.map((option, index) => {
                const isSelected = selectedShipping?.logistics_name === option.logistics_name;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectShipping(option)}
                    className={`flex-row justify-between items-center p-4 mb-2 rounded-xl border ${
                      isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <View className="flex-1">
                      <Text className={`font-semibold text-sm ${isSelected ? 'text-red-700' : 'text-gray-900'}`}>
                        {option.logistics_name}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-0.5">{option.estimated_delivery}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className={`font-bold text-base mr-2 ${isSelected ? 'text-red-600' : 'text-gray-900'}`}>
                        €{parseFloat(option.freight).toFixed(2)}
                      </Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color="#dc2626" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View className="h-6" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Toast — must be at root level */}
      <Toast />
    </SafeAreaView>
  );
}