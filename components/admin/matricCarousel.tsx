import { ScrollView, View, Text, ActivityIndicator } from "react-native"; 
import { MetricCard } from "@/components/admin/MetricCard";
import { useLanguage } from '@/context/LanguageContext';
import React, { useEffect, useState } from 'react';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the type based on the API response
type AdminStats = {
    total_revenue: string;
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    total_customers: number;
    total_vendors: number;
    active_vendors: number;
    total_products: number;
    active_products: number;
    pending_payouts: string;
    total_commissions: string;
    new_customers_this_month: number;
    new_orders_this_month: number;
    revenue_this_month: string;
};

type ApiResponse = {
    success: boolean;
    message: string;
    data: AdminStats;
};

// Helper function to format currency in euros
const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `€${numValue.toFixed(2)}`;
};

// Helper function to format number with commas
const formatNumber = (value: number) => {
    return value.toLocaleString('en-US');
};

export default function MetricsCarousel() {
    const { t } = useLanguage();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch admin stats
    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = await AsyncStorage.getItem('accessToken');
            
            const response = await api.get<ApiResponse>(endpoints.adminStat, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });

            if (response.data.success && response.data.data) {
                setStats(response.data.data);
            } else {
                setError('Failed to load statistics');
            }
        } catch (error: any) {
            console.error('Error fetching admin stats:', error);
            setError(error.response?.data?.message || 'Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // Calculate pending products (total - active)
    const pendingProducts = stats ? stats.total_products - stats.active_products : 0;

    if (loading) {
        return (
            <View className="bg-orange-50/40 -mt-6 mb-4 py-6">
                <View className="items-center justify-center py-8">
                    <ActivityIndicator size="large" color="#EC6625" />
                    <Text className="text-gray-600 mt-2">{t('loading_stats') || 'Loading statistics...'}</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View className="bg-orange-50/40 -mt-6 mb-4 py-6">
                <View className="items-center justify-center py-8 px-4">
                    <Text className="text-red-500 text-center">{error}</Text>
                </View>
            </View>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <View className="bg-orange-50/40 -mt-6 mb-4 py-6">
            {/* Header Text */}
            <View className="items-center justify-center mb-4 px-4">
                <Text className="text-sm text-center">
                    <Text className="font-bold text-base text-black">{t('dashboard')}</Text> {t('welcome_back_message')}
                </Text>
            </View>

            {/* Cards */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
            >
                <MetricCard 
                    label={t('total_revenue')} 
                    value={formatCurrency(stats.total_revenue)}
                    valuePrefix="" // Empty prefix since Euro symbol is included in the value
                    trend={{ 
                        value: `+${stats.revenue_this_month !== '0.00' ? ((parseFloat(stats.revenue_this_month) / (parseFloat(stats.total_revenue) || 1)) * 100).toFixed(1) : '0'}%`, 
                        positive: parseFloat(stats.revenue_this_month) > 0,
                        label: t('this_month')
                    }} 
                    icon="wallet"
                    sideColor="#EC6625"
                />
                
                <MetricCard 
                    label={t('total_orders')} 
                    value={formatNumber(stats.total_orders)}
                    subValue={`${t('pending')}: ${stats.pending_orders} | ${t('completed')}: ${stats.completed_orders}`}
                    trend={{ 
                        value: `+${stats.new_orders_this_month}`, 
                        positive: stats.new_orders_this_month > 0,
                        label: t('this_month')
                    }} 
                    icon="cart"
                    sideColor="#FFA500"
                />
                
                <MetricCard 
                    label={t('active_vendors')} 
                    value={formatNumber(stats.active_vendors)}
                    subValue={t('total_vendors', { count: stats.total_vendors })}
                    icon="people"
                    sideColor="#B8860B"
                />
                
                <MetricCard 
                    label={t('products_listed')} 
                    value={formatNumber(stats.active_products)}
                    subValue={pendingProducts > 0 ? t('x_pending_review', { count: pendingProducts }) : undefined}
                    icon="cube"
                    sideColor="#90EE90"
                />
            </ScrollView>
        </View>
    );
}