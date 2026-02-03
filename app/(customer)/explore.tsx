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
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import DashboardHeader from "@/components/explore/dashboard";
import api from "@/api/api";
import { endpoints } from '@/api/endpoints';
import { ShoppingCart } from "lucide-react-native";

// Define TypeScript interfaces
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

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 24) / 2; // 12px padding on sides, 2 columns

const Explore = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  // Navigate to product page
  const handleProductPress = (product: Product) => {
    if (!product?.slug) return;

    router.push({
      pathname: "/(customer)/product/[slug]",
      params: { slug: product.slug, productName: product.name || "Product" },
    });
  };

  // Fetch products with pagination
  const fetchProducts = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setProductsLoading(true);
      }

      const response = await api.get<ProductsResponse>(`${endpoints.products}?page=${page}`);

      if (response.data) {
        const newProducts = response.data.results || [];
        
        // Create unique keys by combining id with sku or timestamp
        const productsWithUniqueKeys = newProducts.map((product, index) => ({
          ...product,
          uniqueKey: `${product.id}-${product.sku || index}-${Date.now()}`
        }));

        if (page === 1 || isRefresh) {
          setProducts(productsWithUniqueKeys);
        } else {
          setProducts(prev => [...prev, ...productsWithUniqueKeys]);
        }

        setHasMore(response.data.next !== null);
        setCurrentPage(page);
        setTotalProducts(response.data.count || 0);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products');
      if (page === 1) setProducts([]);
    } finally {
      setLoading(false);
      setProductsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const loadMoreProducts = () => {
    if (hasMore && !productsLoading && !loading) {
      fetchProducts(currentPage + 1);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(1, true);
  }, []);

  const handleRetry = () => {
    fetchProducts(1);
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "₦0";
    
    return `₦${numPrice.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  };

  const getCategoryIcon = (categoryName: string | undefined) => {
    if (!categoryName) return '📦';
    const name = categoryName.toLowerCase();
    if (name.includes('fashion') || name.includes('clothing')) return '👕';
    if (name.includes('electronics') || name.includes('tech')) return '📱';
    if (name.includes('home') || name.includes('kitchen')) return '🏠';
    if (name.includes('gaming')) return '🎮';
    if (name.includes('audio')) return '🎧';
    return '📦';
  };

  const getUniqueKey = (item: Product, index: number) => {
    return `${item.id}-${item.sku}-${index}-${Date.now()}`;
  };

  const handleAddToCart = (product: Product) => {
    console.log("Add to cart:", product.id);
  };

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-sm p-3 border border-gray-200 m-1"
      style={{ width: ITEM_WIDTH }}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.9}
    >
      {/* Product Image Placeholder */}
      <View className="w-full h-40 bg-gray-100 rounded-lg mb-3 items-center justify-center">
        <Text className="text-4xl mb-2">{getCategoryIcon(item.category_name)}</Text>
        <Text className="text-xs text-gray-500 text-center px-1">{item.category_name || 'Product'}</Text>
      </View>
      
      <Text className="font-semibold text-gray-800 mb-1" numberOfLines={2}>{item.name}</Text>
      <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>{item.brand_name || 'No Brand'}</Text>
      
      <View className="flex-row items-center justify-between mb-2">
        {item.rating_average && parseFloat(item.rating_average) > 0 ? (
          <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded">
            <Text className="text-yellow-500 mr-1">★</Text>
            <Text className="text-xs font-semibold text-yellow-700">{parseFloat(item.rating_average).toFixed(1)}</Text>
          </View>
        ) : (
          <Text className="text-xs text-gray-400">No ratings</Text>
        )}
        {!item.is_in_stock && <Text className="text-xs text-red-500 font-medium">Out of stock</Text>}
      </View>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-darkRed font-bold text-lg">{formatPrice(item.price)}</Text>
          {item.compare_at_price && parseFloat(item.compare_at_price) > parseFloat(item.price) && (
            <Text className="text-xs text-gray-400 line-through">{formatPrice(item.compare_at_price)}</Text>
          )}
        </View>
        <TouchableOpacity
          className="bg-darkRed p-2 rounded-lg"
          onPress={() => handleAddToCart(item)}
          disabled={!item.is_in_stock}
          style={{ opacity: item.is_in_stock ? 1 : 0.5 }}
        >
          <ShoppingCart size={18} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (productsLoading) return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#DC2626" />
        <Text className="text-gray-500 text-sm mt-2">Loading more products...</Text>
      </View>
    );

    if (hasMore && products.length > 0) {
      return (
        <TouchableOpacity className="py-4 items-center" onPress={loadMoreProducts}>
          <Text className="text-red-600 font-medium">Load More Products</Text>
        </TouchableOpacity>
      );
    }

    if (products.length > 0) {
      return (
        <View className="py-4 items-center border-t border-gray-200 mt-4">
          <Text className="text-gray-500 text-sm">
            {totalProducts === products.length
              ? `Showing all ${totalProducts} products`
              : `Showing ${products.length} of ${totalProducts} products`}
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View className="py-20 items-center px-4">
        <Text className="text-gray-600 text-lg font-medium mb-2">No products found</Text>
        <Text className="text-gray-500 text-center mb-6">{error || "Try adjusting your search or browse different categories"}</Text>
        <TouchableOpacity className="bg-red-600 px-6 py-3 rounded-lg" onPress={handleRetry}>
          <Text className="text-white font-medium">Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  };

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

  if (error && products.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <DashboardHeader />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-600 text-lg font-semibold mb-2">Error Loading Products</Text>
          <Text className="text-gray-600 text-center mb-6">{error}</Text>
          <TouchableOpacity className="bg-red-600 px-6 py-3 rounded-lg" onPress={handleRetry}>
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <DashboardHeader />

      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-gray-900">
            {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
          </Text>
          <TouchableOpacity className="flex-row items-center" activeOpacity={0.7}>
            <Text className="text-xs text-gray-600 mr-1">Sort by: </Text>
            <Text className="text-xs text-secondary">Popular ▾</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => getUniqueKey(item, index)}
        numColumns={2}
        contentContainerStyle={{ padding: 8, paddingBottom: 20, flexGrow: products.length === 0 ? 1 : 0 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} tintColor="#DC2626" />}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
};

export default Explore;
