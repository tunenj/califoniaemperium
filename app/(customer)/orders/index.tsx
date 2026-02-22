// app/(customer)/orders/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useCheckout } from '@/context/CheckoutContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

interface Order {
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
}

interface OrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

export default function ActiveOrdersScreen() {
  const router = useRouter();
  const { hasActiveOrder, currentOrder } = useCheckout();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  const fetchOrders = async () => {
    try {
      const response = await api.get<OrdersResponse>(endpoints.getOrder);
      
      if (response.data && Array.isArray(response.data.results)) {
        // Filter only active orders (pending, processing, shipped)
        const activeOrders = response.data.results.filter(order => 
          ['pending', 'processing', 'shipped'].includes(order.status.toLowerCase())
        );
        setOrders(activeOrders);
        
        // Count history orders for badge
        const historyOrders = response.data.results.filter(order => 
          ['completed', 'cancelled', 'delivered', 'refunded'].includes(order.status.toLowerCase())
        );
        setHistoryCount(historyOrders.length);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  // Updated formatPrice to Euro
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return `€${numPrice.toFixed(2)}`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#dc2626" />
        <Text className="mt-4 text-gray-600">Loading your orders...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen 
        options={{
          title: 'My Orders',
          headerBackTitle: 'Back',
          headerRight: () => (
            <View className="flex-row">
              <TouchableOpacity 
                onPress={() => router.push('/(customer)/orders/history')} 
                className="mr-4 relative"
              >
                <Feather name="clock" size={22} color="#4b5563" />
                {historyCount > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                    <Text className="text-white text-xs font-bold">{historyCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={onRefresh}>
                <Feather name="refresh-cw" size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Active Order Banner - Shows if there's a pending order from context */}
      {hasActiveOrder && currentOrder && (
        <TouchableOpacity
          onPress={() => router.push({
            pathname: '/(customer)/orders/[id]',
            params: { id: currentOrder.id }
          })}
          className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              <Text className="text-blue-700 font-medium">Active Order</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#3b82f6" />
          </View>
          <Text className="text-blue-900 font-semibold text-lg mt-2">
            #{currentOrder.order_number}
          </Text>
          <Text className="text-blue-600 text-sm mt-1">
            Total: {formatPrice(currentOrder.total)}
          </Text>
          {currentOrder.payment_status === 'pending' && (
            <View className="mt-2 pt-2 border-t border-blue-200">
              <Text className="text-orange-600 text-xs font-medium">
                ⚠️ Payment pending - Tap to complete
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with count */}
        <View className="flex-row justify-between items-center mt-12 mb-2">
          <Text className="text-lg font-semibold text-gray-900">
            Active Orders ({orders.length})
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/(customer)/orders/history')}
            className="flex-row items-center"
          >
            <Text className="text-blue-600 mr-1">View History</Text>
            <Feather name="chevron-right" size={16} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          <View className="py-12 items-center">
            <Ionicons name="bag-check-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg mt-4">No active orders</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              When you place an order, it will appear here
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(customer)/explore')}
              className="mt-6 bg-red-600 px-8 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => router.push({
                pathname: '/(customer)/orders/[id]',
                params: { id: order.id }
              })}
              className="bg-white border border-gray-200 rounded-xl p-4 mt-4"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">#{order.order_number}</Text>
                  <Text className="text-gray-500 text-xs mt-1">{order.customer_email}</Text>
                </View>
                <Text className="text-gray-500 text-xs">{formatDate(order.created_at)}</Text>
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <View className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  <Text className="text-xs font-medium capitalize">{order.status}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                  <Text className="text-xs font-medium capitalize">{order.payment_status}</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-500 text-xs">{order.items_count} {order.items_count === 1 ? 'item' : 'items'}</Text>
                </View>
                <Text className="text-lg font-bold text-red-600">
                  {formatPrice(order.total)}
                </Text>
              </View>

              {order.payment_status === 'pending' && (
                <View className="mt-3 pt-3 border-t border-gray-100">
                  <Text className="text-orange-600 text-xs font-medium">
                    ⚠️ Payment pending - Tap to complete
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
        
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}