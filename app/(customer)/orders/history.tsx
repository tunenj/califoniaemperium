// app/(customer)/orders/history.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import StripePaymentModal from '@/components/checkout/StripePaymentModal'; // ✅ Use external component

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

interface PaymentModalState {
  visible: boolean;
  orderId: string;
  orderNumber: string;
  amount: number;
}

export default function OrderHistoryScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({
    visible: false,
    orderId: '',
    orderNumber: '',
    amount: 0,
  });

  const fetchOrders = async () => {
    try {
      const response = await api.get<OrdersResponse>(endpoints.getOrder);
      if (response.data && Array.isArray(response.data.results)) {
        const historyOrders = response.data.results.filter(order =>
          ['completed', 'cancelled', 'delivered', 'refunded'].includes(
            order.status.toLowerCase()
          )
        );
        setOrders(historyOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders. Pull down to refresh.');
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

  const handleCompletePayment = (order: Order) => {
    setPaymentModal({
      visible: true,
      orderId: order.id,
      orderNumber: order.order_number,
      amount: parseFloat(order.total),
    });
  };

  const handlePaymentSuccess = () => {
    const paidOrderNumber = paymentModal.orderNumber;
    setPaymentModal(prev => ({ ...prev, visible: false }));
    Alert.alert(
      'Payment Successful 🎉',
      `Order #${paidOrderNumber} has been paid successfully.`,
      [{ text: 'OK', onPress: fetchOrders }]
    );
  };

  const handlePaymentError = (error: string) => {
    Alert.alert('Payment Failed', error || 'An error occurred. Please try again.');
  };

  const handleViewOrder = (orderId: string) => {
    try {
      router.push({
        pathname: '/(customer)/orders/[id]',
        params: { id: orderId },
      });
    } catch {
      // route doesn't exist yet — silently ignore
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'refunded':
        return 'bg-purple-100 text-purple-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
        <Text className="mt-4 text-gray-600">Loading order history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-10">
      <Stack.Screen
        options={{
          title: 'Order History',
          headerBackTitle: 'Back',
          headerRight: () => (
            <TouchableOpacity onPress={onRefresh} className="mr-4">
              <Feather name="refresh-cw" size={20} color="#4b5563" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length === 0 ? (
          <View className="py-12 items-center">
            <Ionicons name="time-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg mt-4">No order history</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              When you complete orders, they will appear here
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(customer)/explore')}
              className="mt-6 bg-red-600 px-8 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map(order => (
            <View
              key={order.id}
              className="bg-white border border-gray-200 rounded-xl p-4 mt-4"
            >
              {/* Navigation TouchableOpacity */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleViewOrder(order.id)}
              >
                {/* Order Number + Date */}
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">
                      #{order.order_number}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      {order.customer_email}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-xs">
                    {formatDate(order.created_at)}
                  </Text>
                </View>

                {/* Status Badges */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    <Text className="text-xs font-medium capitalize">
                      {order.status}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                    <Text className="text-xs font-medium capitalize">
                      {order.payment_status}
                    </Text>
                  </View>
                </View>

                {/* Items + Total */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-500 text-xs">
                    {order.items_count}{' '}
                    {order.items_count === 1 ? 'item' : 'items'}
                  </Text>
                  <Text className="text-lg font-bold text-red-600">
                    {formatPrice(order.total)}
                  </Text>
                </View>

                {/* Paid At */}
                {order.paid_at && (
                  <Text className="text-green-600 text-xs font-medium">
                    ✅ Paid on {formatDate(order.paid_at)}
                  </Text>
                )}
              </TouchableOpacity>

              {/* ✅ Payment button - separate TouchableOpacity */}
              {order.payment_status === 'pending' &&
                order.status !== 'cancelled' && (
                  <TouchableOpacity
                    onPress={() => handleCompletePayment(order)}
                    className="mt-3 bg-[#635BFF] py-4 rounded-xl flex-row items-center justify-center"
                  >
                    <Feather name="credit-card" size={18} color="white" />
                    <Text className="text-white font-semibold text-base ml-2">
                      Complete Payment · {formatPrice(order.total)}
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          ))
        )}

        <View className="h-8" />
      </ScrollView>

      {/* ✅ Use external StripePaymentModal - no more inline Stripe code */}
      <StripePaymentModal
        visible={paymentModal.visible}
        onClose={() => setPaymentModal(prev => ({ ...prev, visible: false }))}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        orderId={paymentModal.orderId}
        orderNumber={paymentModal.orderNumber}
        amount={paymentModal.amount}
      />
    </SafeAreaView>
  );
}