import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome, MaterialIcons, AntDesign, Feather } from "@expo/vector-icons";
import { colors } from "@/constants/color";
import { useLanguage } from "@/context/LanguageContext";
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the Vendor Dashboard interface based on your new endpoint
interface VendorDashboardData {
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
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    commission_rate: string;
    total_revenue: string;
    bank_name: string;
    account_holder_name: string;
}

// Define the API response structure
interface VendorDashboardResponse {
    success: boolean;
    message: string;
    data: VendorDashboardData;
}

const VendorDashboardPage = () => {
    const router = useRouter();
    const { t } = useLanguage();

    const [dashboardData, setDashboardData] = useState<VendorDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper function to format price in euros
    const formatPrice = useCallback((price: string) => {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return "€0.00";
        return `€${numPrice.toFixed(2)}`;
    }, []);

    // Fetch vendor dashboard data
    const fetchVendorDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Get token
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                setError(t('authentication_required') || "Authentication required");
                setLoading(false);
                router.push('/(auth)/signIn');
                return;
            }

            // Use the new vendor dashboard endpoint
            const response = await api.get<VendorDashboardResponse>(
                endpoints.getVendoInfo // This should be '/vendors/me/dashboard/'
            );

            if (response.data.success && response.data.data) {
                setDashboardData(response.data.data);
            } else {
                setError(response.data.message || t('failed_to_load_dashboard') || "Failed to load dashboard");
            }
        } catch (error: any) {
            console.error("Error fetching vendor dashboard:", error);
            if (error.response?.status === 401) {
                setError(t('session_expired') || "Session expired");
                await AsyncStorage.removeItem('authToken');
                router.push('/(auth)/signIn');
            } else if (error.response?.status === 403) {
                setError(t('vendor_access_required') || "Vendor access required");
            } else if (error.response?.status === 404) {
                setError(t('dashboard_not_found') || "Dashboard not found");
            } else {
                setError(error.message || t('failed_to_load_dashboard') || "Failed to load dashboard");
            }
        } finally {
            setLoading(false);
        }
    }, [t, router]);

    useEffect(() => {
        fetchVendorDashboard();
    }, [fetchVendorDashboard]);

    const handleRetry = useCallback(() => {
        fetchVendorDashboard();
    }, [fetchVendorDashboard]);

    const handleEditProfile = useCallback(() => {
        if (dashboardData) {
            router.push({
                pathname: '/(vendor)/profile',
                params: {
                    business_slug: dashboardData.business_slug // Pass the slug
                }
            });
        }
    }, [dashboardData, router]);

    const handleViewProducts = useCallback(() => {
        if (dashboardData) {
            router.push({
                pathname: '/(vendor)/products',
                params: { vendorId: dashboardData.id }
            });
        }
    }, [dashboardData, router]);

    const handleViewOrders = useCallback(() => {
        if (dashboardData) {
            router.push({
                pathname: '/(vendor)/orders',
                params: { vendorId: dashboardData.id }
            });
        }
    }, [dashboardData, router]);

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color={colors.darkRed} />
                <Text className="text-gray-500 text-sm mt-2">
                    {t('loading_dashboard') || "Loading dashboard..."}
                </Text>
            </View>
        );
    }

    if (error || !dashboardData) {
        return (
            <View className="flex-1 bg-white">
                {/* Header */}
                <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color={colors.darkRed} />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold ml-4">
                        {t('vendor_dashboard') || "Vendor Dashboard"}
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center px-4">
                    <View className="items-center mb-6">
                        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <Text className="text-4xl">📊</Text>
                        </View>
                        <Text className="text-lg font-semibold text-gray-800 mb-2">
                            {t('dashboard_error') || "Dashboard Error"}
                        </Text>
                    </View>

                    <Text className="text-red-500 text-base mb-6 text-center">
                        {error}
                    </Text>

                    <View className="flex-row space-x-4">
                        <TouchableOpacity
                            className="flex-1 bg-darkRed px-6 py-3 rounded-lg"
                            onPress={handleRetry}
                        >
                            <Text className="text-white text-sm font-medium text-center">
                                {t('try_again') || "Try Again"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 border border-gray-300 px-6 py-3 rounded-lg"
                            onPress={() => router.push('/(vendor)/profile')}
                        >
                            <Text className="text-gray-700 text-sm font-medium text-center">
                                {t('go_home') || "Go Home"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 py-4 border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()}>
                            <MaterialIcons name="arrow-back" size={24} color={colors.darkRed} />
                        </TouchableOpacity>
                        <Text className="text-lg font-semibold ml-4">
                            {t('vendor_dashboard') || "Vendor Dashboard"}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleEditProfile}>
                        <Feather name="edit" size={20} color={colors.darkRed} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Business Info Card */}
            <View className="p-4">
                <View className="bg-white rounded-2xl shadow-sm p-4">
                    {/* Business Logo and Name */}
                    <View className="flex-row items-center mb-4">
                        <View className="w-20 h-20 bg-gray-100 rounded-xl items-center justify-center mr-4">
                            {dashboardData.logo ? (
                                <Image
                                    source={{ uri: dashboardData.logo }}
                                    className="w-16 h-16 rounded-lg"
                                    resizeMode="contain"
                                />
                            ) : (
                                <Text className="text-3xl">🏪</Text>
                            )}
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center">
                                <Text className="text-xl font-bold text-gray-800 flex-1">
                                    {dashboardData.business_name}
                                </Text>
                                {dashboardData.is_verified && (
                                    <AntDesign name="check-circle" size={20} color="#10B981" />
                                )}
                            </View>
                            <Text className="text-sm text-gray-500 mt-1">
                                {dashboardData.business_type}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1">
                                {dashboardData.business_email}
                            </Text>
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View className="flex-row justify-between py-3 border-t border-gray-100">
                        <View className="items-center flex-1">
                            <View className="flex-row items-center">
                                <FontAwesome name="star" size={16} color="#FFA500" />
                                <Text className="text-lg font-bold ml-1">
                                    {parseFloat(dashboardData.rating_average).toFixed(1)}
                                </Text>
                            </View>
                            <Text className="text-xs text-gray-500 mt-1">
                                {dashboardData.rating_count} {t('ratings') || 'ratings'}
                            </Text>
                        </View>

                        <View className="items-center flex-1 border-l border-r border-gray-100">
                            <Text className="text-lg font-bold">
                                {dashboardData.total_sales}
                            </Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                {t('total_sales') || 'Total Sales'}
                            </Text>
                        </View>

                        <View className="items-center flex-1">
                            <Text className="text-lg font-bold">
                                {dashboardData.pending_products_count}
                            </Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                {t('pending_products') || 'Pending'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Financial Overview */}
            <View className="px-4 mb-4">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                    {t('financial_overview') || "Financial Overview"}
                </Text>
                <View className="bg-white rounded-2xl shadow-sm p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-sm text-gray-500">
                                {t('total_revenue') || "Total Revenue"}
                            </Text>
                            <Text className="text-2xl font-bold text-gray-800">
                                {formatPrice(dashboardData.total_revenue)}
                            </Text>
                        </View>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                            <Text className="text-green-700 text-sm font-medium">
                                {dashboardData.commission_rate}% {t('commission') || "commission"}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-sm text-gray-500">
                                {t('pending_payouts') || "Pending Payouts"}
                            </Text>
                            <Text className="text-lg font-bold text-gray-800">
                                {formatPrice(dashboardData.total_revenue)} {/* Note: Your API doesn't have pending_payouts field */}
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="bg-darkRed px-4 py-2 rounded-lg"
                            onPress={() => Alert.alert("Payout", "Payout feature coming soon")}
                        >
                            <Text className="text-white text-sm font-medium">
                                {t('request_payout') || "Request Payout"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View className="px-4 mb-4">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                    {t('quick_actions') || "Quick Actions"}
                </Text>
                <View className="flex-row flex-wrap -mx-1">
                    <TouchableOpacity
                        className="w-1/2 px-1 mb-2"
                        onPress={handleViewProducts}
                    >
                        <View className="bg-white rounded-xl p-4 border border-gray-200 items-center">
                            <MaterialIcons name="inventory" size={28} color="#3B82F6" />
                            <Text className="text-gray-800 font-medium mt-2">
                                {t('manage_products') || "Manage Products"}
                            </Text>
                            <Text className="text-gray-500 text-xs mt-1">
                                {dashboardData.pending_products_count} pending
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-1/2 px-1 mb-2"
                        onPress={handleViewOrders}
                    >
                        <View className="bg-white rounded-xl p-4 border border-gray-200 items-center">
                            <MaterialIcons name="shopping-cart" size={28} color="#EC6625" />
                            <Text className="text-gray-800 font-medium mt-2">
                                {t('view_orders') || "View Orders"}
                            </Text>
                            <Text className="text-gray-500 text-xs mt-1">
                                {dashboardData.total_sales} total sales
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Business Details */}
            <View className="px-4 mb-8">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                    {t('business_details') || "Business Details"}
                </Text>
                <View className="bg-white rounded-2xl shadow-sm p-4">
                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">{t('business_email') || "Business Email"}</Text>
                            <Text className="font-medium">{dashboardData.business_email}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">{t('business_phone') || "Business Phone"}</Text>
                            <Text className="font-medium">{dashboardData.business_phone}</Text>
                        </View>
                        {dashboardData.address_line1 && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">{t('address') || "Address"}</Text>
                                <Text className="font-medium text-right max-w-[60%]">
                                    {dashboardData.address_line1}, {dashboardData.city}, {dashboardData.state}
                                </Text>
                            </View>
                        )}
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">{t('verification_status') || "Verification Status"}</Text>
                            <Text className="font-medium capitalize">{dashboardData.verification_status}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">{t('account_status') || "Account Status"}</Text>
                            <Text className={`font-medium ${dashboardData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                {dashboardData.is_active ? 'Active' : 'Inactive'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default VendorDashboardPage;