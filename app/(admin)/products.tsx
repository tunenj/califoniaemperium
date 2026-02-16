import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { router } from "expo-router";

/* ================= TYPES ================= */

type VendorStatus = "Approved" | "Pending" | "Suspended";

type Product = {
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
  // Add these for compatibility with existing UI
  vendor?: string;
  stock?: number;
  status?: VendorStatus;
  image?: any;
  cost?: string;
  created?: string;
};

type ApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
};

/* ================= HELPER FUNCTIONS ================= */

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatPrice = (price: string) => {
  const numPrice = parseFloat(price);
  return `₦${numPrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/* ================= NAVIGATION HELPER ================= */

// Navigation helper with correct path for admin
const navigateToProductDetails = (slug: string) => {
  console.log('Navigating to product:', slug);
  // Using the admin route with dynamic [id] parameter
  router.push(`/(admin)/${slug}`);
};

/* ================= ROW ================= */

function ProductRow({ item }: { item: Product }) {
  const { t } = useLanguage();

  // Map API status to UI status
  const getProductStatus = (product: Product): VendorStatus => {
    // You can customize this logic based on your business rules
    if (product.is_featured) return "Approved";
    if (product.is_in_stock) return "Pending";
    return "Suspended";
  };

  const status = getProductStatus(item);
  
  const getStatusTranslation = (status: VendorStatus) => {
    const translations: Record<VendorStatus, string> = {
      'Approved': t('approved'),
      'Pending': t('pending'),
      'Suspended': t('suspended'),
    };
    return translations[status];
  };

  const statusStyle = status === "Approved"
    ? "bg-green-100 text-green-700"
    : status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <TouchableOpacity
      onPress={() => navigateToProductDetails(item.slug)}
      activeOpacity={0.7}
      className="flex-row border-b border-gray-200 py-3 bg-white"
    >
      {/* Product */}
      <View className="w-64 px-3 flex-row items-center gap-2">
        {item.main_image ? (
          <Image source={{ uri: item.main_image }} className="w-9 h-9 rounded-md" />
        ) : (
          <View className="w-9 h-9 rounded-md bg-gray-200 items-center justify-center">
            <Ionicons name="image-outline" size={16} color="#9CA3AF" />
          </View>
        )}
        <Text numberOfLines={2} className="text-sm font-semibold flex-1">
          {item.name}
        </Text>
      </View>

      {/* Category */}
      <Cell width="w-40" text={item.category_name || 'Uncategorized'} />

      {/* Stock */}
      <Cell width="w-28" text={item.is_in_stock ? 'In Stock' : 'Out of Stock'} />

      {/* Price */}
      <View className="w-44 px-3">
        <Text className="text-sm font-semibold">{formatPrice(item.price)}</Text>
        {item.compare_at_price && (
          <Text className="text-xs text-gray-500 line-through">
            {formatPrice(item.compare_at_price)}
          </Text>
        )}
        {item.discount_percentage > 0 && (
          <Text className="text-xs text-green-600">
            -{item.discount_percentage}% off
          </Text>
        )}
      </View>

      {/* Status */}
      <View className="w-32 px-3">
        <Text
          className={`text-xs px-3 py-0.5 rounded-full text-center ${statusStyle}`}
        >
          {getStatusTranslation(status)}
        </Text>
      </View>

      {/* Created */}
      <Cell width="w-32" text={formatDate(item.created_at)} />
    </TouchableOpacity>
  );
}

/* ================= SCREEN ================= */

export default function ProductModeration() {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<"All" | VendorStatus>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1,
  });
  
  const { t } = useLanguage();

  // Fetch products from API
  const fetchProducts = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const token = await AsyncStorage.getItem('accessToken');
      
      let url = `${endpoints.products}?page=${page}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await api.get<ApiResponse>(url, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });

      const newProducts = response.data.results || [];

      if (page === 1 || isRefresh) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }

      setPagination({
        count: response.data.count || 0,
        next: response.data.next,
        previous: response.data.previous,
        currentPage: page,
      });

    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load products');
      if (page === 1) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load products',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search]);

  // Initial load
  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
    fetchProducts(1);
  }, [search, fetchProducts]);

  const [currentPage, setCurrentPage] = useState(1);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setProducts([]);
    setPagination({
      count: 0,
      next: null,
      previous: null,
      currentPage: 1,
    });
    fetchProducts(1, true);
  }, [fetchProducts]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (pagination.next && !loadingMore && !loading && !refreshing) {
      const nextPage = pagination.currentPage + 1;
      fetchProducts(nextPage);
    }
  }, [pagination.next, pagination.currentPage, loadingMore, loading, refreshing, fetchProducts]);

  // Filter products based on status
  const filteredData = useMemo(() => {
    let filtered = products;

    // Apply status filter
    if (activeStatus !== "All") {
      filtered = filtered.filter(p => {
        // Map product properties to status based on your business logic
        const productStatus = 
          p.is_featured ? "Approved" :
          p.is_in_stock ? "Pending" : "Suspended";
        return productStatus === activeStatus;
      });
    }

    return filtered;
  }, [products, activeStatus]);

  const getStatusTranslation = (status: "All" | VendorStatus) => {
    const translations: Record<string, string> = {
      'All': t('all'),
      'Approved': t('approved'),
      'Pending': t('pending'),
      'Suspended': t('suspended'),
    };
    return translations[status];
  };

  const statusFilters: ("All" | VendorStatus)[] = ["All", "Pending", "Approved", "Suspended"];

  // Render footer for loading more
  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#C62828" />
          <Text className="text-xs text-gray-500 mt-2">
            {t('loading_more') || 'Loading more products...'}
          </Text>
        </View>
      );
    }

    if (pagination.next && products.length > 0) {
      return (
        <TouchableOpacity
          className="py-4 items-center"
          onPress={handleLoadMore}
          disabled={loadingMore}
        >
          <Text className="text-red-600 font-medium">
            {t('load_more') || 'Load More Products'}
          </Text>
        </TouchableOpacity>
      );
    }

    if (products.length > 0) {
      return (
        <View className="py-4 items-center border-t border-gray-200 mt-4">
          <Text className="text-xs text-gray-500">
            {pagination.count === products.length
              ? `Showing all ${pagination.count} products`
              : `Showing ${products.length} of ${pagination.count} products`}
          </Text>
        </View>
      );
    }

    return null;
  }, [loadingMore, pagination.next, pagination.count, products.length, t, handleLoadMore]);

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  if (loading && products.length === 0) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#C62828" />
        <Text className="mt-4 text-gray-600">
          {t('loading_products') || 'Loading products...'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-4">
      {/* Title */}
      <Text className="text-lg font-bold text-gray-900">
        {t('product_moderation')}
      </Text>
      <Text className="text-sm text-gray-500 mb-4">
        {t('review_and_approve_products')} ({pagination.count} total)
      </Text>

      {/* Search */}
      <View className="flex-row items-center bg-gray-100 rounded-xl border border-gray-300 px-3 py-1 mb-4">
        <Ionicons name="search-outline" size={20} color="#6b7280" />
        <TextInput
          placeholder={t('search_products')}
          placeholderTextColor="#6b7280"
          className="flex-1 ml-2 text-sm"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <Text className="text-red-600 text-center text-sm">{error}</Text>
          <TouchableOpacity onPress={handleRetry} className="mt-2 items-center">
            <Text className="text-red-500 text-sm underline">
              {t('try_again') || 'Try Again'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STATUS FILTERS */}
      <View className="flex-row gap-2 mb-4">
        {statusFilters.map((status) => {
          const isActive = activeStatus === status;

          return (
            <TouchableOpacity
              key={status}
              onPress={() => setActiveStatus(status)}
              className={`px-4 py-1 rounded-full ${isActive
                  ? "bg-red-600"
                  : "bg-gray-100"
                }`}
            >
              <Text
                className={`text-xs ${isActive
                    ? "text-white font-semibold"
                    : "text-gray-600"
                  }`}
              >
                {getStatusTranslation(status)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TABLE */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductRow item={item} />}
            stickyHeaderIndices={[0]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#C62828']}
                tintColor="#C62828"
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={() => (
              <View className="py-16 items-center">
                <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
                <Text className="mt-2 text-gray-500 text-center">
                  {search 
                    ? t('no_products_found') || 'No products found matching your search'
                    : t('no_products_available') || 'No products available'}
                </Text>
                {search && (
                  <TouchableOpacity
                    onPress={() => setSearch('')}
                    className="mt-4 px-4 py-2 bg-red-500 rounded-lg"
                  >
                    <Text className="text-white font-medium">Clear Search</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListHeaderComponent={() => (
              <View className="flex-row border-b border-gray-300 bg-gray-100">
                <Header title={t('products')} width="w-64" />
                <Header title={t('category')} width="w-40" />
                <Header title={t('stock')} width="w-28" />
                <Header title={t('price')} width="w-44" />
                <Header title={t('status')} width="w-32" />
                <Header title={t('created')} width="w-32" />
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* Toast component */}
      <Toast />
    </View>
  );
}

/* ================= SMALL COMPONENTS ================= */

const Header = ({ title, width }: { title: string; width: string }) => (
  <Text className={`${width} px-3 text-xs font-semibold text-gray-500 py-3`}>
    {title}
  </Text>
);

const Cell = ({ text, width }: { text: string; width: string }) => (
  <Text className={`${width} px-3 text-sm text-gray-600 py-3`}>
    {text}
  </Text>
);