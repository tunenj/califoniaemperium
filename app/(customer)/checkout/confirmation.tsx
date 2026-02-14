// app/(customer)/checkout/confirmation.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  SafeAreaView 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCheckout } from '@/context/CheckoutContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

// Type for order details
interface OrderDetails {
  id: string;
  order_number: string;
  customer: string;
  customer_email: string;
  status: string;
  payment_status: string;
  total: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string;
  payment_reference: string;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

const OrderConfirmation = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { clearCart } = useCheckout();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.orderId as string;
  const orderNumber = params.orderNumber as string;
  const paymentReference = params.paymentReference as string;
  const total = params.total as string;
  const paymentMethod = params.paymentMethod as string;

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: OrderDetails }>(
        `${endpoints.orderDetails}/${orderId}`
      );
      
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError('Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Unable to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'paystack':
        return 'Paystack';
      case 'card':
        return 'Credit/Debit Card';
      case 'cash':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-orange-500 bg-orange-50';
      case 'processing':
        return 'text-blue-500 bg-blue-50';
      case 'completed':
        return 'text-green-500 bg-green-50';
      case 'cancelled':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-500 bg-green-50';
      case 'pending':
        return 'text-orange-500 bg-orange-50';
      case 'failed':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const handleContinueShopping = () => {
    clearCart();
    router.replace('/(customer)/explore');
  };

  const handleViewOrder = () => {
    router.push({
      pathname: '/(customer)/orders/[id]',
      params: { id: orderId }
    });
  };

  const handleTrackOrder = () => {
    router.push({
      pathname: '/(customer)/orders/tracking',
      params: { orderId }
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Stack.Screen 
          options={{
            title: 'Order Confirmation',
            headerBackTitle: 'Back'
          }}
        />
        <View className="flex-1 justify-center items-center p-8">
          <ActivityIndicator size="large" color="#dc2626" />
          <Text className="mt-4 text-gray-600 text-lg">Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Stack.Screen 
          options={{
            title: 'Order Confirmation',
            headerBackTitle: 'Back'
          }}
        />
        <View className="flex-1 justify-center items-center p-8">
          <Ionicons name="alert-circle-outline" size={72} color="#ef4444" />
          <Text className="mt-4 text-2xl font-bold text-gray-800">Oops!</Text>
          <Text className="mt-2 text-gray-600 text-center text-lg">{error || 'Order not found'}</Text>
          <TouchableOpacity
            className="mt-8 bg-red-600 rounded-xl px-6 py-4 w-full"
            onPress={handleContinueShopping}
          >
            <Text className="text-white font-semibold text-lg text-center">Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          title: 'Order Confirmation',
          headerBackTitle: 'Back'
        }}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Success Header */}
        <View className="items-center py-8 px-6 bg-white">
          <View className="mb-4">
            <Ionicons name="checkmark-circle" size={72} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</Text>
          <Text className="text-gray-600 text-center text-base">
            Thank you for your purchase. Weve received your order #{order.order_number}.
          </Text>
        </View>

        {/* Order Summary Card */}
        <View className="mx-4 mb-4 bg-white rounded-xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Order Summary</Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600 text-sm">Order Number:</Text>
            <Text className="text-gray-900 font-medium">{order.order_number}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600 text-sm">Order Date:</Text>
            <Text className="text-gray-900 font-medium">{formatDate(order.created_at)}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600 text-sm">Status:</Text>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
              <Text className="text-xs font-semibold">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
          
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-600 text-sm">Payment:</Text>
            <View className={`px-3 py-1 rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
              <Text className="text-xs font-semibold">
                {order.payment_status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View className="border-t border-gray-200 my-4" />
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-700 font-medium">Total Amount:</Text>
            <Text className="text-2xl font-bold text-red-600">₦{parseFloat(order.total).toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Details Card */}
        <View className="mx-4 mb-4 bg-white rounded-xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Payment Details</Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600 text-sm">Payment Method:</Text>
            <Text className="text-gray-900 font-medium">{getPaymentMethodText(order.payment_method)}</Text>
          </View>
          
          {order.payment_reference && (
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 text-sm">Reference:</Text>
              <Text className="text-gray-900 font-medium text-xs">{order.payment_reference}</Text>
            </View>
          )}
        </View>

        {/* Shipping Details Card */}
        <View className="mx-4 mb-4 bg-white rounded-xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Shipping Details</Text>
          
          <View className="space-y-1">
            <Text className="text-gray-900 font-medium text-base">
              {order.shipping_first_name} {order.shipping_last_name}
            </Text>
            <Text className="text-gray-600 text-sm">{order.shipping_phone}</Text>
            <Text className="text-gray-600 text-sm">{order.shipping_address_line1}</Text>
            {order.shipping_address_line2 && (
              <Text className="text-gray-600 text-sm">{order.shipping_address_line2}</Text>
            )}
            <Text className="text-gray-600 text-sm">
              {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
            </Text>
            <Text className="text-gray-600 text-sm">{order.shipping_country}</Text>
          </View>
        </View>

        {/* Order Items Card */}
        <View className="mx-4 mb-4 bg-white rounded-xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Order Items</Text>
          
          {order.order_items?.map((item, index) => (
            <View 
              key={item.id} 
              className={`flex-row justify-between items-start py-3 ${
                index < order.order_items.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="flex-1 mr-3">
                <Text className="text-gray-900 font-medium text-sm mb-1" numberOfLines={2}>
                  {item.product_name}
                </Text>
                <Text className="text-gray-500 text-xs">Qty: {item.quantity}</Text>
              </View>
              <Text className="text-gray-900 font-semibold text-sm">
                ₦{parseFloat(item.subtotal).toLocaleString()}
              </Text>
            </View>
          ))}
          
          <View className="border-t border-gray-200 mt-4 pt-4" />
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-900 font-semibold text-base">Total:</Text>
            <Text className="text-xl font-bold text-red-600">₦{parseFloat(order.total).toLocaleString()}</Text>
          </View>
        </View>

        {/* Help Section */}
        <View className="mx-4 mb-8 bg-white rounded-xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Need Help?</Text>
          <Text className="text-gray-600 text-sm mb-4">
            If you have any questions about your order, please contact our customer support.
          </Text>
          <View className="flex-row items-center mb-3">
            <Ionicons name="mail-outline" size={18} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-2">support@yourstore.com</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="call-outline" size={18} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-2">+234 800 000 0000</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <TouchableOpacity
          className="mb-3 border border-gray-300 rounded-xl py-4 items-center bg-white"
          onPress={handleContinueShopping}
        >
          <Text className="text-gray-800 font-semibold text-base">Continue Shopping</Text>
        </TouchableOpacity>
        
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 border border-gray-300 rounded-xl py-4 items-center bg-white"
            onPress={handleTrackOrder}
          >
            <Text className="text-gray-800 font-semibold text-base">Track Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 bg-red-600 rounded-xl py-4 items-center"
            onPress={handleViewOrder}
          >
            <Text className="text-white font-semibold text-base">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrderConfirmation;