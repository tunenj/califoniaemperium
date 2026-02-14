// app/(customer)/explore.tsx
import React, { useEffect, useState, useCallback, memo } from "react";
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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome, AntDesign } from "@expo/vector-icons";
import DashboardHeader from "@/components/explore/DashboardHeader";
import api from "@/api/api";
import { endpoints } from "@/api/endpoints";
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
  brand_name: string | null;
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
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 24) / 2;

// ✅ OPTIMIZED: Memoized Product Image Component
const ProductImage = memo(({ uri }: { uri: string | null }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!uri || imageError) {
    return (
      <View className="w-full h-full items-center justify-center bg-gray-100">
        <MaterialIcons name="image" size={40} color="#9CA3AF" />
        <Text className="text-xs text-gray-400 mt-1">No image</Text>
      </View>
    );
  }

  return (
    <>
      {imageLoading && (
        <View className="absolute inset-0 items-center justify-center bg-gray-100 z-10">
          <ActivityIndicator size="small" color="#DC2626" />
        </View>
      )}
      <Image
        source={{ 
          uri,
          // ✅ Add cache control
          cache: 'force-cache',
        }}
        className="w-full h-full"
        resizeMode="contain"
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </>
  );
});

ProductImage.displayName = 'ProductImage';

// ✅ OPTIMIZED: Memoized Product Item Component
const ProductItem = memo(({ 
  item, 
  onPress, 
  onAddToCart, 
  onWishlistToggle,
  isInCart,
  isInWishlist,
  isAddingToCart,
  isTogglingWishlist,
  cartSyncing,
  formatPrice,
  getDiscountPercentage,
}: {
  item: Product;
  onPress: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onWishlistToggle: (product: Product) => void;
  isInCart: boolean;
  isInWishlist: boolean;
  isAddingToCart: boolean;
  isTogglingWishlist: boolean;
  cartSyncing: boolean;
  formatPrice: (price: string) => string;
  getDiscountPercentage: (price: string, comparePrice: string | null) => number;
}) => {
  const isProductOutOfStock = !item.is_in_stock;
  const discountPercentage = getDiscountPercentage(item.price, item.compare_at_price);

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-sm p-3 border border-gray-200 m-1 relative"
      style={{ width: ITEM_WIDTH }}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <View className="absolute top-2 left-2 z-20 bg-red-500 px-2 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">-{discountPercentage}%</Text>
        </View>
      )}

      {/* Wishlist Icon */}
      <TouchableOpacity
        className="absolute top-2 right-2 z-20 bg-white rounded-full p-2 shadow-md"
        style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
        onPress={(e) => {
          e.stopPropagation();
          onWishlistToggle(item);
        }}
        disabled={isTogglingWishlist}
      >
        {isTogglingWishlist ? (
          <ActivityIndicator size="small" color="#DC2626" />
        ) : (
          <AntDesign
            name={isInWishlist ? "heart" : "heart"}
            size={18}
            color={isInWishlist ? "#DC2626" : "#6B7280"}
          />
        )}
      </TouchableOpacity>

      {/* Product Image - Now Optimized */}
      <View className="w-full h-40 bg-gray-100 rounded-lg mb-3 overflow-hidden">
        <ProductImage uri={item.main_image} />
      </View>

      {/* Product Name */}
      <Text className="font-semibold text-gray-800 mb-1" numberOfLines={2}>
        {item.name}
      </Text>

      {/* Category Name */}
      <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
        {item.category_name}
      </Text>

      {/* Rating */}
      <View className="flex-row items-center mb-2">
        {item.rating_count > 0 ? (
          <>
            <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded">
              <Text className="text-yellow-500 mr-1">★</Text>
              <Text className="text-xs font-semibold text-yellow-700">
                {parseFloat(item.rating_average).toFixed(1)}
              </Text>
            </View>
            <Text className="text-xs text-gray-400 ml-1">
              ({item.rating_count})
            </Text>
          </>
        ) : (
          <Text className="text-xs text-gray-400">No ratings yet</Text>
        )}
      </View>

      {/* Stock Status */}
      {isProductOutOfStock && (
        <Text className="text-xs text-red-500 font-medium mb-2">Out of Stock</Text>
      )}

      {/* Pricing */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-darkRed font-bold text-lg">
            {formatPrice(item.price)}
          </Text>
          {item.compare_at_price && parseFloat(item.compare_at_price) > parseFloat(item.price) && (
            <Text className="text-xs text-gray-400 line-through">
              {formatPrice(item.compare_at_price)}
            </Text>
          )}
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          className={`p-2 rounded-lg ${isInCart ? 'bg-green-600' : 'bg-darkRed'}`}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          onPress={(e) => {
            e.stopPropagation();

            if (isInCart) {
              Alert.alert(
                "Already in Cart",
                `${item.name} is already in your cart`,
                [{ text: "OK" }]
              );
            } else {
              onAddToCart(item);
            }
          }}
          disabled={isProductOutOfStock || isAddingToCart || cartSyncing}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color="white" />
          ) : isInCart ? (
            <AntDesign name="check" size={18} color="white" />
          ) : (
            <FontAwesome name="shopping-cart" size={18} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* In Cart Badge */}
      {isInCart && !isAddingToCart && (
        <View className="absolute top-2 left-2 bg-green-100 px-2 py-1 rounded-full border border-green-300">
          <Text className="text-xs text-green-800 font-medium">In Cart</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

ProductItem.displayName = 'ProductItem';

const Explore = () => {
  const router = useRouter();
  const { searchQuery } = useExploreSearch();

  const {
    addItem,
    isInCart,
    syncing: cartSyncing
  } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistId,
    syncing: wishlistSyncing
  } = useWishlist();

  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  const [togglingWishlist, setTogglingWishlist] = useState<{ [key: string]: boolean }>({});

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

        if (page === 1 || isRefresh) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
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
  }, [searchQuery, fetchProducts]);

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
    return `₦${numPrice.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  const getDiscountPercentage = useCallback((price: string, comparePrice: string | null) => {
    if (!comparePrice) return 0;
    const original = parseFloat(comparePrice);
    const current = parseFloat(price);
    if (original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  }, []);

  const handleAddToCart = useCallback(async (product: Product) => {
    if (!product.is_in_stock) {
      Alert.alert(
        "Out of Stock",
        "This product is currently out of stock",
        [{ text: "OK" }]
      );
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));

    try {
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

      const result = await addItem(itemData, 1);

      if (result.success) {
        console.log("✅ Added to cart:", product.name);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  }, [addItem]);

  const handleWishlistToggle = useCallback(async (product: Product) => {
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

    if (togglingWishlist[productId]) {
      return;
    }

    setTogglingWishlist(prev => ({ ...prev, [productId]: true }));

    try {
      if (isCurrentlyInWishlist) {
        const wishlistId = getWishlistId(productId);

        if (!wishlistId) {
          console.error('[Wishlist] No wishlist ID found for product:', productId);
          Alert.alert('Error', 'Failed to remove from wishlist');
          setTogglingWishlist(prev => ({ ...prev, [productId]: false }));
          return;
        }

        const success = await removeFromWishlist(wishlistId);

        if (success) {
          console.log("✅ Removed from wishlist:", product.name);
        }
      } else {
        const result = await addToWishlist(productId);

        if (result.success) {
          console.log("✅ Added to wishlist:", product.name);
        }
      }
    } catch (error: any) {
      console.error("Error toggling wishlist:", error);

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
      setTogglingWishlist(prev => ({ ...prev, [productId]: false }));
    }
  }, [isAuthenticated, router, isInWishlist, addToWishlist, removeFromWishlist, getWishlistId, togglingWishlist]);

  // ✅ OPTIMIZED: Render product item using memoized component
  const renderProductItem = useCallback(({ item }: { item: Product }) => {
    return (
      <ProductItem
        item={item}
        onPress={handleProductPress}
        onAddToCart={handleAddToCart}
        onWishlistToggle={handleWishlistToggle}
        isInCart={isInCart(item.id)}
        isInWishlist={isInWishlist(item.id)}
        isAddingToCart={addingToCart[item.id] || false}
        isTogglingWishlist={togglingWishlist[item.id] || false}
        cartSyncing={cartSyncing}
        formatPrice={formatPrice}
        getDiscountPercentage={getDiscountPercentage}
      />
    );
  }, [
    handleProductPress, 
    handleAddToCart, 
    handleWishlistToggle, 
    isInCart, 
    isInWishlist,
    addingToCart,
    togglingWishlist,
    cartSyncing,
    formatPrice,
    getDiscountPercentage
  ]);

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
    <View className="py-20 items-center px-4 flex-1 justify-center">
      <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
      <Text className="text-gray-800 text-lg font-medium mt-4 mb-2">
        No products found
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        {error || "Try adjusting your search or browse different categories"}
      </Text>
      <TouchableOpacity
        className="bg-red-600 px-6 py-3 rounded-lg"
        onPress={handleRetry}
      >
        <Text className="text-white font-medium">Browse Products</Text>
      </TouchableOpacity>
    </View>
  ), [error, handleRetry]);

  const getUniqueKey = useCallback((item: Product, index: number) => {
    return `${item.id}-${item.sku || index}`;
  }, []);

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
            <MaterialIcons name="inventory" size={16} color="#DC2626" />
            <Text className="text-center text-sm font-medium ml-1 text-darkRed">
              Stock Products
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-sm font-medium text-gray-900">
          {totalProducts} {totalProducts === 1 ? "product" : "products"} found
          {searchQuery ? ` for "${searchQuery}"` : ""}
        </Text>
      </View>

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
        // ✅ PERFORMANCE OPTIMIZATIONS
        removeClippedSubviews={true}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: 280, // Approximate item height
          offset: 280 * index,
          index,
        })}
        scrollEnabled={!cartSyncing && !wishlistSyncing}
      />
    </SafeAreaView>
  );
};

export default Explore;