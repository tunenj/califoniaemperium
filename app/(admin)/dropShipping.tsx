import React, { memo, useMemo, useState, useEffect, useCallback } from "react";
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
import { router } from "expo-router";
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ================= TYPES ================= */

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

interface ProductImage {
  id: string;
  image: string | null;
  alt_text: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  product_type: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description: string;
  category: Category;
  brand: string | null;
  main_image: string | null;
  price: string;
  compare_at_price: string | null;
  discount_percentage: number;
  stock_quantity: number;
  is_in_stock: boolean;
  is_low_stock: boolean;
  condition: string;
  is_active: boolean;
  is_featured: boolean;
  images: ProductImage[];
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

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DropshipProduct[];
}

/* ================= HELPER FUNCTIONS ================= */
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/* ================= STATUS BADGE ================= */

const StatusBadge = memo(({ status }: { status: string }) => {
  const { t } = useLanguage();

  const statusConfig = useMemo(() => {
    const configs = {
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: "checkmark-circle" as const,
        label: t('active') || 'Active'
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "time" as const,
        label: t('pending') || 'Pending'
      },
      inactive: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: "close-circle" as const,
        label: t('inactive') || 'Inactive'
      },
    };
    return configs[status as keyof typeof configs] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: "help" as const,
      label: status
    };
  }, [status, t]);

  return (
    <View className={`${statusConfig.bg} px-3 py-1.5 rounded-full flex-row items-center gap-1.5`}>
      <Ionicons
        name={statusConfig.icon}
        size={14}
        color={
          statusConfig.text.includes('green') ? '#166534' :
            statusConfig.text.includes('yellow') ? '#854d0e' :
              statusConfig.text.includes('red') ? '#991b1b' :
                '#374151'
        }
      />
      <Text className={`text-xs font-semibold ${statusConfig.text}`}>
        {statusConfig.label}
      </Text>
    </View>
  );
});

StatusBadge.displayName = "StatusBadge";

/* ================= PRODUCT ROW ================= */

// Navigation helper with correct path for admin
const navigateToProductDetails = (slug: string) => {
  console.log('Navigating to product:', slug);
  // Using the admin route with dynamic [id] parameter
  router.push(`/(admin)/${slug}`);
};

