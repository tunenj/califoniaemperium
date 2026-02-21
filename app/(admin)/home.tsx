import React, { useEffect, useState } from "react";
import { ScrollView, View, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from '@/context/LanguageContext';
import MetricsCarousel from "@/components/admin/matricCarousel";
import RecentOrders from "@/components/admin/RecentOrders";
// import LowStockAlert from "@/components/vendor/LowStockAlert/LowStockAlert";
import StatCard, { StatCardProps } from "@/components/admin/StatsCards";
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

const HomeScreen = () => {
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FDECEF] justify-center items-center">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="mt-2 text-gray-600">{t('loading') || 'Loading...'}</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#FDECEF] justify-center items-center">
        <Text className="text-red-500 text-center px-4">{error}</Text>
      </SafeAreaView>
    );
  }

  // Define card configurations - only active vendor, total customers, and cancelled orders
  const statCards: Omit<StatCardProps, 'count'>[] = [
    {
      icon: "storefront-outline",
      title: "active_vendors",
      subtitle: `total_vendors: ${stats?.total_vendors || 0}`,
      color: "#3B82F6" // blue
    },
    {
      icon: "people-outline",
      title: "total_customers",
      subtitle: "registered_users",
      color: "#10B981" // green
    },
    {
      icon: "alert-circle-outline",
      title: "cancelled_orders",
      subtitle: "need_attention",
      color: "#EF4444" // red
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#FDECEF]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 4 }}
      >
        {/* Top metrics - this already uses the stats internally */}
        <MetricsCarousel />

        {/* Single row of StatCards with only active vendor, total customers, and cancelled orders */}
        <View className="flex-row gap-2 px-4">
          <StatCard
            {...statCards[0]}
            count={stats?.active_vendors || 0}
          />
          <StatCard
            {...statCards[1]}
            count={stats?.total_customers || 0}
          />
          <StatCard
            {...statCards[2]}
            count={stats?.cancelled_orders || 0}
          />
        </View>

        {/* Other sections */}
        <RecentOrders />
        {/* <LowStockAlert /> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;