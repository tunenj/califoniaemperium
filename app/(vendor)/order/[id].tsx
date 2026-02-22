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
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useStripe, StripeProvider } from '@stripe/stripe-react-native';
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

const formatPrice = (price: number): string => {
  if (isNaN(price)) return '€0.00';
  return `€${price.toFixed(2)}`;
};

// ─── Web Payment Fallback ─────────────────────────────────────────────────────
const WebPaymentForm = ({
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
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    try {
      const paymentIntent = await stripePaymentService.createPaymentIntent(orderId);
      // On web, redirect to Stripe Checkout or use Stripe.js
      // For now, confirm directly if your backend handles it
      await stripePaymentService.confirmPayment(paymentIntent.payment_intent_id);
      onSuccess(paymentIntent.payment_intent_id);
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
        <Text className="text-3xl font-bold text-gray-900">{formatPrice(amount)}</Text>
      </View>

      <View className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-6">
        <Text className="text-yellow-800 text-sm text-center">
          You&apos;re on the web version. Payment will be processed securely.
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

      <TouchableOpacity onPress={onClose} disabled={processing} className="mt-3 py-3">
        <Text className="text-gray-400 text-center text-sm">Cancel</Text>
      </TouchableOpacity>

      <Text className="text-center text-gray-400 text-xs mt-4">
        Powered by Stripe · Your payment is secure
      </Text>
    </View>
  );
};

// ─── Native Payment Sheet Form (mobile only) ──────────────────────────────────
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
        <Text className="text-3xl font-bold text-gray-900">{formatPrice(amount)}</Text>
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

      <TouchableOpacity onPress={onClose} disabled={processing} className="mt-3 py-3">
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

  const isWeb = Platform.OS === 'web';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 min-h-[440px]">
          {/* Modal Header */}
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
          ) : isWeb ? (
            // ── Web: use plain form, no native Stripe SDK ──
            <WebPaymentForm
              orderId={orderId}
              orderNumber={orderNumber}
              amount={amount}
              onSuccess={onSuccess}
              onError={onError}
              onClose={onClose}
            />
          ) : (
            // ── Native: use Stripe payment sheet ──
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
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { refreshCurrentOrder } = useCheckout();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const response = await api.get(endpoints.orderDetails(id as string));
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch {
      console.error('Error fetching order:');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handlePayNow = () => {
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentModalVisible(false);
    Alert.alert(
      'Payment Successful 🎉',
      `Order #${order?.order_number} has been paid successfully.`,
      [{ text: 'OK', onPress: fetchOrderDetails }]
    );
  };

  const handlePaymentError = (error: string) => {
    Alert.alert('Payment Failed', error || 'An error occurred. Please try again.');
  };

  const handleCancelOrder = async () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setProcessing(true);
          try {
            await api.post(endpoints.cancelOrder(id as string));
            await fetchOrderDetails();
            await refreshCurrentOrder();
            Alert.alert('Success', 'Order cancelled successfully');
          } catch {
            Alert.alert('Error', 'Failed to cancel order');
          } finally {
            setProcessing(false);
          }
        },
      },
    ]);
  };

  const handleReorder = () => {
    router.push('/(customer)/cart');
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#dc2626" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Order not found</Text>
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
              <Text className="text-gray-900">{formatPrice(parseFloat(order.subtotal))}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Shipping</Text>
              <Text className="text-gray-900">{formatPrice(parseFloat(order.shipping_cost))}</Text>
            </View>

            {parseFloat(order.discount) > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-green-600">Discount</Text>
                <Text className="text-green-600">-{formatPrice(parseFloat(order.discount))}</Text>
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
          <Text className="font-bold text-gray-900 mb-3">Items ({order.items.length})</Text>

          {order.items.map((item, index) => (
            <View
              key={item.id}
              className={`py-3 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <View className="flex-row justify-between">
                <View className="flex-1 mr-3">
                  <Text className="font-medium text-gray-900" numberOfLines={2}>
                    {item.product_name}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">SKU: {item.product_sku}</Text>
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
                <Text className="text-gray-500 text-xs mt-2">Sold by: {item.vendor}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View className="space-y-3 mt-6 mb-8">
          {order.payment_status === 'pending' && (
            <TouchableOpacity
              onPress={handlePayNow}
              className="bg-darkRed py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-lg">
                Complete Payment · {formatPrice(parseFloat(order.total))}
              </Text>
            </TouchableOpacity>
          )}

          {order.can_cancel && (
            <TouchableOpacity
              onPress={handleCancelOrder}
              disabled={processing}
              className="border border-red-600 py-4 rounded-xl items-center mt-4"
            >
              {processing ? (
                <ActivityIndicator color="#dc2626" />
              ) : (
                <Text className="text-red-600 font-semibold text-lg">Cancel Order</Text>
              )}
            </TouchableOpacity>
          )}

          {order.status === 'completed' && (
            <TouchableOpacity
              onPress={handleReorder}
              className="bg-gray-900 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-lg">Reorder</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Stripe Payment Modal */}
      {order && (
        <StripePaymentModal
          visible={paymentModalVisible}
          onClose={() => setPaymentModalVisible(false)}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          orderId={order.id}
          orderNumber={order.order_number}
          amount={parseFloat(order.total)}
        />
      )}
    </SafeAreaView>
  );
}