const ProductRow = memo(({ item }: { item: DropshipProduct }) => {
  const { t } = useLanguage();

  // Get the primary image or use main_image
  const productImage = item.product.main_image ||
    item.product.images?.find((img: ProductImage) => img.is_primary)?.image ||
    item.product.images?.[0]?.image;

  return (
    <TouchableOpacity
      onPress={() => navigateToProductDetails(item.product.slug)}
      className="flex-row border-b border-gray-100 py-3.5 hover:bg-gray-50 active:bg-gray-50"
    >
      {/* Product */}
      <View className="w-64 px-3 flex-row items-center gap-3">
        {productImage ? (
          <Image
            source={{ uri: productImage }}
            className="w-11 h-11 rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="w-11 h-11 rounded-lg bg-gray-200" />
        )}
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 text-sm" numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
            SKU: {item.product.sku || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Supplier */}
      <View className="w-40 px-3 justify-center">
        <Text className="text-sm text-gray-700 font-medium" numberOfLines={1}>
          {item.supplier_name}
        </Text>
        <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
          {item.supplier_country}
        </Text>
      </View>

      {/* Category */}
      <View className="w-40 px-3 justify-center">
        <Text className="text-sm text-gray-700" numberOfLines={2}>
          {item.product.category?.name || 'Uncategorized'}
        </Text>
      </View>

      {/* Stock */}
      <View className="w-28 px-3 justify-center">
        <Text className={`text-sm font-semibold ${item.product.stock_quantity < 10 ? 'text-red-600' :
            item.product.stock_quantity < 50 ? 'text-yellow-600' :
              'text-green-600'
          }`}>
          {item.product.stock_quantity.toLocaleString()}
        </Text>
        {!item.product.is_in_stock && (
          <Text className="text-xs text-red-500 mt-1">Out of stock</Text>
        )}
      </View>

      {/* Price */}
      <View className="w-44 px-3 justify-center">
        <Text className="text-sm text-red-600 font-bold">
          {formatPrice(item.calculated_price)}
        </Text>
        <View className="flex-row items-center gap-1 mt-1">
          <Text className="text-xs text-gray-400 line-through">
            {formatPrice(parseFloat(item.product.price))}
          </Text>
          <Text className="text-xs text-green-600 font-medium ml-1">
            +{item.price_markup_percentage}%
          </Text>
        </View>
      </View>

      {/* Shipping */}
      <View className="w-32 px-3 justify-center">
        <View className="flex-row items-center gap-1">
          <Ionicons name="time-outline" size={14} color="#6b7280" />
          <Text className="text-xs text-gray-600">
            {item.shipping_time_min}-{item.shipping_time_max}d
          </Text>
        </View>
        <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
          {item.ships_from}
        </Text>
      </View>

      {/* Status */}
      <View className="w-32 px-3 justify-center">
        <StatusBadge status={item.sync_status} />
      </View>

      {/* Created */}
      <View className="w-32 px-3 justify-center">
        <Text className="text-sm text-gray-700">
          {formatDate(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

ProductRow.displayName = "ProductRow";

/* ================= STATS CARDS ================= */

const StatsCards = memo(({
  products,
  totalCount
}: {
  products: DropshipProduct[];
  totalCount: number;
}) => {
  const { t } = useLanguage();

  const stats = useMemo(() => ({
    total: totalCount,
    active: products.filter(p => p.sync_status === 'active').length,
    pending: products.filter(p => p.sync_status === 'pending').length,
    inactive: products.filter(p => p.sync_status === 'inactive').length,
    lowStock: products.filter(p => p.product.is_low_stock).length,
  }), [products, totalCount]);

  const StatCard = ({
    label,
    value,
    icon,
    bgColor,
    iconColor,
    textColor
  }: {
    label: string;
    value: number;
    icon: any;
    bgColor: string;
    iconColor: string;
    textColor: string;
  }) => (
    <View className={`${bgColor} rounded-2xl p-4 shadow-sm border border-opacity-20`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className={`text-xs ${textColor} font-bold uppercase tracking-wide`}>{label}</Text>
        <View className="bg-white/50 p-1.5 rounded-lg">
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
      </View>
      <Text className="text-3xl font-black text-gray-900">{value}</Text>
    </View>
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-5"
    >
      <View className="flex-row gap-3">
        <View className="w-48">
          <StatCard
            label={t('total_products') || 'Total Products'}
            value={stats.total}
            icon="cube"
            bgColor="bg-blue-100"
            iconColor="#1e40af"
            textColor="text-blue-800"
          />
        </View>
        <View className="w-48">
          <StatCard
            label={t('active') || 'Active'}
            value={stats.active}
            icon="checkmark-circle"
            bgColor="bg-green-100"
            iconColor="#15803d"
            textColor="text-green-800"
          />
        </View>
        <View className="w-48">
          <StatCard
            label={t('pending') || 'Pending'}
            value={stats.pending}
            icon="time"
            bgColor="bg-yellow-100"
            iconColor="#b45309"
            textColor="text-yellow-800"
          />
        </View>
        <View className="w-48">
          <StatCard
            label={t('low_stock') || 'Low Stock'}
            value={stats.lowStock}
            icon="alert-circle"
            bgColor="bg-orange-100"
            iconColor="#c2410c"
            textColor="text-orange-800"
          />
        </View>
      </View>
    </ScrollView>
  );
});

StatsCards.displayName = "StatsCards";

/* ================= MAIN SCREEN ================= */

export default function ProductModeration() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<DropshipProduct[]>([]);
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

  // Fetch products with pagination
  const fetchProducts = useCallback(async (pageUrl?: string, isRefresh: boolean = false) => {
    try {
      if (!pageUrl) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      let response;

      if (pageUrl) {
        // For pagination, use the full URL with native fetch
        const token = await AsyncStorage.getItem('authToken');

        console.log('Fetching next page:', pageUrl);

        const fetchResponse = await fetch(pageUrl, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });

        if (!fetchResponse.ok) {
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }

        const data: ApiResponse = await fetchResponse.json();

        // Add unique keys
        const newProducts = data.results.map((product, index) => ({
          ...product,
          uniqueKey: `${product.product.id}-${product.external_id || index}-${Date.now()}-${index}`,
        }));

        // Prevent duplicates when appending
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.product.id));
          const uniqueNewProducts = newProducts.filter(
            p => !existingIds.has(p.product.id)
          );
          console.log(`Adding ${uniqueNewProducts.length} new products. Total: ${prev.length + uniqueNewProducts.length}`);
          return [...prev, ...uniqueNewProducts];
        });

        setPagination({
          count: data.count || 0,
          next: data.next,
          previous: data.previous,
          currentPage: pagination.currentPage + 1,
        });
      } else {
        // Initial load
        const url = `${endpoints.dropshipProducts}?page=1`;
        console.log('Initial fetch:', url);

        response = await api.get<ApiResponse>(url);

        // Add unique keys
        const newProducts = response.data.results.map((product, index) => ({
          ...product,
          uniqueKey: `${product.product.id}-${product.external_id || index}-1-${Date.now()}-${index}`,
        }));

        setProducts(newProducts);

        setPagination({
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: 1,
        });

        console.log(`Loaded ${newProducts.length} products. Total: ${response.data.count}`);
      }

    } catch (err: any) {
      console.error('Error fetching dropship products:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load products';
      setError(errorMessage);

      if (!pageUrl) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load dropship products',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [pagination.currentPage]);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

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
    fetchProducts(undefined, true);
  }, [fetchProducts]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    console.log('handleLoadMore called', {
      hasNext: !!pagination.next,
      loadingMore,
      loading,
      refreshing,
      currentProducts: products.length,
      totalCount: pagination.count
    });

    if (pagination.next && !loadingMore && !loading && !refreshing) {
      console.log('Loading more products...');
      fetchProducts(pagination.next);
    }
  }, [pagination.next, loadingMore, loading, refreshing, fetchProducts, products.length, pagination.count]);

  // Filter products based on search
  const filteredData = useMemo(() => {
    if (!search.trim()) return products;

    const searchLower = search.toLowerCase();
    return products.filter(
      (p) =>
        p.product.name.toLowerCase().includes(searchLower) ||
        p.supplier_name.toLowerCase().includes(searchLower) ||
        p.product.sku?.toLowerCase().includes(searchLower) ||
        p.product.category?.name?.toLowerCase().includes(searchLower)
    );
  }, [products, search]);

  // Get unique key for FlatList
  const getUniqueKey = useCallback((item: DropshipProduct) =>
    item.uniqueKey || `product-${item.product.id}`,
    []);

  // Render footer for loading more
  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View className="py-8 items-center bg-white">
          <ActivityIndicator size="large" color="#C62828" />
          <Text className="mt-3 text-sm text-gray-600 font-medium">
            {t('loading_more_products') || 'Loading more products...'}
          </Text>
        </View>
      );
    }

    if (pagination.next && products.length > 0) {
      return (
        <TouchableOpacity
          onPress={handleLoadMore}
          className="py-6 items-center bg-white border-t border-gray-200"
        >
          <Text className="text-sm text-red-600 font-bold">
            Load More ({products.length} of {pagination.count})
          </Text>
        </TouchableOpacity>
      );
    }

    if (products.length > 0 && !pagination.next) {
      return (
        <View className="py-8 items-center bg-white border-t border-gray-200">
          <Ionicons name="checkmark-circle" size={32} color="#10b981" />
          <Text className="text-sm text-gray-600 font-medium mt-2">
            {t('showing_all_products') || 'All products loaded'}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            ({products.length} of {pagination.count})
          </Text>
        </View>
      );
    }

    return null;
  }, [loadingMore, pagination.next, pagination.count, products.length, t, handleLoadMore]);

  // Render empty state
  const renderEmpty = useCallback(() => (
    <View className="py-24 items-center justify-center">
      <View className="bg-gray-100 p-6 rounded-full mb-4">
        <Ionicons
          name={search ? "search-outline" : "cube-outline"}
          size={48}
          color="#9ca3af"
        />
      </View>
      <Text className="text-gray-600 font-semibold text-lg mb-2">
        {search
          ? (t('no_products_found') || 'No products found')
          : (t('no_products_available') || 'No products available')}
      </Text>
      <Text className="text-gray-500 text-sm mb-4">
        {search
          ? 'Try adjusting your search criteria'
          : 'Products will appear here once added'}
      </Text>
      {search && (
        <TouchableOpacity
          onPress={() => setSearch('')}
          className="mt-2 px-6 py-3 bg-red-600 rounded-full shadow-lg"
        >
          <Text className="text-white font-bold">Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [search, t]);

  if (loading && products.length === 0) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#C62828" />
        <Text className="mt-4 text-gray-600 text-base font-medium">
          {t('loading_products') || 'Loading products...'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-5 pb-3 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-3xl font-black text-gray-900 tracking-tight">
              {t('dropshipping_products') || 'Dropshipping Products'}
            </Text>
            <Text className="text-sm text-gray-600 mt-2 font-medium">
              {t('manage_dropshipping_catalog') || 'Manage your dropshipping product catalog'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRefresh}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 active:from-gray-200 active:to-gray-300 ml-3 shadow-sm"
            disabled={refreshing}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color={refreshing ? "#9ca3af" : "#374151"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-3.5 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 active:from-red-100 active:to-red-200 ml-2 shadow-sm"
            onPress={() => router.push("/Products/addDropproject")}
          >
            <Ionicons name="add" size={24} color="#C62828" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <StatsCards products={products} totalCount={pagination.count} />

        {/* Search */}
        <View className="flex-row items-center bg-gray-100 rounded-2xl border-2 border-gray-200 px-4 py-1 mb-4 shadow-sm">
          <Ionicons name="search-outline" size={22} color="#6b7280" />
          <TextInput
            placeholder={t('search_products') || 'Search by name, supplier, or SKU...'}
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-3 text-base text-gray-900 font-medium"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} className="p-1">
              <Ionicons name="close-circle" size={22} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View className="mx-5 mt-3 p-4 bg-red-50 rounded-2xl border border-red-200">
          <Text className="text-red-600 text-center text-sm">{error}</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="mt-2 items-center"
          >
            <Text className="text-red-500 text-sm underline">{t('try_again') || 'Try Again'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TABLE */}
      <View className="flex-1 bg-white mt-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
        >
          <View>
            {filteredData.length === 0 && !loading ? (
              renderEmpty()
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={getUniqueKey}
                renderItem={({ item }) => <ProductRow item={item} />}
                showsVerticalScrollIndicator={true}
                stickyHeaderIndices={[0]}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#C62828']}
                    tintColor="#C62828"
                  />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={renderFooter}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={21}
                ListHeaderComponent={() => (
                  <View className="flex-row bg-gray-100 border-b-2 border-gray-300 py-4 shadow-sm">
                    <Text className="w-64 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('product') || 'Product'}
                    </Text>
                    <Text className="w-40 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('supplier') || 'Supplier'}
                    </Text>
                    <Text className="w-40 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('category') || 'Category'}
                    </Text>
                    <Text className="w-28 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('stock') || 'Stock'}
                    </Text>
                    <Text className="w-44 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('price') || 'Price'}
                    </Text>
                    <Text className="w-32 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('shipping') || 'Shipping'}
                    </Text>
                    <Text className="w-32 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('status') || 'Status'}
                    </Text>
                    <Text className="w-32 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('created') || 'Created'}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}