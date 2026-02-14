// app/(customer)/explore-dropship.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  View,
  ActivityIndicator,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import DashboardHeader from "@/components/explore/DashboardHeader";
import api from "@/api/api";
import { endpoints } from "@/api/endpoints";
import { MaterialCommunityIcons, Feather, AntDesign } from "@expo/vector-icons";
import { useExploreSearch } from "@/context/ExploreSearchContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

interface Category {
  id: string;
  name: string;
  slug: string;
  full_path: string;
}

interface DropshipInfo {
  supplier_name: string;
  shipping_time_min: number;
  shipping_time_max: number;
  ships_from: string;
}

// Updated Product interface without product_type
interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description: string;
  category: Category;
  brand: string | null;
  price: string;
  compare_at_price: string | null;
  discount_percentage: number;
  stock_quantity: number;
  is_in_stock: boolean;
  is_low_stock: boolean;
  condition: string;
  is_active: boolean;
  is_featured: boolean;
  images: any[];
  view_count: number;
  purchase_count: number;
  rating_average: string;
  rating_count: number;
  dropship_info: DropshipInfo | null;
  created_at: string;
  updated_at: string;
}

interface DropshipProduct {
  product: Product;
  external_id: string;
  external_url: string;
  supplier_name: string;
  supplier_country: string;
  shipping_cost: string;
  shipping_time_min: number;
  shipping_time_max: number;
  ships_from: string;
  ships_to: string[];
  price_markup_percentage: string;
  calculated_price: number;
  sync_status: string;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
  uniqueKey?: string;
}

interface DropshipProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DropshipProduct[];
}

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 24) / 2;

// Helper function to clean product data by removing product_type
const cleanProductData = (productData: any): Product => {
  const { product_type, ...cleanedProduct } = productData;
  return cleanedProduct;
};

// Helper function to clean dropship product data
const cleanDropshipProductData = (dropshipProduct: any): DropshipProduct => {
  return {
    ...dropshipProduct,
    product: cleanProductData(dropshipProduct.product)
  };
};

const ExploreDropship = () => {
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
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    getWishlistId,
  } = useWishlist();

  // Use auth context
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState<DropshipProduct[]>([]);
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

  // Fetch dropship products with data cleaning
  const fetchDropshipProducts = useCallback(
    async (page: number = 1, isRefresh: boolean = false) => {
      try {
        if (page === 1) {
          setLoading(true);
          setError(null);
        } else {
          setProductsLoading(true);
        }

        let url = `${endpoints.dropshipProducts}?page=${page}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

        const response = await api.get<DropshipProductsResponse>(url);

        // Clean the data by removing product_type from each product
        const cleanedResults = response.data.results.map(cleanDropshipProductData);
        
        const newProducts = cleanedResults || [];
        const productsWithUniqueKeys = newProducts.map((product, index) => ({
          ...product,
          uniqueKey: `${product.product.id}-${product.external_id || index}-${page}-${index}`,
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
        console.error("Error fetching dropship products:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to load products";
        setError(errorMessage);
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
    fetchDropshipProducts(1);
  }, [fetchDropshipProducts]);

  const loadMoreProducts = useCallback(() => {
    if (hasMore && !productsLoading && !loading) {
      fetchDropshipProducts(currentPage + 1);
    }
  }, [hasMore, productsLoading, loading, currentPage, fetchDropshipProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDropshipProducts(1, true);
  }, [fetchDropshipProducts]);

  const handleRetry = useCallback(() => {
    fetchDropshipProducts(1);
  }, [fetchDropshipProducts]);

  const handleProductPress = useCallback((product: DropshipProduct) => {
    if (!product.product.slug) return;
    router.push({
      pathname: "/(customer)/product/[slug]",
      params: { 
        slug: product.product.slug, 
        productName: product.product.name || "Product",
        productId: product.product.id,
        isDropship: "true"
      },
    });
  }, [router]);

  const formatPrice = useCallback((price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "₦0";
    return `₦${numPrice.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  const getUniqueKey = useCallback((item: DropshipProduct, index: number) => 
    item.uniqueKey || `${item.product.id}-${item.external_id || "no-ext-id"}-${index}`,
  []);

  // Check if a product is currently being added to cart
  const isAddingToCart = useCallback((productId: string) => {
    return addingToCart[productId] || false;
  }, [addingToCart]);

  // Check if wishlist operation is in progress for a product
  const isTogglingWishlist = useCallback((productId: string) => {
    return togglingWishlist[productId] || false;
  }, [togglingWishlist]);

  // Handle wishlist toggle
  const handleWishlistToggle = useCallback(async (product: DropshipProduct) => {
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

    const productId = product.product.id;
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
          console.log("✅ Removed from wishlist:", product.product.name);
        }
      } else {
        // Add to wishlist
        const result = await addToWishlist(productId);
        
        if (result.success) {
          console.log("✅ Added to wishlist:", product.product.name);
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

  // Updated handleAddToCart function
  const handleAddToCart = useCallback(async (product: DropshipProduct) => {
    // Check if product is in stock
    if (!product.product.is_in_stock) {
      Alert.alert(
        "Out of Stock",
        "This product is currently out of stock",
        [{ text: "OK" }]
      );
      return;
    }

    // Set loading state for this specific product
    setAddingToCart(prev => ({ ...prev, [product.product.id]: true }));

    try {
      // Get the actual price to use (calculated price if available, otherwise regular price)
      const priceToUse = product.calculated_price 
        ? product.calculated_price 
        : parseFloat(product.product.price);
      
      // Prepare item data for the cart
      const itemData = {
        productId: product.product.id,
        storeName: product.supplier_name || product.product.brand || 'Stock Supplier',
        productName: product.product.name,
        price: priceToUse,
        originalPrice: product.product.compare_at_price 
          ? parseFloat(product.product.compare_at_price)
          : priceToUse,
        image: product.product.images && product.product.images.length > 0 
          ? product.product.images[0] 
          : null,
      };

      console.log('🛒 Adding dropship product to cart:', itemData);
      
      // Add to cart via API
      const result = await addItem(itemData, 1);
      
      if (result.success) {
        console.log("✅ Added dropship product to cart:", product.product.name);
        // You could add a brief success feedback here
      }
    } catch (error) {
      console.error("Error adding dropship product to cart:", error);
      // Error is already handled in the CartContext
    } finally {
      // Clear loading state for this product
      setAddingToCart(prev => ({ ...prev, [product.product.id]: false }));
    }
  }, [addItem]);

  const renderProductItem = useCallback(({ item, index }: { item: DropshipProduct; index: number }) => {
    const isProductInCart = isInCart(item.product.id);
    const isProductAdding = isAddingToCart(item.product.id);
    const isProductOutOfStock = !item.product.is_in_stock;
    const isProductInWishlist = isInWishlist(item.product.id);
    const isWishlistToggling = isTogglingWishlist(item.product.id);
    
    return (
      <TouchableOpacity
        className="bg-white rounded-xl shadow-sm p-3 border border-gray-200 m-1 relative"
        style={{ width: ITEM_WIDTH }}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.9}
      >
        {/* Dropship Badge */}
        <View className="absolute top-2 left-2 z-10 bg-blue-500 px-2 py-1 rounded-full flex-row items-center">
          <MaterialCommunityIcons name="package-variant" size={12} color="white" />
          <Text className="text-white text-xs font-semibold ml-1">Stock</Text>
        </View>

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
            <AntDesign 
              name="heart" 
              size={18} 
              color="#DC2626" 
              style={{ color: "#DC2626" }}
            />
          )}
        </TouchableOpacity>

        {/* Shipping Info Badge */}
        <View className="absolute top-12 right-2 z-10 bg-green-500 px-2 py-1 rounded-full flex-row items-center">
          <Feather name="truck" size={12} color="white" />
          <Text className="text-white text-xs font-semibold ml-1">
            {item.shipping_time_min}-{item.shipping_time_max}d
          </Text>
        </View>

        {/* Product Image/Placeholder */}
        <View className="w-full h-40 bg-gray-100 rounded-lg mb-3 items-center justify-center overflow-hidden">
          {item.product.images && item.product.images.length > 0 ? (
            <Image 
              source={{ uri: item.product.images[0] }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <>
              <View className="items-center justify-center">
                <Text className="text-xs text-gray-500 text-center px-1">
                  {item.product.category?.name || "Product"}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Product Name */}
        <Text className="font-semibold text-gray-800 mb-2" numberOfLines={2}>
          {item.product.name || "Unnamed Product"}
        </Text>

        {/* Rating and Stock Status */}
        <View className="flex-row items-center justify-between mb-2">
          {item.product.rating_average && parseFloat(item.product.rating_average) > 0 ? (
            <View className="flex-row items-center">
              <AntDesign name="star" size={14} color="#F59E0B" />
              <Text className="text-xs font-semibold text-yellow-700 ml-1">
                {parseFloat(item.product.rating_average).toFixed(1)}
              </Text>
              <Text className="text-xs text-gray-400 ml-1">
                ({item.product.rating_count || 0})
              </Text>
            </View>
          ) : (
            <Text className="text-xs text-gray-400">No ratings</Text>
          )}
          
          {isProductOutOfStock ? (
            <Text className="text-xs text-red-500 font-medium">Out of stock</Text>
          ) : item.product.is_low_stock ? (
            <Text className="text-xs text-orange-500 font-medium">Low stock</Text>
          ) : (
            <Text className="text-xs text-green-500 font-medium">In stock</Text>
          )}
        </View>

        {/* Pricing */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-darkRed font-bold text-lg">
              {formatPrice(item.calculated_price || item.product.price)}
            </Text>
            
            {/* Show base price vs calculated price */}
            {item.calculated_price && parseFloat(item.product.price) !== item.calculated_price && (
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-400 line-through">
                  {formatPrice(item.product.price)}
                </Text>
                <Text className="text-xs text-green-600 font-medium ml-1">
                  +{item.price_markup_percentage}%
                </Text>
              </View>
            )}
            
            {/* Show discount if available */}
            {item.product.compare_at_price && 
             parseFloat(item.product.compare_at_price) > parseFloat(item.product.price) && (
              <Text className="text-xs text-gray-400 line-through">
                {formatPrice(item.product.compare_at_price)}
              </Text>
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
                  `${item.product.name} is already in your cart`,
                  [{ text: "OK" }]
                );
              } else {
                handleAddToCart(item);
              }
            }}
            disabled={isProductOutOfStock || isProductAdding || cartSyncing}
            style={{ 
              opacity: isProductOutOfStock ? 0.5 : 1,
              minWidth: 44,
              minHeight: 44,
            }}
          >
            {isProductAdding ? (
              <ActivityIndicator size="small" color="white" />
            ) : isProductInCart ? (
              <AntDesign name="check" size={18} color="white" />
            ) : (
              <MaterialCommunityIcons name="cart-outline" size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Optional: Show "In Cart" badge */}
        {isProductInCart && !isProductAdding && (
          <View className="absolute top-24 right-2 bg-green-100 px-2 py-1 rounded-full border border-green-300">
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
            ? `Showing all ${totalProducts} dropship product${totalProducts !== 1 ? 's' : ''}`
            : `Showing ${products.length} of ${totalProducts} dropship products`}
        </Text>
      </View>
    );

    return null;
  }, [productsLoading, hasMore, products.length, totalProducts, loadMoreProducts]);

  const renderEmpty = useCallback(() => (
    <View className="py-20 items-center px-4">
      <Text className="text-gray-600 text-lg font-medium mb-2">
        No dropship products available
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        {typeof error === 'string' ? error : (searchQuery 
          ? `No results found for "${searchQuery}"`
          : "There are currently no dropship products.")}
      </Text>

      {/* Toggle back to Regular Explore */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="bg-red-600 px-6 py-3 rounded-lg"
          onPress={() => router.push("/(customer)/explore")}
        >
          <Text className="text-white font-medium">Vendor Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={handleRetry}
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [error, searchQuery, handleRetry, router]);

  const shippingTimeRange = useMemo(() => {
    if (products.length === 0) return { min: 7, max: 20 };
    const minTime = Math.min(...products.map(p => p.shipping_time_min));
    const maxTime = Math.max(...products.map(p => p.shipping_time_max));
    return { min: minTime, max: maxTime };
  }, [products]);

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

      {/* Toggle Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row gap-2">
        <TouchableOpacity
          className="flex-1 py-2 rounded-md bg-gray-100 items-center"
          onPress={() => router.push("/(customer)/explore")}
        >
          <Text className="text-sm font-medium text-gray-700">Regular Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-2 rounded-md bg-red-100 items-center"
          disabled
        >
          <Text className="text-sm font-medium text-red-600">Stock Products</Text>
        </TouchableOpacity>
      </View>

      {/* Product Count and Info */}
      {products.length > 0 && (
        <View className="px-4 py-3 bg-white border-b border-gray-200">
          <Text className="text-sm font-medium text-gray-900">
            {totalProducts} {totalProducts === 1 ? "Product" : "Products"} found
            {searchQuery ? ` for "${searchQuery}"` : ""}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            Fast delivery with {shippingTimeRange.min}-{shippingTimeRange.max} day shipping
          </Text>
        </View>
      )}

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={getUniqueKey}
        numColumns={2}
        contentContainerStyle={{ 
          padding: 8, 
          paddingBottom: 20, 
          flexGrow: products.length === 0 ? 1 : 0 
        }}
        columnWrapperStyle={{ 
          justifyContent: "space-between", 
          marginBottom: 8 
        }}
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
        // Disable scroll when cart is syncing
        scrollEnabled={!cartSyncing}
      />
    </SafeAreaView>
  );
};

export default ExploreDropship;