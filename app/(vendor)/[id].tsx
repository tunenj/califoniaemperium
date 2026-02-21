import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Alert,
    TextInput,
    Modal,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { useLanguage } from '@/context/LanguageContext';

const { width } = Dimensions.get('window');

// Types based on the API response
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

type ApiResponse = {
    success: boolean;
    message: string;
    data: Product;
};

type UpdateProductData = {
    price?: number;
    compare_at_price?: number;
    stock_quantity?: number;
    short_description?: string;
    is_featured?: boolean;
};

type UpdateResponse = {
    id: string;
    slug: string;
    product_type: string;
    name: string;
    sku: string;
    description: string;
    short_description: string;
    category: string;
    brand: null | any;
    tags: any[];
    price: string;
    compare_at_price: string;
    cost_price: null | string;
    stock_quantity: number;
    low_stock_threshold: number;
    track_inventory: boolean;
    weight: null | number;
    length: null | number;
    width: null | number;
    height: null | number;
    condition: string;
    is_featured: boolean;
    requires_shipping: boolean;
    is_digital: boolean;
    meta_title: string;
    meta_description: string;
    variants: any[];
    attributes: any[];
    main_image_url: null | string;
};

export default function VendorProductDetails() {
    const { id } = useLocalSearchParams();
    const { t } = useLanguage();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    // Edit modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState<UpdateProductData>({});

    const fetchProductDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = await AsyncStorage.getItem('accessToken');
            
            const response = await api.get<ApiResponse>(
                endpoints.getProductDetails(id as string),
                {
                    headers: { 
                        Authorization: `Bearer ${token || ''}` 
                    },
                }
            );

            console.log('Product details response:', response.data);

            if (response.data.success && response.data.data) {
                setProduct(response.data.data);
                
                const productData = response.data.data;
                const primaryImage = productData.images?.find(img => img.is_primary)?.image;
                const firstImage = productData.images?.[0]?.image;
                const mainImage = productData.main_image;
                
                setSelectedImage(primaryImage || firstImage || mainImage || null);
                
                setEditData({
                    price: parseFloat(productData.price),
                    compare_at_price: productData.compare_at_price ? parseFloat(productData.compare_at_price) : undefined,
                    stock_quantity: productData.stock_quantity,
                    short_description: productData.short_description,
                    is_featured: productData.is_featured,
                });
            } else {
                setError('Failed to load product details');
            }
        } catch (error: any) {
            console.error('Error fetching product details:', error);
            setError(error.response?.data?.message || 'Failed to load product details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const updateProduct = async () => {
        try {
            setUpdating(true);
            
            const token = await AsyncStorage.getItem('accessToken');
            
            // Filter out undefined values and prepare payload exactly as API expects
            const updatePayload: Partial<UpdateProductData> = {};
            
            if (editData.price !== undefined) {
                updatePayload.price = editData.price;
            }
            if (editData.compare_at_price !== undefined) {
                updatePayload.compare_at_price = editData.compare_at_price;
            }
            if (editData.stock_quantity !== undefined) {
                updatePayload.stock_quantity = editData.stock_quantity;
            }
            if (editData.short_description !== undefined) {
                updatePayload.short_description = editData.short_description;
            }
            if (editData.is_featured !== undefined) {
                updatePayload.is_featured = editData.is_featured;
            }

            console.log('Updating product with payload:', updatePayload);

            const response = await api.patch<UpdateResponse>(
                endpoints.updateProduct(id as string),
                updatePayload,
                {
                    headers: { 
                        Authorization: `Bearer ${token || ''}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Update response:', response.data);

            // Check if update was successful (response contains the updated product data)
            if (response.data && response.data.id) {
                Alert.alert(
                    t('success') || 'Success',
                    t('product_updated') || 'Product updated successfully'
                );
                setShowEditModal(false);
                // Refresh product details
                await fetchProductDetails();
            } else {
                Alert.alert(
                    t('error') || 'Error',
                    t('update_failed') || 'Failed to update product'
                );
            }
        } catch (error: any) {
            console.error('Error updating product:', error);
            Alert.alert(
                t('error') || 'Error',
                error.response?.data?.message || t('update_failed') || 'Failed to update product'
            );
        } finally {
            setUpdating(false);
        }
    };

    const confirmUpdate = () => {
        // Validate inputs before showing confirmation
        if (editData.price && editData.price < 0) {
            Alert.alert(t('error') || 'Error', t('price_cannot_be_negative') || 'Price cannot be negative');
            return;
        }
        if (editData.stock_quantity && editData.stock_quantity < 0) {
            Alert.alert(t('error') || 'Error', t('stock_cannot_be_negative') || 'Stock quantity cannot be negative');
            return;
        }

        Alert.alert(
            t('confirm_update') || 'Confirm Update',
            t('confirm_update_message') || 'Are you sure you want to update this product?',
            [
                { text: t('cancel') || 'Cancel', style: 'cancel' },
                { text: t('update') || 'Update', onPress: updateProduct }
            ]
        );
    };

    const getPrimaryImage = () => {
        if (!product) return null;
        
        if (selectedImage) return selectedImage;
        
        const primaryImage = product.images?.find(img => img.is_primary)?.image;
        const firstImage = product.images?.[0]?.image;
        
        return primaryImage || firstImage || product.main_image || null;
    };

    const openEditModal = () => {
        if (!product) return;
        
        setEditData({
            price: parseFloat(product.price),
            compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : undefined,
            stock_quantity: product.stock_quantity,
            short_description: product.short_description,
            is_featured: product.is_featured,
        });
        setShowEditModal(true);
    };

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return `₦${numPrice.toLocaleString('en-NG', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#C62828" />
                <Text className="mt-4 text-gray-600">
                    {t('loading_product_details') || 'Loading product details...'}
                </Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View className="flex-1 bg-white justify-center items-center p-4">
                <Ionicons name="alert-circle-outline" size={64} color="#C62828" />
                <Text className="mt-4 text-gray-600 text-center">
                    {error || t('product_not_found') || 'Product not found'}
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 px-6 py-3 bg-red-500 rounded-lg"
                >
                    <Text className="text-white font-semibold">
                        {t('go_back') || 'Go Back'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const primaryImage = getPrimaryImage();

    return (
        <>
            <ScrollView className="flex-1 bg-white">
                <Stack.Screen 
                    options={{
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.back()} className="ml-2">
                                <Ionicons name="arrow-back" size={24} color="#000" />
                            </TouchableOpacity>
                        ),
                        headerRight: () => (
                            <View className="flex-row mr-2">
                                <TouchableOpacity
                                    onPress={openEditModal}
                                    className="mr-4"
                                >
                                    <Ionicons name="create-outline" size={24} color="#C62828" />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Ionicons name="ellipsis-vertical" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>
                        ),
                        title: product.name || 'Product Details',
                        headerTitleStyle: { fontSize: 16 },
                    }} 
                />

                {/* Product Image Gallery */}
                <View className="bg-gray-50">
                    {primaryImage ? (
                        <Image 
                            source={{ uri: primaryImage }}
                            style={{ width, height: width }}
                            resizeMode="contain"
                            className="bg-white"
                        />
                    ) : (
                        <View style={{ width, height: width }} className="bg-gray-100 items-center justify-center">
                            <Ionicons name="image-outline" size={64} color="#9CA3AF" />
                            <Text className="text-gray-400 mt-2">No image available</Text>
                        </View>
                    )}

                    {product.images && product.images.length > 0 && (
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            className="py-2 px-2"
                        >
                            {product.images.map((img) => (
                                <TouchableOpacity
                                    key={img.id}
                                    onPress={() => setSelectedImage(img.image)}
                                    className={`mr-2 rounded-lg border-2 ${
                                        selectedImage === img.image 
                                            ? 'border-red-500' 
                                            : 'border-transparent'
                                    }`}
                                >
                                    <Image 
                                        source={{ uri: img.image }}
                                        className="w-16 h-16 rounded-lg"
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                <View className="p-4">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 mr-4">
                            <Text className="text-2xl font-bold text-gray-900">{product.name}</Text>
                            <Text className="text-sm text-gray-500 mt-1">SKU: {product.sku}</Text>
                        </View>
                        <View className={`px-3 py-1 rounded-full ${
                            product.is_active ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                            <Text className={`text-xs font-semibold ${
                                product.is_active ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {product.is_active ? 'Active' : 'Inactive'}
                            </Text>
                        </View>
                    </View>

                    <View className="mt-4 flex-row items-baseline">
                        <Text className="text-3xl font-bold text-red-600">
                            {formatPrice(product.price)}
                        </Text>
                        {product.compare_at_price && (
                            <Text className="ml-2 text-lg text-gray-400 line-through">
                                {formatPrice(product.compare_at_price)}
                            </Text>
                        )}
                    </View>

                    {product.discount_percentage > 0 && (
                        <View className="mt-2 bg-red-100 px-3 py-1 rounded-full self-start">
                            <Text className="text-red-600 font-semibold">
                                {product.discount_percentage}% OFF
                            </Text>
                        </View>
                    )}

                    <View className="mt-4 flex-row items-center">
                        <View className={`w-3 h-3 rounded-full ${
                            product.is_in_stock ? 'bg-green-500' : 'bg-red-500'
                        } mr-2`} />
                        <Text className={`font-medium ${
                            product.is_in_stock ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {product.is_in_stock ? 'In Stock' : 'Out of Stock'}
                        </Text>
                        <Text className="text-gray-500 ml-4">
                            {product.stock_quantity} units available
                        </Text>
                    </View>

                    {product.is_featured && (
                        <View className="mt-2 flex-row items-center">
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text className="ml-1 text-yellow-600 font-medium">Featured Product</Text>
                        </View>
                    )}

                    <View className="mt-6">
                        <Text className="text-lg font-semibold text-gray-900">Description</Text>
                        <Text className="mt-2 text-gray-600 leading-6">
                            {product.description || product.short_description || 'No description available'}
                        </Text>
                    </View>

                    <View className="mt-6 bg-gray-50 rounded-xl p-4">
                        <Text className="text-lg font-semibold text-gray-900 mb-3">Product Details</Text>
                        
                        <View className="flex-row flex-wrap">
                            <DetailItem 
                                icon="cube-outline" 
                                label="Product Type" 
                                value={product.product_type} 
                            />
                            <DetailItem 
                                icon="pricetag-outline" 
                                label="Condition" 
                                value={product.condition} 
                            />
                            <DetailItem 
                                icon="cart-outline" 
                                label="Stock" 
                                value={`${product.stock_quantity} units`} 
                            />
                            <DetailItem 
                                icon="star-outline" 
                                label="Rating" 
                                value={product.rating_average || '0.0'} 
                            />
                        </View>
                    </View>

                    {product.category && (
                        <View className="mt-4 bg-gray-50 rounded-xl p-4">
                            <Text className="text-lg font-semibold text-gray-900 mb-2">Category</Text>
                            <Text className="text-gray-600">{product.category.full_path}</Text>
                            {product.category.description && (
                                <Text className="text-gray-500 text-sm mt-1">
                                    {product.category.description}
                                </Text>
                            )}
                        </View>
                    )}

                    {product.vendor_info && (
                        <View className="mt-4 bg-gray-50 rounded-xl p-4">
                            <Text className="text-lg font-semibold text-gray-900 mb-2">Vendor Information</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="storefront-outline" size={20} color="#C62828" />
                                <Text className="ml-2 text-gray-600">{product.vendor_info.vendor_name}</Text>
                            </View>
                        </View>
                    )}

                    <View className="mt-4 bg-gray-50 rounded-xl p-4">
                        <Text className="text-lg font-semibold text-gray-900 mb-2">Shipping Information</Text>
                        <View className="flex-row items-center">
                            <Ionicons 
                                name={product.requires_shipping ? "checkmark-circle" : "close-circle"} 
                                size={20} 
                                color={product.requires_shipping ? "#10B981" : "#EF4444"} 
                            />
                            <Text className="ml-2 text-gray-600">
                                {product.requires_shipping ? 'Requires Shipping' : 'Digital Product'}
                            </Text>
                        </View>
                        {product.weight && (
                            <Text className="text-gray-600 mt-2">Weight: {product.weight} kg</Text>
                        )}
                    </View>

                    <View className="mt-8 mb-6">
                        <TouchableOpacity
                            onPress={openEditModal}
                            className="bg-red-500 py-4 rounded-xl flex-row items-center justify-center"
                        >
                            <Ionicons name="create-outline" size={24} color="#ffffff" />
                            <Text className="text-white text-center font-semibold text-lg ml-2">
                                {t('edit_product') || 'Edit Product'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-2 border-t border-gray-200 pt-4">
                        <Text className="text-xs text-gray-400 text-center">
                            Product ID: {product.id} | Last Updated: {new Date(product.updated_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={showEditModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">
                                {t('edit_product') || 'Edit Product'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    {t('price') || 'Price'} (₦)
                                </Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                                    value={editData.price?.toString() || ''}
                                    onChangeText={(text) => {
                                        const value = text === '' ? undefined : parseFloat(text);
                                        setEditData({...editData, price: value});
                                    }}
                                    keyboardType="numeric"
                                    placeholder="Enter price"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    {t('compare_at_price') || 'Compare at Price'} (₦)
                                </Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                                    value={editData.compare_at_price?.toString() || ''}
                                    onChangeText={(text) => {
                                        const value = text === '' ? undefined : parseFloat(text);
                                        setEditData({...editData, compare_at_price: value});
                                    }}
                                    keyboardType="numeric"
                                    placeholder="Enter compare at price"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    {t('stock_quantity') || 'Stock Quantity'}
                                </Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                                    value={editData.stock_quantity?.toString() || ''}
                                    onChangeText={(text) => {
                                        const value = text === '' ? undefined : parseInt(text);
                                        setEditData({...editData, stock_quantity: value});
                                    }}
                                    keyboardType="numeric"
                                    placeholder="Enter stock quantity"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    {t('short_description') || 'Short Description'}
                                </Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                                    value={editData.short_description || ''}
                                    onChangeText={(text) => setEditData({...editData, short_description: text})}
                                    multiline
                                    numberOfLines={3}
                                    placeholder="Enter short description"
                                    textAlignVertical="top"
                                />
                            </View>

                            <View className="mb-6 flex-row items-center justify-between">
                                <Text className="text-sm font-medium text-gray-700">
                                    {t('featured_product') || 'Featured Product'}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setEditData({...editData, is_featured: !editData.is_featured})}
                                    className={`px-4 py-2 rounded-full ${
                                        editData.is_featured ? 'bg-yellow-500' : 'bg-gray-200'
                                    }`}
                                >
                                    <Text className={`font-semibold ${
                                        editData.is_featured ? 'text-white' : 'text-gray-600'
                                    }`}>
                                        {editData.is_featured ? 'Yes' : 'No'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={confirmUpdate}
                                disabled={updating}
                                className="bg-red-500 py-4 rounded-xl mb-4"
                            >
                                {updating ? (
                                    <View className="flex-row items-center justify-center">
                                        <ActivityIndicator size="small" color="#ffffff" />
                                        <Text className="text-white font-semibold ml-2">
                                            {t('updating') || 'Updating...'}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="text-white text-center font-semibold text-lg">
                                        {t('update_product') || 'Update Product'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowEditModal(false)}
                                className="border border-gray-300 py-4 rounded-xl"
                            >
                                <Text className="text-gray-700 text-center font-semibold text-lg">
                                    {t('cancel') || 'Cancel'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const DetailItem = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <View className="w-1/2 mb-3">
        <View className="flex-row items-center">
            <Ionicons name={icon} size={16} color="#C62828" />
            <Text className="text-xs text-gray-500 ml-1">{label}</Text>
        </View>
        <Text className="text-sm font-medium text-gray-900 mt-1 ml-5">{value}</Text>
    </View>
);