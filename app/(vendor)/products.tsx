import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    ActivityIndicator,
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

type Product = {
    id: string;
    name: string;
    price: string;
    stock: number;
    image?: any | null;
};

const ProductsScreen: React.FC = () => {
    const { t } = useLanguage();
    const { isAuthenticated, logout } = useAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const mapApiItemToProduct = (item: any): Product => ({
        id: String(item.id || item._id || ''),
        name: item.name || item.title || 'Untitled',
        price: item.price !== undefined ? String(item.price) : (item.display_price || '0'),
        stock: item.stock_quantity ?? item.stock ?? 0,
        image: item.image || item.thumbnail || item.main_image || null,
    });

    const fetchProducts = async (opts: { refresh?: boolean; url?: string; page?: number } = {}) => {
        if (opts.refresh) {
            setIsRefreshing(true);
            setCurrentPage(1);
        } else if (opts.url || opts.page) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            const token = await AsyncStorage.getItem('authToken');
            
            // Determine fetch URL
            let fetchUrl = opts.url || endpoints.products;
            
            // If page number is provided and we don't have a URL, construct it
            if (opts.page && !opts.url) {
                const separator = endpoints.products.includes('?') ? '&' : '?';
                fetchUrl = `${endpoints.products}${separator}page=${opts.page}`;
            }
            
            console.log('==========================================');
            console.log('FETCHING PRODUCTS');
            console.log('URL:', fetchUrl);
            console.log('Current products count:', products.length);
            console.log('Page:', opts.page || currentPage);
            console.log('==========================================');
            
            const res = await api.get(fetchUrl, {
                headers: {
                    Authorization: `Bearer ${token || ''}`,
                },
            });

            // Log the entire response structure
            console.log('==========================================');
            console.log('API RESPONSE RECEIVED');
            console.log('Status:', res.status);
            console.log('Response keys:', Object.keys(res.data || {}));
            console.log('Full response data:', JSON.stringify(res.data, null, 2));
            console.log('==========================================');

            let list: any[] = [];
            let newNextUrl: string | null = null;
            let count: number = 0;

            // Handle paginated response (count, next, previous, results)
            if (res.data?.results && Array.isArray(res.data.results)) {
                list = res.data.results;
                newNextUrl = res.data.next || null;
                count = res.data.count || 0;
                console.log('✓ Detected PAGINATED response');
                console.log('  - Items in this page:', list.length);
                console.log('  - Total count:', count);
                console.log('  - Next URL:', newNextUrl || 'NONE');
                console.log('  - Previous URL:', res.data.previous || 'NONE');
            } 
            // Handle success response with data array
            else if (res.data?.success === true && Array.isArray(res.data.data)) {
                list = res.data.data;
                count = res.data.total || res.data.count || list.length;
                
                // Check for pagination in various places
                if (res.data.pagination) {
                    newNextUrl = res.data.pagination.next || null;
                    count = res.data.pagination.total || count;
                } else if (res.data.next) {
                    newNextUrl = res.data.next;
                }
                
                console.log('✓ Detected SUCCESS response');
                console.log('  - Items:', list.length);
                console.log('  - Total:', count);
                console.log('  - Next URL:', newNextUrl || 'NONE');
            } 
            // Handle direct array
            else if (Array.isArray(res.data)) {
                list = res.data;
                count = list.length;
                console.log('✓ Detected DIRECT ARRAY response');
                console.log('  - Items:', list.length);
            } 
            // Handle nested data
            else if (res.data?.data && Array.isArray(res.data.data)) {
                list = res.data.data;
                count = res.data.total || res.data.count || list.length;
                if (res.data.next) {
                    newNextUrl = res.data.next;
                }
                console.log('✓ Detected NESTED DATA response');
                console.log('  - Items:', list.length);
                console.log('  - Total:', count);
                console.log('  - Next URL:', newNextUrl || 'NONE');
            }

            const mapped = list.map(mapApiItemToProduct);

            if (opts.refresh) {
                setProducts(mapped);
                setNextUrl(newNextUrl);
                setTotalCount(count);
                console.log('>>> SET products (REFRESH):', mapped.length, 'items');
            } else if (opts.url || opts.page) {
                // Append to existing products
                setProducts(prev => {
                    const combined = [...prev, ...mapped];
                    console.log('>>> APPENDED products:', prev.length, '+', mapped.length, '=', combined.length);
                    return combined;
                });
                setNextUrl(newNextUrl);
                setCurrentPage(prev => prev + 1);
                console.log('>>> Next page will be:', currentPage + 1);
            } else {
                setProducts(mapped);
                setNextUrl(newNextUrl);
                setTotalCount(count);
                console.log('>>> SET products (INITIAL):', mapped.length, 'items');
            }

            console.log('==========================================');
            console.log('FINAL STATE');
            console.log('Total products in state:', opts.url || opts.page ? products.length + mapped.length : mapped.length);
            console.log('Has next page?', newNextUrl ? 'YES' : 'NO');
            console.log('Next URL:', newNextUrl);
            console.log('Total count:', count);
            console.log('==========================================');

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
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchProducts();
        }
    }, [isAuthenticated]);

    const handleLoadMore = () => {
        console.log('==========================================');
        console.log('LOAD MORE TRIGGERED');
        console.log('Has nextUrl?', !!nextUrl);
        console.log('nextUrl:', nextUrl);
        console.log('isLoadingMore?', isLoadingMore);
        console.log('isLoading?', isLoading);
        console.log('isRefreshing?', isRefreshing);
        console.log('==========================================');

        if (nextUrl && !isLoadingMore && !isLoading && !isRefreshing) {
            console.log('>>> Fetching next page...');
            fetchProducts({ url: nextUrl });
        } else if (!nextUrl && totalCount > products.length) {
            // Try pagination by page number
            console.log('>>> No nextUrl, trying page number:', currentPage + 1);
            fetchProducts({ page: currentPage + 1 });
        }
    };

    const handleManualLoadMore = () => {
        if (totalCount > products.length) {
            if (nextUrl) {
                fetchProducts({ url: nextUrl });
            } else {
                fetchProducts({ page: currentPage + 1 });
            }
        }
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={{ width: ITEM_WIDTH }}
            className="bg-white rounded-xl p-3 mb-4 border border-gray-200"
            activeOpacity={0.85}
        >
            {item.image ? (
                <Image
                    source={typeof item.image === 'string' ? { uri: item.image } : item.image}
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

                <View className="bg-green-100 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] text-green-600 font-semibold">
                        {t('active')}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between items-center mt-1">
                <Text className="text-sm font-semibold text-gray-900">
                    ₦{item.price}
                </Text>
                <Text className="text-xs text-gray-500">
                    {item.stock} {t('in_stock')}
                </Text>
            </View>
        </TouchableOpacity>
    );

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

        // Show manual load button if there are more products
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

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 pt-4 pb-3">
                <View className="flex-row justify-between items-center mb-3">
                    <View>
                        <Text className="text-lg font-bold text-gray-900">
                            {t('products')}
                        </Text>
                        <Text className="text-xs text-gray-500">
                            {products.length} {totalCount > 0 && totalCount !== products.length ? `/ ${totalCount}` : ''} {t('products_in_your_store')}
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

                <View className="bg-white rounded-xl px-4 py-1 border border-gray-200 mb-3">
                    <TextInput
                        placeholder={t('search_products')}
                        placeholderTextColor="#9CA3AF"
                        className="text-sm text-gray-800"
                    />
                </View>

                <View className="flex-row gap-3">
                    <TouchableOpacity className="flex-row items-center justify-between flex-1 bg-white px-4 py-3 rounded-xl border border-gray-200">
                        <Text className="text-xs text-gray-700">{t('all_categories')}</Text>
                        <Text className="text-xs text-gray-400">⌄</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between flex-1 bg-white px-4 py-3 rounded-xl border border-gray-200">
                        <Text className="text-xs text-gray-700">{t('all_status')}</Text>
                        <Text className="text-xs text-gray-400">⌄</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="px-4 flex-1 bg-orange-50 pt-2 border border-orange-300 rounded-xl">
                {isLoading ? (
                    <View className="flex-1 items-center justify-center py-8">
                        <ActivityIndicator size="large" color="#C62828" />
                        <Text className="text-gray-600 mt-2">
                            {t('loading_products') || 'Loading products...'}
                        </Text>
                    </View>
                ) : products.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-8">
                        <Text className="text-gray-600">{t('no_products_found') || 'No products found'}</Text>
                        <TouchableOpacity
                            onPress={() => fetchProducts({ refresh: true })}
                            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg"
                        >
                            <Text className="text-gray-700">{t('retry') || 'Retry'}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={products}
                        renderItem={renderProduct}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
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
        </SafeAreaView>
    );
};

export default ProductsScreen;