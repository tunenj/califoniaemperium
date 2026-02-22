import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { OrderCard } from "../OrderCard/OrderCard";
import { useLanguage } from "@/context/LanguageContext";
import React, { useEffect, useState } from "react";
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";

// Define types based on the API response
type Order = {
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
  results: Order[];
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

export default function RecentOrders() {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('accessToken');
      
      const response = await api.get<ApiResponse>(endpoints.listOrder, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.data) {
        // Get only the most recent 3 orders for display
        const recentOrders = response.data.results.slice(0, 3);
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

  // Navigate to all orders page
  const handleViewAll = () => {
    router.push("/(vendor)/orders"); // Adjust this path to match your orders page route
  };

  // Capitalize first letter of status
  const capitalizeStatus = (status: string): "Pending" | "Processing" | "Delivered" | "Cancelled" | "Completed" => {
    const capitalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    // Map API status to our allowed status types
    if (capitalized === 'Pending') return 'Pending';
    if (capitalized === 'Processing') return 'Processing';
    if (capitalized === 'Delivered') return 'Delivered';
    if (capitalized === 'Cancelled') return 'Cancelled';
    if (capitalized === 'Completed') return 'Completed';
    
    // Default to Pending if unknown
    return 'Pending';
  };

  if (loading) {
    return (
      <View className="mt-6 px-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-semibold text-gray-800">
            {t("recent_orders") || "Recent Orders"}
          </Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text className="text-[#C62828] text-sm font-medium">
              {t("view_all") || "View All"}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="items-center py-8 bg-white rounded-xl border border-orange-300">
          <ActivityIndicator size="large" color="#C62828" />
          <Text className="text-gray-500 mt-2 text-sm">
            {t("loading_orders") || "Loading orders..."}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mt-6 px-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-semibold text-gray-800">
            {t("recent_orders") || "Recent Orders"}
          </Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text className="text-[#C62828] text-sm font-medium">
              {t("view_all") || "View All"}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="items-center py-8 bg-white rounded-xl border border-orange-300">
          <Text className="text-red-500 text-center">{error}</Text>
          <TouchableOpacity 
            onPress={fetchOrders}
            className="mt-4 px-4 py-2 bg-red-500 rounded-lg"
          >
            <Text className="text-white font-medium">{t("retry") || "Retry"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View className="mt-6 px-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-semibold text-gray-800">
            {t("recent_orders") || "Recent Orders"}
          </Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text className="text-[#C62828] text-sm font-medium">
              {t("view_all") || "View All"}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="items-center py-8 bg-white rounded-xl border border-orange-300">
          <Text className="text-gray-500 text-center">
            {t("no_orders_found") || "No orders found"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-6 px-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base font-semibold text-gray-800">
          {t("recent_orders") || "Recent Orders"}
        </Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text className="text-[#C62828] text-sm font-medium">
            {t("view_all") || "View All"}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View className="space-y-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            id={order.order_number}
            buyer={order.customer_email.split('@')[0] || 'Customer'}
            amount={formatPrice(order.total)}
            status={capitalizeStatus(order.status)}
            itemsCount={order.items_count}
            date={formatDate(order.created_at)}
            paymentStatus={order.payment_status}
          />
        ))}
      </View>
    </View>
  );
}