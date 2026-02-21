import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from "expo-router";
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types based on the API response
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "completed";

type ApiOrder = {
  id: string;
  order_number: string;
  customer: string;
  customer_email: string;
  status: string;
  payment_status: string;
  total: string;
  items_count: number;
  created_at: string;
  paid_at: string | null;
};

type ApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiOrder[];
};

// Helper function to format price in euros
const formatPrice = (price: string) => {
  const numPrice = parseFloat(price);
  return `€${numPrice.toFixed(2)}`;
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Map API status to UI status for styling
const mapApiStatusToUI = (apiStatus: string): string => {
  const status = apiStatus.toLowerCase();
  if (status === 'delivered' || status === 'completed') return 'Delivered';
  if (status === 'shipped') return 'Shipped';
  if (status === 'processing') return 'Processed';
  if (status === 'cancelled') return 'Cancelled';
  return 'Pending';
};

const RecentOrders = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('accessToken');
      
      const response = await api.get<ApiResponse>(endpoints.getOrder, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.data) {
        // Get the 5 most recent orders
        const recentOrders = response.data.results.slice(0, 5);
        setOrders(recentOrders);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Navigate to all orders
  const handleViewAll = () => {
    router.push('/(admin)/orders');
  };

  // Status styles mapping
  const statusStyles: Record<string, { bg: string; text: string }> = {
    Delivered: {
      bg: "bg-green-100",
      text: "text-green-600",
    },
    Shipped: {
      bg: "bg-purple-100",
      text: "text-purple-600",
    },
    Processed: {
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    Pending: {
      bg: "bg-orange-100",
      text: "text-orange-500",
    },
    Cancelled: {
      bg: "bg-red-100",
      text: "text-red-600",
    },
  };

  if (loading) {
    return (
      <View className="px-4 mt-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900">
            {t('recent_orders')}
          </Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text className="text-red-500 text-sm font-medium">
              {t('view_all') || 'View All'}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-2xl border border-[#F8B4B4] p-8 items-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="mt-2 text-gray-500">{t('loading_orders') || 'Loading orders...'}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="px-4 mt-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900">
            {t('recent_orders')}
          </Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text className="text-red-500 text-sm font-medium">
              {t('view_all') || 'View All'}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-2xl border border-[#F8B4B4] p-8 items-center">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View className="px-4 mt-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900">
            {t('recent_orders')}
          </Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text className="text-red-500 text-sm font-medium">
              {t('view_all') || 'View All'}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-2xl border border-[#F8B4B4] p-8 items-center">
          <Text className="text-gray-500 text-center">{t('no_orders_found') || 'No orders found'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mt-6">
      {/* Header with Title and View All button */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          {t('recent_orders')}
        </Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text className="text-red-500 text-sm font-medium">
            {t('view_all') || 'View All'} →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View className="bg-white rounded-2xl border border-[#F8B4B4] overflow-hidden">
        {/* Header */}
        <View className="flex-row bg-[#FDECEF] px-4 py-3">
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            {t('order_number')}
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            {t('customer')}
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            {t('total')}
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            {t('status')}
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            {t('date')}
          </Text>
        </View>

        {/* Rows */}
        {orders.map((order) => {
          const uiStatus = mapApiStatusToUI(order.status);
          const status = statusStyles[uiStatus] || statusStyles.Pending;

          return (
            <View
              key={order.id}
              className="flex-row items-center px-4 py-3 border-t border-gray-100"
            >
              <Text className="flex-1 text-xs text-gray-700">
                {order.order_number}
              </Text>

              <Text className="flex-1 text-xs text-gray-700" numberOfLines={1}>
                {order.customer_email.split('@')[0]}
              </Text>

              <Text className="flex-1 text-xs font-semibold text-gray-900">
                {formatPrice(order.total)}
              </Text>

              <View className="flex-1">
                <View
                  className={`self-start px-2 py-1 rounded-full ${status.bg}`}
                >
                  <Text className={`text-xs font-medium ${status.text}`}>
                    {t(order.status.toLowerCase()) || uiStatus}
                  </Text>
                </View>
              </View>

              <Text className="flex-1 text-xs text-gray-600">
                {formatDate(order.created_at)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default RecentOrders;