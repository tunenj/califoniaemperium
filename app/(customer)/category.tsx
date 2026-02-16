// app/(customer)/category/index.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  FlatList,
  RefreshControl,
  Alert,
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import ProductCard from "@/components/category/ProductCard";
import SidebarMenu from "@/components/category/SidebarMenu";
import DashboardHeader from "@/components/category/dashboard";
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { CategorySearchProvider, useCategorySearch } from "@/context/CategorySearchContext";

// Update the Category interface to match SidebarMenu's interface
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
  // Add the missing fields from the API response
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
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

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 110;
const CONTENT_PADDING = 12;
const GAP = 10;
const ITEM_WIDTH = (width - SIDEBAR_WIDTH - CONTENT_PADDING * 2 - GAP) / 2;

// Create the main component content
const CategoryScreenContent = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { searchQuery, clearSearch } = useCategorySearch();
  
  // Cart and Wishlist contexts
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
  } = useWishlist();

  const { isAuthenticated } = useAuth();
  
  // Ref to track if initial fetch has happened
  const initialFetchDone = React.useRef(false);
  
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

  // State to track which products are being added to cart
  const [addingToCart, setAddingToCart] = useState<{[key: string]: boolean}>({});
  
  // State to track which products are being toggled in wishlist
  const [togglingWishlist, setTogglingWishlist] = useState<{[key: string]: boolean}>({});

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get(endpoints.categories);
      if (response.data.success) {
        // The API returns the full category data with all fields
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(t('failed_to_load_categories') || 'Failed to load categories');
    }
  }, [t]);

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
      
      // Add search query if exists
      if (searchQuery && searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      
      // Add sorting
      url += getSortQuery(sortBy);

      const response = await api.get(url);

      if (response.data) {
        const newProducts = response.data.results || [];
        
        console.log('📦 Fetched products - Page:', page, 'Count:', newProducts.length, 'Has more:', response.data.next !== null);
        
        if (page === 1 || isRefresh) {
          setProducts(newProducts);
          setFilteredProducts(newProducts);
          console.log('🔄 Reset products to:', newProducts.length);
        } else {
          // Deduplicate products by ID before adding
          setProducts(prev => {
            const existingIds = new Set(prev.map((p: Product) => p.id));
            const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p.id));
            const updated = [...prev, ...uniqueNewProducts];
            console.log('➕ Added products. New unique:', uniqueNewProducts.length, 'Total now:', updated.length);
            return updated;
          });
          setFilteredProducts(prev => {
            const existingIds = new Set(prev.map((p: Product) => p.id));
            const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p.id));
            return [...prev, ...uniqueNewProducts];
          });
        }

        setHasMore(response.data.next !== null);
        setCurrentPage(page);
        setTotalProducts(response.data.count || 0);
        console.log('📊 Total products in DB:', response.data.count, 'Has more pages:', response.data.next !== null);
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
  }, [selectedCategory, searchQuery, sortBy, t, getSortQuery]);

  // Initial load - only once
  useEffect(() => {
    if (!initialFetchDone.current) {
      console.log('🚀 Initial mount - fetching categories and products');
      initialFetchDone.current = true;
      fetchCategories();
      fetchProducts(1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when search query changes (but not on initial mount)
  useEffect(() => {
    // Only fetch if searchQuery has been set by user interaction
    if (initialFetchDone.current && searchQuery !== undefined && searchQuery !== '') {
      console.log('🔍 Search query changed to:', searchQuery);
      setCurrentPage(1);
      fetchProducts(1, true);
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle category selection
  const handleCategorySelect = useCallback((category: Category | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    
    // Clear search when selecting a category
    if (category) {
      clearSearch();
    }
    
    // Fetch products for the selected category
    fetchProducts(1, true);
  }, [clearSearch, fetchProducts]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    clearSearch();
    setCurrentPage(1);
  }, [clearSearch]);

  // Clear category filter
  const handleClearCategory = useCallback(() => {
    setSelectedCategory(null);
    setCurrentPage(1);
    fetchProducts(1, true);
  }, [fetchProducts]);

  // Load more products
  const loadMoreProducts = () => {
    console.log('🔽 onEndReached triggered - hasMore:', hasMore, 'productsLoading:', productsLoading, 'loading:', loading);
    if (hasMore && !productsLoading && !loading) {
      console.log('✅ Loading more products - next page:', currentPage + 1);
      fetchProducts(currentPage + 1);
    } else {
      console.log('❌ Not loading more:', { hasMore, productsLoading, loading });
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

  /* ---------- Cart Functionality ---------- */
  const handleAddToCart = useCallback(async (product: Product, event?: any) => {
    if (event) {
      event.stopPropagation();
    }

    if (!product?.id) return;

    // Check if product is in stock
    if (!product.is_in_stock) {
      Alert.alert(
        "Out of Stock",
        "This product is currently out of stock",
        [{ text: "OK" }]
      );
      return;
    }

    // Check if already in cart
    if (isInCart(product.id)) {
      Alert.alert(
        "Already in Cart",
        `${product.name} is already in your cart`,
        [{ text: "OK" }]
      );
      return;
    }

    // Set loading state for this specific product
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));

    try {
      // Fetch full product details to get the detailed images
      console.log('🔍 Fetching full product details for:', product.slug);
      const productResponse = await api.get(`${endpoints.products}${product.slug}/`);
      
      let productImage = product.main_image || null;
      
      // If we got detailed product data with images array
      if (productResponse.data && productResponse.data.images && productResponse.data.images.length > 0) {
        console.log('📸 Product images from API:', productResponse.data.images);
        
        // Find the primary image or use the first one
        const primaryImage = productResponse.data.images.find((img: any) => img.is_primary);
        const imageToUse = primaryImage || productResponse.data.images[0];
        
        if (imageToUse && imageToUse.image) {
          productImage = imageToUse.image;
          console.log('✅ Using detailed image URL:', productImage);
        }
      } else {
        console.log('⚠️ No detailed images found, using main_image:', productImage);
      }

      // Prepare item data for the cart
      const itemData = {
        productId: product.id,
        storeName: product.brand_name || 'Unknown Store',
        productName: product.name,
        price: parseFloat(product.price),
        originalPrice: product.compare_at_price 
          ? parseFloat(product.compare_at_price)
          : parseFloat(product.price),
        image: productImage,
      };

      console.log('🛒 Adding product to cart with image:', itemData);

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
  }, [addItem, isInCart]);

  /* ---------- Wishlist Functionality ---------- */
  const handleWishlistToggle = useCallback(async (product: Product, event?: any) => {
    if (event) {
      event.stopPropagation();
    }

    if (!product?.id) return;

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

  // Handle sort change
  const handleSortChange = useCallback((sortOption: string) => {
    setSortBy(sortOption);
    setShowSortOptions(false);
    setCurrentPage(1);
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
  const renderProductItem = useCallback(({ item, index }: { item: Product; index: number }) => (
    <View style={{ 
      width: ITEM_WIDTH, 
      marginRight: index % 2 === 0 ? GAP : 0,
      marginBottom: GAP 
    }}>
      <ProductCard
        product={item}
        viewMode="grid"
        onPress={() => handleProductPress(item)}
        // Pass cart and wishlist functionality
        onAddToCart={(e) => handleAddToCart(item, e)}
        onToggleWishlist={(e) => handleWishlistToggle(item, e)}
        isInCart={isInCart(item.id)}
        isInWishlist={isInWishlist(item.id)}
        isAddingToCart={isAddingToCart(item.id)}
        isTogglingWishlist={isTogglingWishlist(item.id)}
        cartSyncing={cartSyncing}
      />
    </View>
  ), [handleProductPress, handleAddToCart, handleWishlistToggle, isInCart, isInWishlist, isAddingToCart, isTogglingWishlist, cartSyncing]);

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

  // Retry function
  const handleRetry = useCallback(() => {
    if (searchQuery) {
      handleClearSearch();
    } else {
      onRefresh();
    }
  }, [searchQuery, handleClearSearch, onRefresh]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (loading) return null;
    
    let titleText = t('no_products_found') || 'No products found';
    let descriptionText = t('no_products_available') || 'No products available at the moment';
    
    if (searchQuery && searchQuery.trim()) {
      titleText = `No results for "${searchQuery}"`;
      descriptionText = t('try_adjusting_search') || 'Try adjusting your search or browse different categories';
    } else if (selectedCategory) {
      descriptionText = t('no_products_in_category') || `No products found in ${selectedCategory?.name || 'this category'}`;
    }
    
    if (error) {
      descriptionText = error;
    }
    
    return (
      <View className="py-20 items-center px-4">
        <Text className="text-gray-600 text-lg font-medium mb-2">
          {titleText}
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          {descriptionText}
        </Text>
        <TouchableOpacity 
          className="bg-red-600 px-6 py-3 rounded-lg" 
          onPress={handleRetry}
        >
          <Text className="text-white font-medium">
            {searchQuery ? (t('browse_products') || 'Browse Products') : (t('refresh') || 'Refresh')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [loading, selectedCategory, searchQuery, error, t, handleRetry]);

  // Memoized values
  const parentCategories = useMemo(() => getParentCategoriesWithChildren(), [getParentCategoriesWithChildren]);
  const displayedProducts = useMemo(() => filteredProducts, [filteredProducts]);
  const productCount = useMemo(() => 
    filteredProducts.length > 0 ? filteredProducts.length : totalProducts, 
    [filteredProducts.length, totalProducts]
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
            {searchQuery ? `Searching for "${searchQuery}"...` : t('loading_products') || 'Loading products...'}
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
                {searchQuery && (
                  <Text className="text-xs text-gray-500 mt-1">
                    {t('search_results_for') || 'Search results for'}: &quot;{searchQuery}&quot;
                  </Text>
                )}
                {selectedCategory && selectedCategory.description && !searchQuery && (
                  <Text className="text-xs text-gray-500 mt-1">
                    {selectedCategory.description}
                  </Text>
                )}
              </View>
              
              {/* Clear filter/search buttons */}
              <View className="flex-row items-center">
                {searchQuery && (
                  <TouchableOpacity
                    className="ml-2 flex-row items-center bg-gray-100 px-2 py-1 rounded"
                    onPress={handleClearSearch}
                  >
                    <MaterialIcons name="close" size={14} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1">
                      {t('clear_search') || 'Clear Search'}
                    </Text>
                  </TouchableOpacity>
                )}
                {selectedCategory && (
                  <TouchableOpacity
                    className="ml-2 flex-row items-center"
                    onPress={handleClearCategory}
                  >
                    <MaterialIcons name="close" size={16} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1">
                      {t('clear') || 'Clear'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
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
                  <FontAwesome name="filter" size={14} color="#666" />
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
            keyExtractor={(item) => `${item.id}-${item.slug}-${item.sku}`}
            numColumns={2}
            contentContainerStyle={{
              padding: CONTENT_PADDING,
              paddingBottom: 80,
              flexGrow: displayedProducts.length === 0 ? 1 : 0,
            }}
            columnWrapperStyle={{
              justifyContent: 'space-between',
              marginBottom: GAP,
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

// Wrap with provider at the export level
const CategoryScreen = () => {
  return (
    <CategorySearchProvider>
      <CategoryScreenContent />
    </CategorySearchProvider>
  );
};

export default CategoryScreen;