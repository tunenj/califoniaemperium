import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    ImageBackground,
    Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { colors } from "@/constants/color";
import { useLanguage } from "@/context/LanguageContext";
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

// Define the Vendor interface
interface Vendor {
    id: string;
    user: string;
    user_email: string;
    user_name: string;
    business_name: string;
    business_slug: string;
    business_type: string;
    business_email: string;
    business_phone: string;
    description: string;
    logo: string | null;
    banner: string | null;
    verification_status: string;
    is_verified: boolean;
    verified_at: string;
    is_active: boolean;
    is_accepting_orders: boolean;
    rating_average: string;
    rating_count: number;
    total_sales: number;
    return_policy: string;
    shipping_policy: string;
    website: string;
    facebook: string;
    twitter: string;
    instagram: string;
    created_at: string;
    updated_at: string;
    pending_products_count: number;
}

// Define the API response structure for individual vendor
interface VendorResponse {
    success: boolean;
    message: string;
    data: Vendor;
}

const StoreDetailsPage = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { t } = useLanguage();

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get store slug from params - use business_slug for the API call
    const storeSlug = params.storeSlug as string;
    const storeName = params.storeName as string;

    // Format rating
    const formatRating = (rating: string) => {
        const numRating = parseFloat(rating);
        return isNaN(numRating) ? "0.0" : numRating.toFixed(1);
    };

    // Fetch vendor details using the business_slug
    const fetchVendorDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (!storeSlug) {
                setError(t('store_not_found') || "Store not found");
                setLoading(false);
                return;
            }

            // Use the getVendorDetails endpoint with the business_slug
            const response = await api.get<VendorResponse>(
                endpoints.getVendorDetails(storeSlug)
            );

            if (response.data.success && response.data.data) {
                setVendor(response.data.data);
            } else {
                setError(response.data.message || t('store_not_found') || "Store not found");
            }
        } catch (error: any) {
            console.error("Error fetching vendor details:", error);
            // Check for specific error status
            if (error.response?.status === 404) {
                setError(t('store_not_found') || "Store not found");
            } else if (error.response?.status === 401) {
                setError(t('unauthorized_access') || "Unauthorized access");
            } else {
                setError(error.message || t('failed_to_load_store') || "Failed to load store details");
            }
        } finally {
            setLoading(false);
        }
    }, [storeSlug, t]);

    useEffect(() => {
        if (storeSlug) {
            fetchVendorDetails();
        } else {
            setError(t('store_not_found') || "Store not found");
            setLoading(false);
        }
    }, [fetchVendorDetails, storeSlug, t]);

    const handleRetry = useCallback(() => {
        fetchVendorDetails();
    }, [fetchVendorDetails]);

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color={colors.darkRed} />
                <Text className="text-gray-500 text-sm mt-2">
                    {t('loading_store') || "Loading store..."}
                </Text>
            </View>
        );
    }

    if (error || !vendor) {
        return (
            <View className="flex-1 bg-white">
                {/* Header */}
                <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color={colors.darkRed} />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold ml-4">
                        {storeName || "Store Details"}
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center px-4">
                    <View className="items-center mb-6">
                        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <Text className="text-gray-400 text-xs">No Image</Text>
                        </View>
                        <Text className="text-lg font-semibold text-gray-800 mb-2">
                            {storeName || "Store not found"}
                        </Text>
                    </View>

                    <Text className="text-red-500 text-base mb-6 text-center">
                        {typeof error === 'string' ? error : 'Failed to load store details'}
                    </Text>

                    <View className="flex-row space-x-4 gap-4">
                        <TouchableOpacity
                            className="flex-1 bg-darkRed px-6 py-3 rounded-lg"
                            onPress={handleRetry}
                        >
                            <Text className="text-white text-sm font-medium text-center">
                                Try Again
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 border border-gray-300 px-6 py-3 rounded-lg"
                            onPress={() => router.back()}
                        >
                            <Text className="text-gray-700 text-sm font-medium text-center">
                                Go Back
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header with Back Button */}
            <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center px-4 py-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white/80 p-2 rounded-full"
                >
                    <MaterialIcons name="arrow-back" size={24} color={colors.darkRed} />
                </TouchableOpacity>
            </View>

            {/* Store Banner - Show only if banner exists */}
            {vendor.banner ? (
                <ImageBackground
                    source={{ uri: vendor.banner }}
                    className="h-64 w-full"
                    resizeMode="cover"
                >
                    <View className="flex-1 bg-black/20" />
                </ImageBackground>
            ) : (
                <View className="h-64 w-full bg-gray-200 items-center justify-center">
                    <View className="w-24 h-24 bg-gray-300 rounded-full items-center justify-center">
                        <Text className="text-gray-600 text-xs">No Banner</Text>
                    </View>
                </View>
            )}

            {/* Store Info Card */}
            <View className="px-4 -mt-16">
                <View className="bg-white rounded-2xl shadow-lg p-4">
                    {/* Logo and Name */}
                    <View className="flex-row items-center mb-4">
                        <View className="w-20 h-20 bg-white rounded-xl shadow-md items-center justify-center mr-4">
                            {vendor.logo ? (
                                <Image
                                    source={{ uri: vendor.logo }}
                                    className="w-16 h-16 rounded-lg"
                                    resizeMode="contain"
                                />
                            ) : (
                                <View className="w-16 h-16 bg-gray-100 rounded-lg items-center justify-center">
                                    <Text className="text-gray-500 text-xs">No Logo</Text>
                                </View>
                            )}
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center">
                                <Text className="text-xl font-bold text-gray-800 flex-1">
                                    {vendor.business_name}
                                </Text>
                                {vendor.is_verified && (
                                    <AntDesign name="check-circle" size={20} color="#10B981" />
                                )}
                            </View>
                            <Text className="text-sm text-gray-500 mt-1">
                                {vendor.business_type}
                            </Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View className="flex-row justify-between py-4 border-t border-gray-100">
                        <View className="items-center flex-1">
                            <View className="flex-row items-center">
                                <FontAwesome name="star" size={16} color="#FFA500" />
                                <Text className="text-lg font-bold ml-1">
                                    {formatRating(vendor.rating_average)}
                                </Text>
                            </View>
                            <Text className="text-xs text-gray-500 mt-1">
                                {vendor.rating_count} {t('ratings') || 'ratings'}
                            </Text>
                        </View>

                        <View className="items-center flex-1 border-l border-r border-gray-100">
                            <Text className="text-lg font-bold">
                                {vendor.total_sales}
                            </Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                {t('total_sales') || 'Total Sales'}
                            </Text>
                        </View>

                        <View className="items-center flex-1">
                            <View className={`px-3 py-1 rounded-full ${vendor.is_accepting_orders ? 'bg-green-100' : 'bg-red-100'}`}>
                                <Text className={`text-xs font-medium ${vendor.is_accepting_orders ? 'text-green-700' : 'text-red-700'}`}>
                                    {vendor.is_accepting_orders
                                        ? (t('open') || 'Open')
                                        : (t('closed') || 'Closed')
                                    }
                                </Text>
                            </View>
                            <Text className="text-xs text-gray-500 mt-1">
                                {t('status') || 'Status'}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row space-x-3 mt-4 gap-2">
                        <TouchableOpacity className="flex-1 bg-darkRed py-3 rounded-lg">
                            <Text className="text-white text-center font-medium">
                                {t('follow_store') || 'Follow Store'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* About Section */}
            {vendor.description && (
                <View className="px-4 mt-6">
                    <Text className="text-lg font-bold text-gray-800 mb-3">
                        {t('about') || 'About'}
                    </Text>
                    <View className="bg-gray-50 p-4 rounded-xl">
                        <Text className="text-gray-700 leading-6">
                            {vendor.description}
                        </Text>
                    </View>
                </View>
            )}

            {/* Policies */}
            <View className="px-4 mt-6 mb-8">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                    {t('policies') || 'Policies'}
                </Text>

                {vendor.return_policy ? (
                    <View className="bg-gray-50 p-4 rounded-xl mb-3">
                        <Text className="font-semibold text-gray-800 mb-2">
                            {t('return_policy') || 'Return Policy'}
                        </Text>
                        <Text className="text-gray-700 text-sm">
                            {vendor.return_policy}
                        </Text>
                    </View>
                ) : (
                    <View className="bg-gray-50 p-4 rounded-xl mb-3">
                        <Text className="text-gray-500 text-sm">
                            {t('no_return_policy') || 'No return policy available'}
                        </Text>
                    </View>
                )}

                {vendor.shipping_policy ? (
                    <View className="bg-gray-50 p-4 rounded-xl">
                        <Text className="font-semibold text-gray-800 mb-2">
                            {t('shipping_policy') || 'Shipping Policy'}
                        </Text>
                        <Text className="text-gray-700 text-sm">
                            {vendor.shipping_policy}
                        </Text>
                    </View>
                ) : (
                    <View className="bg-gray-50 p-4 rounded-xl">
                        <Text className="text-gray-500 text-sm">
                            {t('no_shipping_policy') || 'No shipping policy available'}
                        </Text>
                    </View>
                )}
            </View>

            {/* Store Details */}
            <View className="px-4 mb-8">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                    {t('store_details') || 'Store Details'}
                </Text>
                <View className="bg-gray-50 p-4 rounded-xl space-y-2">
                    <View className="flex-row justify-between">
                        <Text className="text-gray-600">{t('store_id') || 'Store ID'}</Text>
                        <Text className="font-medium">{vendor.id}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-600">{t('verification_status') || 'Verification Status'}</Text>
                        <Text className="font-medium capitalize">{vendor.verification_status}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-600">{t('verified_since') || 'Verified Since'}</Text>
                        <Text className="font-medium">
                            {new Date(vendor.verified_at).toLocaleDateString()}
                        </Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-600">{t('member_since') || 'Member Since'}</Text>
                        <Text className="font-medium">
                            {new Date(vendor.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default StoreDetailsPage;