import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { MetricCard } from "../MetricCard/MetricCard";
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MetricsCarousel() {
    const { t } = useLanguage();
    const { isAuthenticated } = useAuth(); // Get both authState and isAuthenticated
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);

    // Get token from AsyncStorage or authState
    useEffect(() => {
        const getToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('authToken');
                setToken(storedToken);
            } catch (error) {
                console.error('Error getting token:', error);
                setToken(null);
            }
        };

        getToken();
    }, []); // Re-run when authState changes

    useEffect(() => {
        const fetchVendorStats = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check if user is authenticated
                if (!isAuthenticated || !token) {
                    setError(t('authentication_required') || "Authentication required");
                    setLoading(false);
                    return;
                }

                // Using the new vendorCard endpoint
                const response = await api.get(endpoints.vendorCard, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                console.log('Vendor stats response:', response.data);

                if (response.data?.success && response.data.data) {
                    setDashboardData(response.data.data);
                } else {
                    setError(response.data?.message || t('failed_to_fetch_data') || "Failed to fetch data");
                }
            } catch (error: any) {
                console.error('Error fetching vendor stats:', error);
                
                // Handle specific error cases
                if (error.response?.status === 401) {
                    setError(t('session_expired') || "Session expired. Please login again.");
                } else if (error.response?.status === 403) {
                    setError(t('access_denied') || "Access denied. Vendor access required.");
                } else if (error.response?.status === 404) {
                    setError(t('endpoint_not_found') || "Endpoint not found. Please check configuration.");
                } else {
                    setError(error.message || t('something_went_wrong') || "Something went wrong");
                }
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if user is authenticated and has token
        if (isAuthenticated && token) {
            fetchVendorStats();
        } else {
            setLoading(false);
            if (!isAuthenticated) {
                setError(t('authentication_required') || "Authentication required");
            } else if (!token) {
                setError(t('session_expired') || "Session expired. Please login again.");
            }
        }
    }, [t, isAuthenticated, token]); // Add token as dependency

    const retryFetch = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if user is authenticated
            if (!isAuthenticated || !token) {
                setError(t('authentication_required') || "Authentication required");
                setLoading(false);
                return;
            }

            const response = await api.get(endpoints.vendorCard, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.data?.success && response.data.data) {
                setDashboardData(response.data.data);
            } else {
                setError(response.data?.message || t('failed_to_fetch_data') || "Failed to fetch data");
            }
        } catch (error: any) {
            console.error('Error fetching vendor stats:', error);
            if (error.response?.status === 401) {
                setError(t('session_expired') || "Session expired. Please login again.");
            } else {
                setError(error.message || t('something_went_wrong') || "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="bg-orange-50/40 -mt-6 mb-4 py-12 items-center justify-center">
                <ActivityIndicator size="large" color="#EC6625" />
            </View>
        );
    }

    // If not authenticated, show authentication required message
    if (!isAuthenticated) {
        return (
            <View className="bg-orange-50/40 -mt-6 mb-4 py-6">
                <View className="text-left mb-4 px-4">
                    <Text className="text-lg font-bold text-black text-center">
                        {t('vendor_dashboard') || "Vendor Dashboard"}
                    </Text>
                    <Text className="text-sm text-gray-600 text-center mt-1">
                        {t('business_insights') || "Business insights at a glance"}
                    </Text>
                </View>
                
                <View className="mx-4 bg-yellow-50 p-4 rounded-lg">
                    <Text className="text-yellow-700 text-center">
                        {t('please_login_to_view_dashboard') || "Please login to view dashboard"}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="bg-orange-50/40 -mt-6 mb-4 py-6">
            {/* Business Header */}
            <View className="text-left mb-4 px-4">
                <Text className="text-lg font-bold text-black text-center">
                    {t('vendor_dashboard') || "Vendor Dashboard"}
                </Text>
                <Text className="text-sm text-gray-600 text-center mt-1">
                    {t('business_insights') || "Business insights at a glance"}
                </Text>
            </View>

            {/* Error Display */}
            {error && (
                <View className="mx-4 mb-4 bg-red-50 p-3 rounded-lg">
                    <Text className="text-red-600 text-center text-sm">{error}</Text>
                    <TouchableOpacity
                        onPress={retryFetch}
                        className="mt-2 bg-red-100 py-2 rounded-lg"
                    >
                        <Text className="text-red-700 text-center font-medium text-sm">
                            {t('retry') || "Retry"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Core Metrics - Only show if we have data */}
            {dashboardData && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
                >
                    {/* Revenue Card */}
                    <MetricCard
                        label={t('total_revenue') || "Revenue"}
                        value={`${parseFloat(dashboardData?.total_revenue || "0").toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon="wallet"
                        sideColor="#10B981" // Green for revenue
                    />

                    {/* Products Card */}
                    <MetricCard
                        label={t('total_products') || "Products"}
                        value={dashboardData?.total_products?.toString() || "0"}
                        subValue={`${dashboardData?.active_products || 0} active`}
                        icon="package"
                        sideColor="#3B82F6" // Blue for products
                    />

                    {/* Orders Card */}
                    <MetricCard
                        label={t('total_orders') || "Orders"}
                        value={dashboardData?.total_orders?.toString() || "0"}
                        subValue={`${dashboardData?.completed_orders || 0} completed`}
                        icon="shopping-bag"
                        sideColor="#EC6625" // Orange for orders
                    />

                    {/* Rating Card */}
                    <MetricCard
                        label={t('rating') || "Rating"}
                        value={`${parseFloat(dashboardData?.rating_average || "0").toFixed(1)}/5`}
                        subValue={`${dashboardData?.rating_count || 0} reviews`}
                        icon="star"
                        sideColor="#FFD700" // Gold for ratings
                    />
                </ScrollView>
            )}

            {/* No data message */}
            {!dashboardData && !error && (
                <View className="mx-4 bg-gray-50 p-4 rounded-lg">
                    <Text className="text-gray-600 text-center">
                        {t('no_data_available') || "No dashboard data available"}
                    </Text>
                </View>
            )}
        </View>
    );
}