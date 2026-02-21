import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 40) / 2;

// Define types based on the API response
type ProductImage = {
    id: string;
    image: string;
    alt_text: string;
    is_primary: boolean;
    order: number;
    created_at: string;
};

type Category = {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string | null;
    icon: string;
    parent: string | null;
    children: any[];
    full_path: string;
    order: number;
    is_active: boolean;
    product_count: number;
    meta_title: string;
    meta_description: string;
    created_at: string;
    updated_at: string;
};

type VendorInfo = {
    vendor_name: string;
    vendor_id: string;
    is_approved: boolean;
};

type Product = {
    id: string;
    product_type: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    short_description: string;
    category: Category;
    brand: any | null;
    tags: any[];
    main_image: string | null;
    price: string;
    compare_at_price: string | null;
    discount_percentage: number;
    stock_quantity: number;
    is_in_stock: boolean;
    is_low_stock: boolean;
    track_inventory: boolean;
    weight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    condition: string;
    is_active: boolean;
    is_featured: boolean;
    requires_shipping: boolean;
    is_digital: boolean;
    images: ProductImage[];
    variants: any[];
    attributes: any[];
    view_count: number;
    purchase_count: number;
    rating_average: string;
    rating_count: number;
    vendor_info: VendorInfo;
    dropship_info: any | null;
    meta_title: string;
    meta_description: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
};

type VendorProduct = {
    product: Product;
    vendor: string;
    vendor_name: string;
    vendor_sku: string;
    commission_rate: string;
    is_approved: boolean;
    approved_at: string | null;
    rejection_reason: string;
    created_at: string;
    updated_at: string;
};

type ApiResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: VendorProduct[];
};

// Helper function to format price in euros
const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return `€${numPrice.toFixed(2)}`;
};

