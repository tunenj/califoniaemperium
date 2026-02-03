// app/(customer)/category/index.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  FlatList,
  RefreshControl,
  Alert 
} from "react-native";
import { useRouter } from "expo-router";
import ProductCard from "@/components/category/ProductCard";
import SidebarMenu from "@/components/category/SidebarMenu";
import DashboardHeader from "@/components/explore/dashboard";
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { Filter, X } from "lucide-react-native";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  icon: string;
  parent: string | null;
  children: Category[];
  full_path: string;
  order: number;
  is_active: boolean;
  product_count: number;
}

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

const CategoryScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get(endpoints.categories);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(t('failed_to_load_categories') || 'Failed to load categories');
    }
  }, [t]);

  // Filter products by category
  const filterProductsByCategory = useCallback((category: Category, productList?: Product[]) => {
    const productsToFilter = productList || products;
    const categoryNames = [category.name];

    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        categoryNames.push(child.name);
      });
    }

    const filtered = productsToFilter.filter(product =>
      categoryNames.includes(product.category_name)
    );

    setFilteredProducts(filtered);
  }, [products]);

  // Get sort query parameter
  const getSortQuery = useCallback((sortOption: string) => {
    switch (sortOption) {
      case 'popular':
        return '&sort=-rating_average';
      case 'newest':
        return '&sort=-created_at';
      case 'price_low':
        return '&sort=price';
      case 'price_high':
        return '&sort=-price';
      case 'name_az':
        return '&sort=name';
      default:
        return '&sort=-rating_average';
    }
  }, []);

  // Fetch products with pagination
  const fetchProducts = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setProductsLoading(true);
      }

      let url = `${endpoints.products}?page=${page}`;
      
      // Add category filter if selected
      if (selectedCategory) {
        url += `&category=${selectedCategory.slug}`;
      }
      
      // Add sorting
      url += getSortQuery(sortBy);

      const response = await api.get(url);

      if (response.data) {
        if (page === 1 || isRefresh) {
          setProducts(response.data.results || []);
        } else {
          setProducts(prev => [...prev, ...(response.data.results || [])]);
        }

        setHasMore(response.data.next !== null);
        setCurrentPage(page);
        setTotalProducts(response.data.count || 0);
        
        // If category is selected, update filtered products
        if (selectedCategory) {
          filterProductsByCategory(selectedCategory, response.data.results || []);
        } else {
          setFilteredProducts(response.data.results || []);
        }
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message || t('failed_to_load_products') || 'Failed to load products');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
      setProductsLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, sortBy, t, getSortQuery, filterProductsByCategory]);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchProducts(1);
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category: Category | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    
    if (category) {
      // Filter existing products
      filterProductsByCategory(category);
    } else {
      // Show all products
      setFilteredProducts(products);
    }
  }, [filterProductsByCategory, products]);

  // Load more products
  const loadMoreProducts = () => {
    if (hasMore && !productsLoading && !loading) {
      fetchProducts(currentPage + 1);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(1, true);
  }, [fetchProducts]);

  // Handle product press - navigate to product detail
  const handleProductPress = useCallback((product: Product) => {
    if (!product?.slug) {
      Alert.alert(t('error') || 'Error', t('product_not_found') || 'Product not found');
      return;
    }
    
    router.push({
      pathname: "/(customer)/product/[slug]",
      params: { 
        slug: product.slug,
        productName: product.name || 'Product'
      },
    });
  }, [router, t]);

  // Handle sort change
  const handleSortChange = useCallback((sortOption: string) => {
    setSortBy(sortOption);
    setShowSortOptions(false);
    setCurrentPage(1);
    // Refetch products with new sort
    fetchProducts(1, true);
  }, [fetchProducts]);

  // Get sort display text
  const getSortDisplayText = useCallback(() => {
    switch (sortBy) {
      case 'popular':
        return t('popular') || 'Popular';
      case 'newest':
        return t('newest') || 'Newest';
      case 'price_low':
        return t('price_low_to_high') || 'Price: Low to High';
      case 'price_high':
        return t('price_high_to_low') || 'Price: High to Low';
      case 'name_az':
        return t('name_a_z') || 'Name: A-Z';
      default:
        return t('popular') || 'Popular';
    }
  }, [sortBy, t]);

  // Get parent categories with children
  const getParentCategoriesWithChildren = useCallback(() => {
    return categories.filter(cat => cat.parent === null);
  }, [categories]);

  // Render product item
  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      viewMode="grid"
      onPress={() => handleProductPress(item)}
    />
  ), [handleProductPress]);

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!productsLoading) return null;
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#DC2626" />
        <Text className="text-gray-500 text-sm mt-2">
          {t('loading_more_products') || 'Loading more products...'}
        </Text>
      </View>
    );
  }, [productsLoading, t]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (loading) return null;
    
    return (
      <View className="py-20 items-center px-4">
        <Text className="text-gray-600 text-lg font-medium mb-2">
          {t('no_products_found') || 'No products found'}
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          {selectedCategory 
            ? t('no_products_in_category') || `No products found in ${selectedCategory?.name}`
            : t('no_products_available') || 'No products available at the moment'}
        </Text>
        <TouchableOpacity
          className="bg-red-600 px-6 py-3 rounded-lg"
          onPress={() => onRefresh()}
        >
          <Text className="text-white font-medium">
            {t('refresh') || 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [loading, selectedCategory, onRefresh, t]);

  // Memoized values
  const parentCategories = useMemo(() => getParentCategoriesWithChildren(), [getParentCategoriesWithChildren]);
  const displayedProducts = useMemo(() => 
    selectedCategory ? filteredProducts : products, 
    [selectedCategory, filteredProducts, products]
  );
  const productCount = useMemo(() => 
    selectedCategory ? filteredProducts.length : totalProducts, 
    [selectedCategory, filteredProducts.length, totalProducts]
  );
  const sortDisplayText = useMemo(() => getSortDisplayText(), [getSortDisplayText]);

  // Loading state
  if (loading && products.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <DashboardHeader />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#DC2626" />
          <Text className="mt-4 text-gray-600">
            {t('loading_products') || 'Loading products...'}
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <DashboardHeader />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-600 text-lg font-semibold mb-2">
            {t('error_loading_products') || 'Error Loading Products'}
          </Text>
          <Text className="text-gray-600 text-center mb-6">{error}</Text>
          <TouchableOpacity
            className="bg-red-600 px-6 py-3 rounded-lg"
            onPress={() => {
              setError(null);
              fetchProducts(1);
            }}
          >
            <Text className="text-white font-medium">
              {t('try_again') || 'Try Again'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <DashboardHeader />
      
      <View className="flex-row flex-1">
        {/* LEFT SIDEBAR */}
        <SidebarMenu
          categories={parentCategories}
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
        />

        {/* RIGHT CONTENT */}
        <View className="flex-1">
          {/* Header */}
          <View className="bg-white px-4 py-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">
                  {selectedCategory ? selectedCategory.name : t('all_products') || 'All Products'}
                </Text>
                {selectedCategory && selectedCategory.description && (
                  <Text className="text-xs text-gray-500 mt-1">
                    {selectedCategory.description}
                  </Text>
                )}
              </View>
              
              {/* Clear filter button */}
              {selectedCategory && (
                <TouchableOpacity
                  className="ml-2 flex-row items-center"
                  onPress={() => handleCategorySelect(null)}
                >
                  <X size={16} color="#666" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {t('clear') || 'Clear'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Product count and sort */}
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">
                {productCount} {t('products') || 'products'}
              </Text>

              <View className="relative">
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={() => setShowSortOptions(!showSortOptions)}
                  activeOpacity={0.7}
                >
                  <Filter size={14} color="#666" />
                  <Text className="text-xs text-gray-600 ml-1 mr-1">
                    {t('sort_by') || 'Sort by'}:
                  </Text>
                  <Text className="text-xs text-red-600 font-medium">
                    {sortDisplayText} ▾
                  </Text>
                </TouchableOpacity>
                
                {/* Sort options dropdown */}
                {showSortOptions && (
                  <View className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-48">
                    <TouchableOpacity
                      className="px-4 py-3 border-b border-gray-100"
                      onPress={() => handleSortChange('popular')}
                    >
                      <Text className={sortBy === 'popular' ? 'text-darkRed font-medium' : 'text-gray-700'}>
                        {t('popular') || 'Popular'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="px-4 py-3 border-b border-gray-100"
                      onPress={() => handleSortChange('newest')}
                    >
                      <Text className={sortBy === 'newest' ? 'text-darkRed font-medium' : 'text-gray-700'}>
                        {t('newest') || 'Newest'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="px-4 py-3 border-b border-gray-100"
                      onPress={() => handleSortChange('price_low')}
                    >
                      <Text className={sortBy === 'price_low' ? 'text-darkRed font-medium' : 'text-gray-700'}>
                        {t('price_low_to_high') || 'Price: Low to High'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="px-4 py-3 border-b border-gray-100"
                      onPress={() => handleSortChange('price_high')}
                    >
                      <Text className={sortBy === 'price_high' ? 'text-darkRed font-medium' : 'text-gray-700'}>
                        {t('price_high_to_low') || 'Price: High to Low'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="px-4 py-3"
                      onPress={() => handleSortChange('name_az')}
                    >
                      <Text className={sortBy === 'name_az' ? 'text-darkRed font-medium' : 'text-gray-700'}>
                        {t('name_a_z') || 'Name: A-Z'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Product Grid */}
          <FlatList
            data={displayedProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => `${item.id}-${item.slug}`}
            numColumns={2}
            contentContainerStyle={{
              padding: 12,
              paddingBottom: 80,
              flexGrow: displayedProducts.length === 0 ? 1 : 0,
            }}
            columnWrapperStyle={{ 
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 10 
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#DC2626']}
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
          />
        </View>
      </View>
    </View>
  );
};

export default CategoryScreen;