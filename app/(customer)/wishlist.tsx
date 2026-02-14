// app/(tabs)/wishlist.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  Animated,
} from 'react-native';
import { AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

// Define the WishlistItem type
interface WishlistItem {
  id: string;
  productId: string;
  storeName: string;
  productName: string;
  price: number;
  originalPrice: number;
  image: string | null;
  isInStock: boolean;
  addedAt: string;
}

const WishlistScreen = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    items: wishlistItems,
    loading,
    syncing,
    removeFromWishlist: removeWishlistItem,
    refreshWishlist,
  } = useWishlist();
  
  const { addItem: addToCart, items: cartItems } = useCart();
  
  // Calculate cart count from cart items
  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<{[key: string]: boolean}>({});
  const [addingToCart, setAddingToCart] = useState<{[key: string]: boolean}>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation for empty state
  useEffect(() => {
    if (isAuthenticated && wishlistItems.length === 0 && !loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isAuthenticated, wishlistItems.length, loading, fadeAnim]);

  // Refresh wishlist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refreshWishlist();
      }
    }, [isAuthenticated, refreshWishlist])
  );

  const onRefresh = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please sign in to view your wishlist');
      return;
    }
    setRefreshing(true);
    refreshWishlist().finally(() => setRefreshing(false));
  }, [refreshWishlist, isAuthenticated]);

  // Selection handlers
  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllItems = useCallback(() => {
    if (wishlistItems.length === 0) return;
    
    if (selectedItems.size === wishlistItems.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(wishlistItems.map(item => item.id));
      setSelectedItems(allIds);
    }
  }, [wishlistItems, selectedItems.size]);

  // Move item to cart with better feedback
  const handleMoveToCart = useCallback(async (item: WishlistItem) => {
    if (!item.isInStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [item.id]: true }));
      
      const itemData = {
        productId: item.productId,
        storeName: item.storeName,
        productName: item.productName,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image || null,
      };

      const result = await addToCart(itemData, 1);
      
      if (result.success) {
        // Show success feedback
        Alert.alert(
          'Added to Cart!',
          `${item.productName} has been added to your cart`,
          [
            {
              text: 'View Cart',
              onPress: () => router.push('/cart')
            },
            {
              text: 'Continue Shopping',
              style: 'cancel',
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to add item to cart');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', error.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [item.id]: false }));
    }
  }, [addToCart, router]);

  // Remove item with swipe confirmation
  const handleRemoveFromWishlist = useCallback(async (itemId: string, itemName?: string) => {
    try {
      setRemovingItems(prev => ({ ...prev, [itemId]: true }));
      
      Alert.alert(
        'Remove Item',
        `Remove "${itemName || 'this item'}" from wishlist?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              const success = await removeWishlistItem(itemId);
              
              if (success) {
                setSelectedItems(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(itemId);
                  return newSet;
                });
              }
            }
          },
        ]
      );
    } finally {
      setRemovingItems(prev => ({ ...prev, [itemId]: false }));
    }
  }, [removeWishlistItem]);

  // Bulk actions
  const removeSelectedItems = useCallback(() => {
    if (selectedItems.size === 0) {
      Alert.alert('No items selected', 'Please select items to remove');
      return;
    }

    Alert.alert(
      'Remove Items',
      `Remove ${selectedItems.size} item(s) from wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const selectedArray = Array.from(selectedItems);
            let successCount = 0;
            
            for (const itemId of selectedArray) {
              const success = await removeWishlistItem(itemId);
              if (success) successCount++;
            }
            
            setSelectedItems(new Set());
            
            if (successCount > 0) {
              Alert.alert(
                'Success',
                `${successCount} item(s) removed from wishlist`
              );
            }
          },
        },
      ]
    );
  }, [selectedItems, removeWishlistItem]);

  const moveSelectedToCart = useCallback(async () => {
    if (selectedItems.size === 0) {
      Alert.alert('No items selected', 'Please select items to move to cart');
      return;
    }

    const selectedWishlistItems = wishlistItems.filter(item => 
      selectedItems.has(item.id) && item.isInStock
    );
    
    const outOfStockItems = wishlistItems.filter(item => 
      selectedItems.has(item.id) && !item.isInStock
    );

    if (outOfStockItems.length > 0) {
      Alert.alert(
        'Some Items Unavailable',
        `${outOfStockItems.length} selected item(s) are out of stock and won't be added to cart.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Available Items',
            onPress: async () => {
              let addedCount = 0;
              
              for (const item of selectedWishlistItems) {
                const itemData = {
                  productId: item.productId,
                  storeName: item.storeName,
                  productName: item.productName,
                  price: item.price,
                  originalPrice: item.originalPrice,
                  image: item.image || null,
                };
                
                const result = await addToCart(itemData, 1);
                if (result.success) addedCount++;
              }
              
              setSelectedItems(new Set());
              
              if (addedCount > 0) {
                Alert.alert(
                  'Success',
                  `${addedCount} item(s) added to cart`
                );
              }
            }
          },
        ]
      );
    } else {
      let addedCount = 0;
      
      for (const item of selectedWishlistItems) {
        const itemData = {
          productId: item.productId,
          storeName: item.storeName,
          productName: item.productName,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image || null,
        };
        
        const result = await addToCart(itemData, 1);
        if (result.success) addedCount++;
      }
      
      setSelectedItems(new Set());
      
      if (addedCount > 0) {
        Alert.alert(
          'Success',
          `${addedCount} item(s) added to cart`
        );
      }
    }
  }, [selectedItems, wishlistItems, addToCart]);

  // Render empty states
  const renderEmptyState = useCallback(() => {
    if (!isAuthenticated) {
      return (
        <Animated.View 
          style={{ opacity: fadeAnim }}
          className="flex-1 justify-center items-center px-8"
        >
          <View className="w-32 h-32 bg-gray-100 rounded-full justify-center items-center mb-6">
            <MaterialCommunityIcons name="login" size={64} color="#6B7280" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to Wishlist
          </Text>
          <Text className="text-base text-gray-600 text-center mb-2">
            Sign in to save items you love
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-8">
            Your saved items will be available across all your devices
          </Text>
          
          <View className="flex-row space-x-4">
            <TouchableOpacity
              className="bg-secondary px-6 py-3 rounded-full"
              onPress={() => router.push('/(auth)/signIn')}
            >
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="bg-gray-100 px-6 py-3 rounded-full"
              onPress={() => router.push('/(auth)/signUp')}
            >
              <Text className="text-gray-900 font-semibold text-base">
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View 
        style={{ opacity: fadeAnim }}
        className="flex-1 justify-center items-center px-8"
      >
        <View className="w-32 h-32 bg-red-50 rounded-full justify-center items-center mb-6">
          <AntDesign name="heart" size={64} color="#DC2626" />
        </View>
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Your wishlist is empty
        </Text>
        <Text className="text-base text-gray-600 text-center mb-8">
          Tap the heart icon on any product to save it here
        </Text>
        
        <View className="flex-row space-x-4 gap-3">
          <TouchableOpacity
            className="bg-secondary px-6 py-3 rounded-full flex-row items-center"
            onPress={() => router.push('/(customer)/explore')}
          >
            <Text className="text-white font-semibold text-base mr-2">
              Browse Products
            </Text>
            <AntDesign name="right" size={20} color="white" />
          </TouchableOpacity>
          
          {cartCount > 0 && (
            <TouchableOpacity
              className="bg-white border border-gray-300 px-6 py-3 rounded-full"
              onPress={() => router.push('/cart')}
            >
              <Text className="text-gray-900 font-semibold text-base">
                View Cart ({cartCount})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  }, [router, isAuthenticated, fadeAnim, cartCount]);

  // Render wishlist item
  const renderItem = useCallback(({ item }: { item: WishlistItem }) => {
    const isRemoving = removingItems[item.id] || false;
    const isAddingToCart = addingToCart[item.id] || false;
    const isSelected = selectedItems.has(item.id);
    
    return (
      <TouchableOpacity
        className={`flex-row bg-white mx-4 mb-4 p-4 rounded-xl shadow-sm border ${
          isSelected ? 'border-secondary border' : 'border-gray-100'
        }`}
        onPress={() => toggleItemSelection(item.id)}
        activeOpacity={0.9}
        disabled={syncing}
      >
        {/* Selection Checkbox */}
        <View className="justify-center mr-3">
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleItemSelection(item.id);
            }}
            disabled={syncing}
          >
            <View
              className={`w-6 h-6 rounded-md border-2 justify-center items-center ${
                isSelected
                  ? 'bg-secondary border-secondary'
                  : 'border-gray-300'
              }`}
            >
              {isSelected && (
                <AntDesign name="check" size={14} color="white" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Product Image with overlay for out of stock */}
        <View className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden mr-4">
          {item.image ? (
            <>
              <Image
                source={{ uri: item.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {!item.isInStock && (
                <View className="absolute inset-0 bg-black/30 justify-center items-center">
                  <Text className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">
                    OUT OF STOCK
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View className="flex-1 justify-center items-center">
              <MaterialCommunityIcons name="shopping-outline" size={32} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="text-xs text-gray-500 mb-1" numberOfLines={1}>
              {item.storeName}
            </Text>
            <Text className="text-xs text-gray-400">
              {new Date(item.addedAt).toLocaleDateString()}
            </Text>
          </View>
          
          <Text className="text-base font-semibold text-gray-900 mb-2" numberOfLines={2}>
            {item.productName}
          </Text>

          {/* Stock Status with indicator */}
          <View className="flex-row items-center mb-2">
            <View className={`w-2 h-2 rounded-full mr-2 ${item.isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className={`text-xs font-medium ${item.isInStock ? 'text-green-600' : 'text-red-600'}`}>
              {item.isInStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          {/* Price */}
          <View className="flex-row items-center mb-3">
            <Text className="text-lg font-bold text-gray-900">
              ₦{item.price.toLocaleString()}
            </Text>
            {item.originalPrice > item.price && (
              <>
                <Text className="text-sm text-gray-500 line-through ml-2">
                  ₦{item.originalPrice.toLocaleString()}
                </Text>
                <View className="ml-2 bg-red-100 px-2 py-1 rounded">
                  <Text className="text-xs font-bold text-red-700">
                    -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Actions */}
          <View className="flex-row space-x-2 gap-3">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${item.isInStock ? 'bg-secondary' : 'bg-gray-300'}`}
              onPress={(e) => {
                e.stopPropagation();
                handleMoveToCart(item);
              }}
              disabled={!item.isInStock || syncing || isAddingToCart}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  {item.isInStock ? 'Add to Cart' : 'Unavailable'}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`w-10 h-10 border rounded-lg justify-center items-center ${
                isSelected ? 'border-red-200 bg-red-50' : 'border-gray-300'
              }`}
              onPress={(e) => {
                e.stopPropagation();
                handleRemoveFromWishlist(item.id, item.productName);
              }}
              disabled={isRemoving || syncing}
            >
              {isRemoving ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Feather name="trash-2" size={18} color={isSelected ? "#DC2626" : "#9CA3AF"} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [
    selectedItems, 
    removingItems, 
    addingToCart,
    syncing, 
    handleMoveToCart, 
    handleRemoveFromWishlist, 
    toggleItemSelection
  ]);

  // Header with selection options - FIXED VERSION
  const Header = useMemo(() => {
    const hasSelectedItems = selectedItems.size > 0;
    
    return (
      <SafeAreaView>
        <LinearGradient
          colors={["#B13239", "#4D0812"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 44, width: "100%" }}
        />
        <View className="px-4 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              {hasSelectedItems ? (
                <Text className="text-lg font-bold text-gray-900">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </Text>
              ) : (
                <View>
                  <Text className="text-xl font-bold text-gray-900">
                    My Wishlist
                  </Text>
                  {wishlistItems.length > 0 && (
                    <Text className="text-sm text-gray-500">
                      {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
              )}
            </View>
            
            {wishlistItems.length > 0 && (
              <View className="flex-row items-center space-x-4 gap-4">
                {hasSelectedItems && (
                  <TouchableOpacity onPress={selectAllItems}>
                    <Text className="text-secondary font-semibold">
                      {selectedItems.size === wishlistItems.length ? 'Deselect All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {syncing ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <TouchableOpacity onPress={onRefresh}>
                    <Text className="text-gray-600 font-semibold">Refresh</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }, [wishlistItems.length, selectedItems.size, syncing, selectAllItems, onRefresh]);

  // Footer with bulk actions
  const Footer = useMemo(() => {
    if (wishlistItems.length === 0 || !isAuthenticated) return null;

    const hasSelectedItems = selectedItems.size > 0;
    const selectedInStock = wishlistItems.filter(item => 
      selectedItems.has(item.id) && item.isInStock
    ).length;

    return (
      <View className="bg-white border-t border-gray-200 px-4 py-4">
        {hasSelectedItems && (
          <>
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity
                className={`px-4 py-3 rounded-lg flex-1 mr-2 ${
                  selectedInStock > 0 ? 'bg-secondary' : 'bg-gray-300'
                }`}
                disabled={selectedInStock === 0 || syncing}
                onPress={moveSelectedToCart}
              >
                <Text className="text-white font-semibold text-center">
                  {selectedInStock > 0 
                    ? `Add ${selectedInStock} to Cart` 
                    : 'Selected items unavailable'
                  }
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`w-12 h-12 rounded-lg justify-center items-center ${
                  hasSelectedItems ? 'bg-red-50 border border-red-200' : 'bg-gray-100'
                }`}
                disabled={!hasSelectedItems || syncing}
                onPress={removeSelectedItems}
              >
                <Feather 
                  name="trash-2" 
                  size={20} 
                  color={hasSelectedItems && !syncing ? '#EF4444' : '#9CA3AF'} 
                />
              </TouchableOpacity>
            </View>
            
            <View className="h-px bg-gray-200 mb-4" />
          </>
        )}

        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            className="flex-row items-center bg-gray-100 px-4 py-3 rounded-lg flex-1 mr-2"
            onPress={() => router.push('/(customer)/explore')}
          >
            <AntDesign name="heart" size={18} color="#6B7280" style={{ marginRight: 8 }} />
            <Text className="text-gray-700 font-semibold">
              Browse More
            </Text>
          </TouchableOpacity>
          
          {cartCount > 0 && (
            <TouchableOpacity
              className="flex-row items-center bg-secondary px-4 py-3 rounded-lg flex-1 ml-2"
              onPress={() => router.push('/cart')}
            >
              <MaterialCommunityIcons name="shopping-outline" size={18} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-semibold">
                Cart ({cartCount})
              </Text>
              <AntDesign name="right" size={18} color="white" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [
    wishlistItems, 
    isAuthenticated, 
    selectedItems, 
    syncing, 
    moveSelectedToCart, 
    removeSelectedItems, 
    router,
    cartCount
  ]);

  // Loading state - FIXED: Don't render Header during loading
  if (loading && !refreshing && isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Simple header during loading */}
        <View className="bg-white border-b border-gray-200 px-4 py-4">
          <Text className="text-xl font-bold text-gray-900">My Wishlist</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#DC2626" />
          <Text className="mt-4 text-gray-600">Loading your wishlist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {Header}

      <FlatList
        data={isAuthenticated ? wishlistItems : []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={wishlistItems.length === 0 ? { flex: 1 } : { paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          isAuthenticated ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#DC2626']}
              tintColor="#DC2626"
              progressBackgroundColor="#ffffff"
            />
          ) : undefined
        }
        maxToRenderPerBatch={10}
        initialNumToRender={10}
        windowSize={10}
        removeClippedSubviews={true}
        extraData={[selectedItems, removingItems, addingToCart, syncing]}
      />

      {Footer}
    </SafeAreaView>
  );
};

export default WishlistScreen;