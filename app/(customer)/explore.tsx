// app/(customer)/explore.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  ActivityIndicator,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import DashboardHeader from "@/components/explore/DashboardHeader";
import api from "@/api/api";
import { endpoints } from "@/api/endpoints";
import { ShoppingCart, Package, Check, Heart } from "lucide-react-native";
import { useExploreSearch } from "@/context/ExploreSearchContext";
import { useCart } from "@/context/CartContext"; 
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  product_type: string;
  category_name: string;
  brand_name: string;
  price: string;
  compare_at_price: string | null;
  discount_percentage: number;
  main_image: string | null;
  is_in_stock: boolean;
  is_featured: boolean;
  rating_average: string;
  rating_count: number;
  condition: string;
  created_at: string;
}

interface ProductsResponse {
  results: Product[];
  count: number;
  next: string | null;
  previous: string | null;
  current_page: number;
  total_pages: number;
}

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 24) / 2;

const Explore = () => {
  const router = useRouter();
  const { searchQuery } = useExploreSearch();
  
  // Use the cart context
  const { 
    addItem, 
    isInCart, 
    syncing: cartSyncing
  } = useCart();

  // Use the wishlist context
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistId,
    syncing: wishlistSyncing
  } = useWishlist();

  // Use auth context
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // State to track which products are being added to cart
  const [addingToCart, setAddingToCart] = useState<{[key: string]: boolean}>({});
  
  // State to track which products are being toggled in wishlist
  const [togglingWishlist, setTogglingWishlist] = useState<{[key: string]: boolean}>({});

  // Fetch products
  const fetchProducts = useCallback(
    async (page: number = 1, isRefresh: boolean = false) => {
      try {
        if (page === 1) {
          setLoading(true);
          setError(null);
        } else {
          setProductsLoading(true);
        }

        let url = `${endpoints.products}?page=${page}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

        const response = await api.get<ProductsResponse>(url);

        const newProducts = response.data.results || [];
        const productsWithUniqueKeys = newProducts.map((product, index) => ({
          ...product,
          uniqueKey: `${product.id}-${product.sku || index}-${Date.now()}`,
        }));

        if (page === 1 || isRefresh) {
          setProducts(productsWithUniqueKeys);
        } else {
          setProducts((prev) => [...prev, ...productsWithUniqueKeys]);
        }

        setHasMore(response.data.next !== null);
        setCurrentPage(page);
        setTotalProducts(response.data.count || 0);
      } catch (error: any) {
        console.error("Error fetching products:", error);
        setError(error.response?.data?.message || error.message || "Failed to load products");
        if (page === 1) setProducts([]);
      } finally {
        setLoading(false);
        setProductsLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const loadMoreProducts = useCallback(() => {
    if (hasMore && !productsLoading && !loading) fetchProducts(currentPage + 1);
  }, [hasMore, productsLoading, loading, currentPage, fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(1, true);
  }, [fetchProducts]);

  const handleRetry = useCallback(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handleProductPress = useCallback((product: Product) => {
    if (!product.slug) return;
    router.push({
      pathname: "/(customer)/product/[slug]",
      params: { slug: product.slug, productName: product.name || "Product" },
    });
  }, [router]);

  const formatPrice = useCallback((price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "₦0";
    return `₦${numPrice.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }, []);

  const getUniqueKey = useCallback((item: Product, index: number) => 
    `${item.id}-${item.sku || "no-sku"}-${index}-${Date.now()}`, 
  []);

  // Handle add to cart
  const handleAddToCart = useCallback(async (product: Product) => {
    // Check if product is in stock
    if (!product.is_in_stock) {
      Alert.alert(
        "Out of Stock",
        "This product is currently out of stock",
        [{ text: "OK" }]
      );
      return;
    }

    // Set loading state for this specific product
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));

    try {
      // Prepare item data for the cart
      const itemData = {
        productId: product.id,
        storeName: product.brand_name || 'Unknown Store',
        productName: product.name,
        price: parseFloat(product.price),
        originalPrice: product.compare_at_price 
          ? parseFloat(product.compare_at_price)
          : parseFloat(product.price),
        image: product.main_image || null,
      };

      console.log('🛒 Adding product to cart:', itemData);

      // Add to cart via API
      const result = await addItem(itemData, 1);
      
      if (result.success) {
        console.log("✅ Added to cart:", product.name);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Error is already handled in the CartContext
    } finally {
      // Clear loading state for this product
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  }, [addItem]);

  // Handle wishlist toggle
  const handleWishlistToggle = useCallback(async (product: Product) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to save items to your wishlist',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => router.push('/(auth)/signIn')
          }
        ]
      );
      return;
    }

    const productId = product.id;
    const isCurrentlyInWishlist = isInWishlist(productId);

    // Prevent multiple simultaneous operations on the same product
    if (togglingWishlist[productId]) {
      return;
    }

    // Set loading state for this specific product
    setTogglingWishlist(prev => ({ ...prev, [productId]: true }));

    try {
      if (isCurrentlyInWishlist) {
        // Get the wishlist ID for this product
        const wishlistId = getWishlistId(productId);
        
        if (!wishlistId) {
          console.error('[Wishlist] No wishlist ID found for product:', productId);
          Alert.alert('Error', 'Failed to remove from wishlist');
          setTogglingWishlist(prev => ({ ...prev, [productId]: false }));
          return;
        }
        
        // Remove from wishlist using wishlist_id
        // This calls DELETE /orders/wishlist/:wishlist_id/
        const success = await removeFromWishlist(wishlistId);
        
        if (success) {
          console.log("✅ Removed from wishlist:", product.name);
        }
      } else {
        // Add to wishlist
        const result = await addToWishlist(productId);
        
        if (result.success) {
          console.log("✅ Added to wishlist:", product.name);
        }
      }
    } catch (error: any) {
      console.error("Error toggling wishlist:", error);
      
      // Error is already handled in WishlistContext, but show a user-friendly message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          error.message ||
                          "Failed to update wishlist";
      
      Alert.alert(
        "Wishlist Error",
        errorMessage,
        [{ text: "OK" }]
      );
    } finally {
      // Clear loading state for this product
      setTogglingWishlist(prev => ({ ...prev, [productId]: false }));
    }
  }, [isAuthenticated, router, isInWishlist, addToWishlist, removeFromWishlist, getWishlistId, togglingWishlist]);

  // Check if a product is currently being added to cart
  const isAddingToCart = useCallback((productId: string) => {
    return addingToCart[productId] || false;
  }, [addingToCart]);

  // Check if wishlist operation is in progress for a product
  const isTogglingWishlist = useCallback((productId: string) => {
    return togglingWishlist[productId] || false;
  }, [togglingWishlist]);

  const renderProductItem = useCallback(({ item, index }: { item: Product; index: number }) => {
    const isProductInCart = isInCart(item.id);
    const isProductAddingToCart = isAddingToCart(item.id);
    const isProductOutOfStock = !item.is_in_stock;
    const isProductInWishlist = isInWishlist(item.id);
    const isWishlistToggling = isTogglingWishlist(item.id);
    
    return (
      <TouchableOpacity
        className="bg-white rounded-xl shadow-sm p-3 border border-gray-200 m-1 relative"
        style={{ width: ITEM_WIDTH }}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.9}
      >
        {/* Wishlist Icon */}
        <TouchableOpacity
          className="absolute top-2 right-2 z-20 bg-white rounded-full p-2 shadow-md"
          onPress={(e) => {
            e.stopPropagation();
            handleWishlistToggle(item);
          }}
          disabled={isWishlistToggling}
          style={{
            opacity: isWishlistToggling ? 0.6 : 1,
            minWidth: 32,
            minHeight: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isWishlistToggling ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <Heart
              size={18}
              color="#DC2626"
              fill={isProductInWishlist ? "#DC2626" : "transparent"}
              strokeWidth={2}
            />
          )}
        </TouchableOpacity>

        {/* Product Image/Placeholder */}
        <View className="w-full h-40 bg-gray-100 rounded-lg mb-3 items-center justify-center">
          <Text className="text-xs text-gray-500 text-center px-1">{item.category_name || "Product"}</Text>
        </View>

        {/* Product Name */}
        <Text className="font-semibold text-gray-800 mb-1" numberOfLines={2}>{item.name || "Unnamed Product"}</Text>
        
        {/* Brand Name */}
        <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>{item.brand_name || "No Brand"}</Text>

        {/* Rating and Stock Status */}
        <View className="flex-row items-center justify-between mb-2">
          {item.rating_average && parseFloat(item.rating_average) > 0 ? (
            <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded">
              <Text className="text-yellow-500 mr-1">★</Text>
              <Text className="text-xs font-semibold text-yellow-700">{parseFloat(item.rating_average).toFixed(1)}</Text>
            </View>
          ) : (
            <Text className="text-xs text-gray-400">No ratings</Text>
          )}
          
          {isProductOutOfStock && (
            <Text className="text-xs text-red-500 font-medium">Out of stock</Text>
          )}
        </View>

        {/* Pricing */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-darkRed font-bold text-lg">{formatPrice(item.price)}</Text>
            {item.compare_at_price && parseFloat(item.compare_at_price) > parseFloat(item.price) && (
              <Text className="text-xs text-gray-400 line-through">{formatPrice(item.compare_at_price)}</Text>
            )}
          </View>
          
          {/* Add to Cart Button */}
          <TouchableOpacity
            className={`p-2 rounded-lg ${isProductInCart ? 'bg-green-600' : 'bg-darkRed'}`}
            onPress={(e) => {
              e.stopPropagation();
              
              // If already in cart, show message instead of re-adding
              if (isProductInCart) {
                Alert.alert(
                  "Already in Cart",
                  `${item.name} is already in your cart`,
                  [{ text: "OK" }]
                );
              } else {
                handleAddToCart(item);
              }
            }}
            disabled={isProductOutOfStock || isProductAddingToCart || cartSyncing}
            style={{ 
              opacity: isProductOutOfStock ? 0.5 : 1,
              minWidth: 44,
              minHeight: 44,
            }}
          >
            {isProductAddingToCart ? (
              <ActivityIndicator size="small" color="white" />
            ) : isProductInCart ? (
              <Check size={18} color="white" />
            ) : (
              <ShoppingCart size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Optional: Show "In Cart" badge */}
        {isProductInCart && !isProductAddingToCart && (
          <View className="absolute top-2 left-2 bg-green-100 px-2 py-1 rounded-full border border-green-300">
            <Text className="text-xs text-green-800 font-medium">In Cart</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [handleProductPress, formatPrice, handleAddToCart, isInCart, cartSyncing, isInWishlist, handleWishlistToggle, isAddingToCart, isTogglingWishlist]);

  const renderFooter = useCallback(() => {
    if (productsLoading) return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#DC2626" />
        <Text className="text-gray-500 text-sm mt-2">Loading more products...</Text>
      </View>
    );

    if (hasMore && products.length > 0) return (
      <TouchableOpacity 
        className="py-4 items-center" 
        onPress={loadMoreProducts}
        disabled={productsLoading}
      >
        <Text className="text-red-600 font-medium">
          {productsLoading ? "Loading..." : "Load More Products"}
        </Text>
      </TouchableOpacity>
    );

    if (products.length > 0) return (
      <View className="py-4 items-center border-t border-gray-200 mt-4">
        <Text className="text-gray-500 text-sm">
          {totalProducts === products.length
            ? `Showing all ${totalProducts} products`
            : `Showing ${products.length} of ${totalProducts} products`}
        </Text>
      </View>
    );

    return null;
  }, [productsLoading, hasMore, products.length, totalProducts, loadMoreProducts]);

  const renderEmpty = useCallback(() => (
    <View className="py-20 items-center px-4">
      <Text className="text-gray-600 text-lg font-medium mb-2">
        No products found
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        {error || "Try adjusting your search or browse different categories"}
      </Text>
      <TouchableOpacity className="bg-red-600 px-6 py-3 rounded-lg" onPress={handleRetry}>
        <Text className="text-white font-medium">Browse Products</Text>
      </TouchableOpacity>
    </View>
  ), [error, handleRetry]);

  if (loading && products.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <DashboardHeader />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#DC2626" />
          <Text className="mt-4 text-gray-600">Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <DashboardHeader />

      {/* Product Type Toggle */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            className="flex-1 py-2 rounded-md bg-white shadow-sm"
            onPress={() => router.push("/(customer)/explore")}
            activeOpacity={0.7}
          >
            <Text className="text-center text-sm font-medium text-darkRed">
              Vendor Products
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-2 rounded-md flex-row items-center justify-center"
            onPress={() => router.push("/(customer)/explore-dropship")}
            activeOpacity={0.7}
          >
            <Package size={16} color="#DC2626" />
            <Text className="text-center text-sm font-medium ml-1 text-darkRed">
              Stock Products
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Count */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-sm font-medium text-gray-900">
          {totalProducts} {totalProducts === 1 ? "product" : "products"} found
          {searchQuery ? ` for "${searchQuery}"` : ""}
        </Text>
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => getUniqueKey(item, index)}
        numColumns={2}
        contentContainerStyle={{ padding: 8, paddingBottom: 20, flexGrow: products.length === 0 ? 1 : 0 }}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 8 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={["#DC2626"]} 
            tintColor="#DC2626" 
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        // Disable scroll when cart or wishlist is syncing
        scrollEnabled={!cartSyncing && !wishlistSyncing}
      />
    </SafeAreaView>
  );
};

export default Explore;