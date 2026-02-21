// app/(customer)/orders/[id].tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useStripe, StripeProvider } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { useCheckout } from '@/context/CheckoutContext';
import stripePaymentService from '@/service/stripePaymentService';

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: string;
  shipping_cost: string;
  discount: string;
  total: string;
  created_at: string;
  paid_at: string | null;
  can_cancel: boolean;
  shipping_address: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  vendor: string | null;
}

interface OrderListItem {
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

interface OrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderListItem[];
}

// Helper function to format price in euros
const formatPrice = (price: number): string => {
  if (isNaN(price)) return "€0.00";
  return `€${price.toFixed(2)}`;
};

// ─── Payment Sheet Form (must be inside StripeProvider) ───────────────────────
const PaymentSheetForm = ({
  orderId,
  orderNumber,
  amount,
  onSuccess,
  onError,
  onClose,
}: {
  orderId: string;
  orderNumber: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    try {
      const paymentIntent = await stripePaymentService.createPaymentIntent(orderId);

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: paymentIntent.client_secret,
        merchantDisplayName: 'Stock',
        returnURL: 'califoniaemperium://stripe-redirect',
      });

      if (initError) {
        onError(initError.message);
        setProcessing(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          onError(presentError.message);
        }
      } else {
        await stripePaymentService.confirmPayment(paymentIntent.payment_intent_id);
        onSuccess(paymentIntent.payment_intent_id);
      }
    } catch (err: any) {
      onError(err?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View>
      <View className="bg-gray-50 p-4 rounded-xl mb-6">
        <Text className="text-gray-500 text-sm mb-1">Order #{orderNumber}</Text>
        <Text className="text-3xl font-bold text-gray-900">
          {formatPrice(amount)}
        </Text>
      </View>

      <View className="flex-row justify-around mb-6 py-3 border border-gray-100 rounded-xl bg-gray-50">
        <View className="flex-row items-center">
          <MaterialIcons name="lock" size={14} color="#10B981" />
          <Text className="text-gray-500 text-xs ml-1">SSL</Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons name="security" size={14} color="#10B981" />
          <Text className="text-gray-500 text-xs ml-1">PCI DSS</Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons name="verified" size={14} color="#10B981" />
          <Text className="text-gray-500 text-xs ml-1">3D Secure</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handlePay}
        disabled={processing}
        className={`py-4 rounded-xl ${processing ? 'bg-gray-400' : 'bg-[#635BFF]'}`}
      >
        {processing ? (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white font-semibold text-lg ml-2">Processing...</Text>
          </View>
        ) : (
          <Text className="text-white font-semibold text-lg text-center">
            Pay {formatPrice(amount)}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onClose}
        disabled={processing}
        className="mt-3 py-3"
      >
        <Text className="text-gray-400 text-center text-sm">Cancel</Text>
      </TouchableOpacity>

      <Text className="text-center text-gray-400 text-xs mt-4">
        Powered by Stripe · Your payment is secure
      </Text>
    </View>
  );
};