const ProductsScreen: React.FC = () => {
    const { t } = useLanguage();
    const { isAuthenticated, logout } = useAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Filter states
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Modal states
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    // Categories
    const [categories, setCategories] = useState<Category[]>([]);

    // FIXED: Navigation helper with correct path including the (vendor) group
    const navigateToProductDetails = (slug: string) => {
        console.log('🚀 Navigating to product:', slug);
        router.push(`/(vendor)/${slug}` as any);
    };

    const mapApiItemToProduct = (vendorProduct: VendorProduct): Product => {
        const product = vendorProduct.product;
        return product;
    };

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const response = await api.get(endpoints.categories, {
                headers: {
                    Authorization: `Bearer ${token || ''}`,
                },
            });

            if (response.data?.success === true && response.data.data) {
                setCategories(response.data.data);
            } else if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else if (response.data?.results) {
                setCategories(response.data.results);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    const fetchProducts = useCallback(async (opts: { refresh?: boolean; url?: string; page?: number } = {}) => {
        if (opts.refresh) {
            setIsRefreshing(true);
            setCurrentPage(1);
        } else if (opts.url || opts.page) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            const token = await AsyncStorage.getItem('accessToken');

            // Determine fetch URL - use vendor products endpoint
            let fetchUrl = opts.url || endpoints.getVendorProducts;

            // If page number is provided and we don't have a URL, construct it
            if (opts.page && !opts.url) {
                const separator = fetchUrl.includes('?') ? '&' : '?';
                fetchUrl = `${fetchUrl}${separator}page=${opts.page}`;
            }

            console.log('📦 FETCHING VENDOR PRODUCTS');
            console.log('URL:', fetchUrl);

            const res = await api.get<ApiResponse>(fetchUrl, {
                headers: {
                    Authorization: `Bearer ${token || ''}`,
                },
            });

            console.log('✅ API RESPONSE RECEIVED');
            console.log('Count:', res.data.count);
            console.log('Results count:', res.data.results?.length || 0);

            const vendorProducts = res.data.results || [];
            const mapped = vendorProducts.map(mapApiItemToProduct);

            if (opts.refresh) {
                setProducts(mapped);
                setNextUrl(res.data.next);
                setTotalCount(res.data.count);
                console.log('>>> SET products (REFRESH):', mapped.length, 'items');
            } else if (opts.url || opts.page) {
                // Append to existing products
                setProducts(prev => {
                    const combined = [...prev, ...mapped];
                    console.log('>>> APPENDED products:', prev.length, '+', mapped.length, '=', combined.length);
                    return combined;
                });
                setNextUrl(res.data.next);
                setCurrentPage(prev => prev + 1);
            } else {
                setProducts(mapped);
                setNextUrl(res.data.next);
                setTotalCount(res.data.count);
                console.log('>>> SET products (INITIAL):', mapped.length, 'items');
            }

        } catch (error: any) {
            console.error('==========================================');
            console.error('ERROR LOADING PRODUCTS');
            console.error('Error:', error);
            console.error('Status:', error.response?.status);
            console.error('Message:', error.response?.data?.message || error.message);
            console.error('==========================================');

            if (error.response?.status === 401) {
                await logout();
                router.replace('/signIn');
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsLoadingMore(false);
        }
    }, [logout]);

    // Filter products based on search, category, and status
    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query) ||
                product.id.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.category?.slug === selectedCategory ||
                product.category?.id === selectedCategory ||
                product.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase())
            );
        }

        // Status filter
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(product => {
                const productStatus = product.is_active ? 'active' : 'inactive';
                return productStatus === selectedStatus.toLowerCase();
            });
        }

        setFilteredProducts(filtered);
    }, [products, searchQuery, selectedCategory, selectedStatus]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProducts();
            fetchCategories();
        }
    }, [isAuthenticated, fetchProducts, fetchCategories]);

    const handleLoadMore = useCallback(() => {
        if (nextUrl && !isLoadingMore && !isLoading && !isRefreshing) {
            console.log('>>> Fetching next page from URL:', nextUrl);
            fetchProducts({ url: nextUrl });
        } else if (!nextUrl && totalCount > products.length) {
            console.log('>>> No nextUrl, trying page number:', currentPage + 1);
            fetchProducts({ page: currentPage + 1 });
        }
    }, [nextUrl, isLoadingMore, isLoading, isRefreshing, totalCount, products.length, currentPage, fetchProducts]);

    const handleManualLoadMore = useCallback(() => {
        if (totalCount > products.length) {
            if (nextUrl) {
                fetchProducts({ url: nextUrl });
            } else {
                fetchProducts({ page: currentPage + 1 });
            }
        }
    }, [totalCount, products.length, nextUrl, currentPage, fetchProducts]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedStatus('all');
    };

    const renderProduct = ({ item }: { item: Product }) => {
        const productStatus = item.is_active ? 'active' : 'inactive';
        const primaryImage = item.images?.find(img => img.is_primary);
        const displayImage = primaryImage?.image || item.main_image || item.images?.[0]?.image;

        return (
            <TouchableOpacity
                onPress={() => navigateToProductDetails(item.slug)}
                style={{ width: ITEM_WIDTH }}
                className="bg-white rounded-xl p-3 mb-4 border border-gray-200"
                activeOpacity={0.85}
            >
                {displayImage ? (
                    <Image
                        source={{ uri: displayImage }}
                        className="w-full h-32 rounded-lg mb-3"
                        resizeMode="contain"
                    />
                ) : (
                    <View className="w-full h-32 rounded-lg mb-3 bg-gray-100 items-center justify-center">
                        <Text className="text-xs text-gray-400">No image</Text>
                    </View>
                )}

                <View className="flex-row justify-between items-center mb-1">
                    <Text
                        className="text-xs text-gray-600 flex-1 pr-2"
                        numberOfLines={2}
                    >
                        {item.name}
                    </Text>

                    <View className={`px-2 py-0.5 rounded-full ${
                        productStatus === 'active' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                        <Text className={`text-[10px] font-semibold ${
                            productStatus === 'active' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {productStatus}
                        </Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-center mt-1">
                    {/* CHANGED: Currency from $ to € */}
                    <Text className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price)}
                    </Text>
                    <Text className="text-xs text-gray-500">
                        {item.stock_quantity} {t('in_stock')}
                    </Text>
                </View>

                {item.discount_percentage > 0 && (
                    <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-full">
                        <Text className="text-white text-[10px] font-bold">
                            -{item.discount_percentage}%
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (isLoadingMore) {
            return (
                <View className="py-4 items-center">
                    <ActivityIndicator size="small" color="#C62828" />
                    <Text className="text-xs text-gray-500 mt-2">
                        {t('loading_more') || 'Loading more...'}
                    </Text>
                </View>
            );
        }

        if (totalCount > products.length && !isLoading) {
            return (
                <View className="py-4 items-center">
                    <TouchableOpacity
                        onPress={handleManualLoadMore}
                        className="bg-red-500 px-6 py-3 rounded-lg"
                        disabled={isLoadingMore}
                    >
                        <Text className="text-white font-semibold text-sm">
                            {t('load_more') || 'Load More'} ({totalCount - products.length} {t('remaining') || 'remaining'})
                        </Text>
                    </TouchableOpacity>
                    <Text className="text-xs text-gray-500 mt-2">
                        {t('showing') || 'Showing'} {products.length} / {totalCount}
                    </Text>
                </View>
            );
        }

        return null;
    };

    const renderCategoryModal = () => (
        <Modal
            visible={showCategoryModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCategoryModal(false)}
        >
            <TouchableOpacity 
                className="flex-1 bg-black/50 justify-end"
                activeOpacity={1}
                onPress={() => setShowCategoryModal(false)}
            >
                <View className="bg-white rounded-t-3xl max-h-96">
                    <View className="p-4 border-b border-gray-200">
                        <Text className="text-lg font-bold text-gray-900">
                            {t('select_category') || 'Select Category'}
                        </Text>
                    </View>

                    <FlatList
                        data={[
                            { id: 'all', name: t('all_categories') || 'All Categories', slug: 'all' },
                            ...categories
                        ]}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className={`px-4 py-3 border-b border-gray-100 ${
                                    selectedCategory === item.slug ? 'bg-red-50' : ''
                                }`}
                                onPress={() => {
                                    setSelectedCategory(item.slug);
                                    setShowCategoryModal(false);
                                }}
                            >
                                <Text className={`${
                                    selectedCategory === item.slug ? 'text-red-600 font-semibold' : 'text-gray-700'
                                }`}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity
                        className="p-4 bg-gray-100"
                        onPress={() => setShowCategoryModal(false)}
                    >
                        <Text className="text-center text-gray-700 font-semibold">
                            {t('cancel') || 'Cancel'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderStatusModal = () => {
        const statuses = [
            { id: 'all', name: t('all_status') || 'All Status' },
            { id: 'active', name: t('active') || 'Active' },
            { id: 'inactive', name: t('inactive') || 'Inactive' },
        ];

        return (
            <Modal
                visible={showStatusModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowStatusModal(false)}
            >
                <TouchableOpacity 
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setShowStatusModal(false)}
                >
                    <View className="bg-white rounded-t-3xl">
                        <View className="p-4 border-b border-gray-200">
                            <Text className="text-lg font-bold text-gray-900">
                                {t('select_status') || 'Select Status'}
                            </Text>
                        </View>

                        <FlatList
                            data={statuses}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`px-4 py-3 border-b border-gray-100 ${
                                        selectedStatus === item.id ? 'bg-red-50' : ''
                                    }`}
                                    onPress={() => {
                                        setSelectedStatus(item.id);
                                        setShowStatusModal(false);
                                    }}
                                >
                                    <Text className={`${
                                        selectedStatus === item.id ? 'text-red-600 font-semibold' : 'text-gray-700'
                                    }`}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity
                            className="p-4 bg-gray-100"
                            onPress={() => setShowStatusModal(false)}
                        >
                            <Text className="text-center text-gray-700 font-semibold">
                                {t('cancel') || 'Cancel'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 pt-4 pb-3">
                <View className="flex-row justify-between items-center mb-3">
                    <View>
                        <Text className="text-lg font-bold text-gray-900">
                            {t('products')}
                        </Text>
                        <Text className="text-xs text-gray-500">
                            {filteredProducts.length} / {totalCount} {t('products_in_your_store')}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push("/Products/addProductScreen")}
                        className="bg-white border border-red-500 px-4 py-2 rounded-full"
                    >
                        <Text className="text-red-500 text-xs font-semibold">
                            + {t('add_product')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-white rounded-xl px-4 py-2 border border-gray-200 mb-3 flex-row items-center">
                    <TextInput
                        placeholder={t('search_products') || 'Search products...'}
                        placeholderTextColor="#9CA3AF"
                        className="text-sm text-gray-800 flex-1"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text className="text-gray-400 ml-2">✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View className="flex-row gap-3 mb-2">
                    <TouchableOpacity
                        className="flex-row items-center justify-between flex-1 bg-white px-4 py-3 rounded-xl border border-gray-200"
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <Text className="text-xs text-gray-700" numberOfLines={1}>
                            {selectedCategory === 'all'
                                ? (t('all_categories') || 'All Categories')
                                : categories.find(c => c.slug === selectedCategory)?.name || (t('all_categories') || 'All Categories')
                            }
                        </Text>
                        <Text className="text-xs text-gray-400">⌄</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-between flex-1 bg-white px-4 py-3 rounded-xl border border-gray-200"
                        onPress={() => setShowStatusModal(true)}
                    >
                        <Text className="text-xs text-gray-700">
                            {selectedStatus === 'all'
                                ? (t('all_status') || 'All Status')
                                : selectedStatus
                            }
                        </Text>
                        <Text className="text-xs text-gray-400">⌄</Text>
                    </TouchableOpacity>
                </View>

                {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                    <TouchableOpacity
                        className="flex-row items-center justify-center py-2"
                        onPress={handleClearFilters}
                    >
                        <Text className="text-xs text-red-500 font-semibold">
                            {t('clear_all_filters') || 'Clear All Filters'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View className="px-4 flex-1">
                {isLoading ? (
                    <View className="flex-1 items-center justify-center py-8">
                        <ActivityIndicator size="large" color="#C62828" />
                        <Text className="text-gray-600 mt-2">
                            {t('loading_products') || 'Loading products...'}
                        </Text>
                    </View>
                ) : filteredProducts.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-8">
                        <Text className="text-gray-600">
                            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                                ? (t('no_products_match_filters') || 'No products match your filters')
                                : (t('no_products_found') || 'No products found')
                            }
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') {
                                    handleClearFilters();
                                } else {
                                    fetchProducts({ refresh: true });
                                }
                            }}
                            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg"
                        >
                            <Text className="text-gray-700">
                                {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                                    ? (t('clear_filters') || 'Clear Filters')
                                    : (t('retry') || 'Retry')
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={filteredProducts}
                        renderItem={renderProduct}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        showsVerticalScrollIndicator={false}
                        refreshing={isRefreshing}
                        onRefresh={() => fetchProducts({ refresh: true })}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={renderFooter}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>

            {renderCategoryModal()}
            {renderStatusModal()}
        </SafeAreaView>
    );
};

export default ProductsScreen;