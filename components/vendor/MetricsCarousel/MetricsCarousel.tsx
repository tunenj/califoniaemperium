import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { MetricCard } from "../MetricCard/MetricCard";
import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from "react";
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MetricsCarousel() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        const fetchVendorDashboard = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = await AsyncStorage.getItem('authToken');
                if (!token) {
                    setError(t('authentication_required') || "Authentication required");
                    setLoading(false);
                    return;
                }

                const response = await api.get(endpoints.vendorDashboard, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (response.data?.success && response.data.data) {
                    setDashboardData(response.data.data);
                } else {
                    setError(response.data?.message || t('failed_to_fetch_data') || "Failed to fetch data");
                }
            } catch (error: any) {
                console.error('Error fetching vendor dashboard:', error);
                setError(error.message || t('something_went_wrong') || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchVendorDashboard();
    }, [t]); // Add t as dependency since it's used in the useEffect

    const retryFetch = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                setError(t('authentication_required') || "Authentication required");
                setLoading(false);
                return;
            }

            const response = await api.get(endpoints.vendorDashboard, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.data?.success && response.data.data) {
                setDashboardData(response.data.data);
            } else {
                setError(response.data?.message || t('failed_to_fetch_data') || "Failed to fetch data");
            }
        } catch (error: any) {
            console.error('Error fetching vendor dashboard:', error);
            setError(error.message || t('something_went_wrong') || "Something went wrong");
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

    return (
        <View className="bg-orange-50/40 -mt-6 mb-4 py-6">
            {/* Business Header */}
            <View className="text-left mb-4 px-4">
                <Text className="text-lg font-bold text-black text-center">
                    {dashboardData?.business_name}
                </Text>
                <Text className="text-sm text-gray-600 text-center mt-1">
                    {t('welcome_back') || "Welcome back"}
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

            {/* Core Metrics */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
            >
                {/* Revenue */}
                <MetricCard
                    label="Revenue"
                    value={`₦${parseInt(dashboardData?.total_revenue || "0").toLocaleString()}`}
                    icon="wallet"
                    sideColor="#EC6625"
                />

                {/* Sales */}
                <MetricCard
                    label="Sales"
                    value={dashboardData?.total_sales?.toString() || "0"}
                    icon="cart"
                    sideColor="#FFA500"
                />

                {/* Rating */}
                <MetricCard
                    label="Rating"
                    value={`${parseFloat(dashboardData?.rating_average || "0").toFixed(1)}/5`}
                    subValue={`${dashboardData?.rating_count || 0} reviews`}
                    icon="star"
                    sideColor="#FFD700"
                />
                {/* Commission */}
                <MetricCard
                    label="Commission"
                    value={`${dashboardData?.commission_rate || "0"}%`}
                    icon="wallet-outline" // Money/earnings theme
                    sideColor="#6B8E23"
                />
            </ScrollView>
        </View>
    );
}