// ─── Stripe Payment Modal ─────────────────────────────────────────────────────
const StripePaymentModal = ({
  visible,
  onClose,
  onSuccess,
  onError,
  orderId,
  orderNumber,
  amount,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  orderId: string;
  orderNumber: string;
  amount: number;
}) => {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);

  const stableOnClose = useCallback(onClose, [onClose]);

  useEffect(() => {
    if (visible && orderId) {
      setKeyLoading(true);
      setPublishableKey(null);
      stripePaymentService
        .getStripeConfig()
        .then(key => setPublishableKey(key))
        .catch(() => {
          Alert.alert('Error', 'Failed to initialize payment system. Please try again.');
          stableOnClose();
        })
        .finally(() => setKeyLoading(false));
    }
  }, [visible, orderId, stableOnClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 min-h-[440px]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Complete Payment</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
            >
              <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {keyLoading || !publishableKey ? (
            <View className="flex-1 items-center justify-center py-12">
              <ActivityIndicator size="large" color="#635BFF" />
              <Text className="text-gray-500 mt-3 text-sm">Initializing payment...</Text>
            </View>
          ) : (
            <StripeProvider
              publishableKey={publishableKey}
              merchantIdentifier="merchant.com.califoniaemperium"
              urlScheme="califoniaemperium"
            >
              <PaymentSheetForm
                orderId={orderId}
                orderNumber={orderNumber}
                amount={amount}
                onSuccess={onSuccess}
                onError={onError}
                onClose={onClose}
              />
            </StripeProvider>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Order Details Screen ────────────────────────────────────────────────
export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();


  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(null);

  // Resolve the correct order ID:
  // 1. Use param ID if available
  // 2. Otherwise fetch order list and filter by logged-in customer email
  const resolveOrderId = useCallback(async (): Promise<string | null> => {
    // Use param ID directly if it exists
    const paramId = params.id as string | undefined;
    if (paramId && paramId.trim() !== '') {
      console.log('Using param order ID:', paramId);
      return paramId;
    }

    // No param ID — fetch list and find current customer's most recent order
    console.log('No param ID, fetching order list...');
    try {
      const customerEmail = await AsyncStorage.getItem('userEmail');
      console.log('Logged in customer email:', customerEmail);

      const response = await api.get<OrderListResponse>(endpoints.listOrder);
      const results: OrderListItem[] = response.data?.results || [];

      if (results.length === 0) {
        console.log('No orders found');
        return null;
      }

      let myOrders = results;

      // Filter by logged-in customer email if available
      if (customerEmail) {
        const filtered = results.filter(
          o => o.customer_email.toLowerCase() === customerEmail.toLowerCase()
        );
        if (filtered.length > 0) {
          myOrders = filtered;
        }
      }

      // Sort by created_at descending — most recent first
      myOrders.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const mostRecent = myOrders[0];
      console.log('Resolved to order:', mostRecent.id, mostRecent.order_number);
      return mostRecent.id;
    } catch (error: any) {
      console.error('Error resolving order ID:', error?.message || error);
      return null;
    }
  }, [params.id]);

  const fetchOrderDetails = useCallback(async (orderId: string) => {
    try {
      console.log('Fetching order details for ID:', orderId);
      const response = await api.get(endpoints.orderDetails(orderId));

      if (response.data?.success) {
        setOrder(response.data.data);
      } else {
        console.error('API returned failure:', response.data?.message);
        Alert.alert('Error', response.data?.message || 'Failed to load order details');
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error?.message || error);
      Alert.alert('Error', 'Failed to load order. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: resolve ID then fetch details
  useEffect(() => {
    const init = async () => {
      const orderId = await resolveOrderId();
      if (orderId) {
        setResolvedOrderId(orderId);
        await fetchOrderDetails(orderId);
      } else {
        console.error('Could not resolve any order ID');
        setLoading(false);
      }
    };
    init();
  }, [resolveOrderId, fetchOrderDetails]);

  const handleRefresh = useCallback(async () => {
    if (resolvedOrderId) {
      setLoading(true);
      await fetchOrderDetails(resolvedOrderId);
    }
  }, [resolvedOrderId, fetchOrderDetails]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#dc2626" />
        <Text className="text-gray-400 mt-2 text-sm">Loading order...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
        <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
        <Text className="text-gray-500 mt-4 text-base">Order not found</Text>
        <TouchableOpacity
          onPress={handleGoBack}
          className="mt-4 px-6 py-3 bg-red-500 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: `Order #${order.order_number}`,
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack} className="ml-2">
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1 px-4">
        {/* Status Card */}
        <View className="bg-gray-50 rounded-xl p-4 mt-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600">Order Status</Text>
            <View
              className={`px-3 py-1 rounded-full ${
                order.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  order.status === 'completed' ? 'text-green-700' : 'text-orange-700'
                }`}
              >
                {order.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Payment Status</Text>
            <View
              className={`px-3 py-1 rounded-full ${
                order.payment_status === 'paid' ? 'bg-green-100' : 'bg-yellow-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  order.payment_status === 'paid' ? 'text-green-700' : 'text-yellow-700'
                }`}
              >
                {order.payment_status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
          <Text className="font-bold text-gray-900 mb-3">Order Summary</Text>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900">
                {formatPrice(parseFloat(order.subtotal))}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Shipping</Text>
              <Text className="text-gray-900">
                {formatPrice(parseFloat(order.shipping_cost))}
              </Text>
            </View>

            {parseFloat(order.discount) > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-green-600">Discount</Text>
                <Text className="text-green-600">
                  -{formatPrice(parseFloat(order.discount))}
                </Text>
              </View>
            )}

            <View className="h-px bg-gray-200 my-2" />

            <View className="flex-row justify-between">
              <Text className="font-bold text-gray-900">Total</Text>
              <Text className="font-bold text-red-600 text-xl">
                {formatPrice(parseFloat(order.total))}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
          <Text className="font-bold text-gray-900 mb-3">
            Items ({order.items.length})
          </Text>

          {order.items.map((item, index) => (
            <View
              key={item.id}
              className={`py-3 ${
                index < order.items.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="flex-row justify-between">
                <View className="flex-1 mr-3">
                  <Text className="font-medium text-gray-900" numberOfLines={2}>
                    {item.product_name}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    SKU: {item.product_sku}
                  </Text>
                  <Text className="text-gray-500 text-xs">Qty: {item.quantity}</Text>
                </View>
                <View className="items-end">
                  <Text className="font-semibold text-gray-900">
                    {formatPrice(parseFloat(item.total_price))}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {formatPrice(parseFloat(item.unit_price))} each
                  </Text>
                </View>
              </View>
              {item.vendor && (
                <Text className="text-gray-500 text-xs mt-2">
                  Sold by: {item.vendor}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}