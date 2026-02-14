import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { useCheckout } from '@/context/CheckoutContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

// Define the CheckoutContextType locally since it's missing from the context
interface CheckoutContextType {
  orderItems: any[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  orderId: string | null;
  setOrderId: (id: string | null) => void;
  hasActiveOrder: boolean;
  setHasActiveOrder: (active: boolean) => void;
  currentOrder?: OrderDetail | null;
  setCurrentOrder?: (order: OrderDetail | null) => void;
}

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

interface OrderItem {
  id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  vendor: string | null;
}

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: string;
  shipping_cost: string;
  discount: string;
  total: string;
  items_count?: number;
  items: OrderItem[];
  created_at: string;
  paid_at: string | null;
  cancelled_at?: string | null;
  can_cancel: boolean;
  customer_notes?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const Row = ({ label, value, red }: { label: string; value: string; red?: boolean }) => (
  <View className="flex-row justify-between mb-2">
    <Text className={red ? 'text-red-600' : 'text-gray-700'}>{label}</Text>
    <Text className={`font-semibold ${red ? 'text-red-600' : 'text-gray-900'}`}>{value}</Text>
  </View>
);

const OrderSummarySection = () => {
  const checkout = useCheckout() as CheckoutContextType;
  
  const { 
    orderItems, 
    subtotal, 
    discount, 
    shipping, 
    total, 
    promoCode, 
    setPromoCode,
    orderId,
    setOrderId,
    hasActiveOrder,
    setHasActiveOrder,
    currentOrder,
    setCurrentOrder
  } = checkout;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(currentOrder || null);
  const [orderItemsList, setOrderItemsList] = useState<OrderItem[]>(currentOrder?.items || []);
  
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [showOrderSelector, setShowOrderSelector] = useState(false);

  // Update selected order when currentOrder changes from context
  useEffect(() => {
    if (currentOrder) {
      setSelectedOrder(currentOrder);
      setOrderItemsList(currentOrder.items || []);
    }
  }, [currentOrder]);

  // Fetch orders list when component mounts
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.listOrder);
      const ordersList = response.data.results || [];
      setOrders(ordersList);
      
      // If we have orders, set hasActiveOrder to true
      if (ordersList.length > 0) {
        setHasActiveOrder(true);
      }
      
      // If we have orders but no selected order and no currentOrder, select the first one by default
      if (ordersList.length > 0 && !orderId && !currentOrder) {
        const firstOrder = ordersList[0];
        setOrderId?.(firstOrder.id);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, setOrderId, setHasActiveOrder, currentOrder]);

  const fetchOrderDetails = useCallback(async (id: string) => {
    try {
      setLoadingDetails(true);
      const response = await api.get<ApiResponse<OrderDetail>>(endpoints.orderDetails(id));
      
      if (response.data.success && response.data.data) {
        const orderData = response.data.data;
        setSelectedOrder(orderData);
        setOrderItemsList(orderData.items || []);
        setCurrentOrder?.(orderData);
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoadingDetails(false);
    }
  }, [setCurrentOrder]);

  // Fetch orders list when component mounts
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Fetch order details when order is selected
  useEffect(() => {
    if (orderId && !currentOrder) {
      fetchOrderDetails(orderId);
    }
  }, [orderId, fetchOrderDetails, currentOrder]);

  const handleOrderSelect = useCallback((order: Order) => {
    setOrderId?.(order.id);
    setShowOrderSelector(false);
    setCurrentOrder?.(null);
  }, [setOrderId, setCurrentOrder]);

  const handleApplyPromo = useCallback(async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    if (!selectedOrder) {
      Alert.alert('Error', 'No active order found');
      return;
    }

    try {
      setApplyingPromo(true);
      // API call to apply promo code would go here
      Alert.alert('Success', 'Promo code applied successfully!');
      setPromoCode('');
      
      // Refresh order details to show updated discount
      if (orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to apply promo code'
      );
    } finally {
      setApplyingPromo(false);
    }
  }, [promoCode, selectedOrder, orderId, setPromoCode, fetchOrderDetails]);

  // ✅ Handle order cancellation
  const handleCancelOrder = useCallback(async (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingOrder(true);
              
              const response = await api.post(endpoints.cancelOrder(orderId));
              
              if (response.data.success) {
                const cancelledOrder = response.data.data;
                
                // Update local state
                setSelectedOrder(cancelledOrder);
                setOrderItemsList(cancelledOrder.items || []);
                
                // Update context
                setCurrentOrder?.(cancelledOrder);
                
                // Update the orders list to reflect cancelled status
                setOrders(prevOrders => 
                  prevOrders.map(order => 
                    order.id === cancelledOrder.id 
                      ? { ...order, status: cancelledOrder.status }
                      : order
                  )
                );
                
                Alert.alert(
                  'Order Cancelled',
                  `Order ${cancelledOrder.order_number} has been cancelled successfully.`,
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  'Cancellation Failed',
                  response.data.message || 'Failed to cancel order. Please try again.'
                );
              }
            } catch (error: any) {
              console.error('Error cancelling order:', error);
              
              let errorMessage = 'Failed to cancel order. Please try again.';
              if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
              }
              
              Alert.alert('Error', errorMessage);
            } finally {
              setCancellingOrder(false);
            }
          }
        }
      ]
    );
  }, [setCurrentOrder]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const formatPrice = useCallback((price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₦${numPrice.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, []);

  // Separate color functions for order status and payment status
  const getOrderStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const getPaymentStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'refunded':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'partially_refunded':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'unpaid':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }, []);

  // Format payment status for display
  const formatPaymentStatus = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '✓ Paid';
      case 'completed':
        return '✓ Paid';
      case 'pending':
        return '⏳ Awaiting Payment';
      case 'failed':
        return '✗ Payment Failed';
      case 'refunded':
        return '↩ Refunded';
      case 'partially_refunded':
        return '↩ Partially Refunded';
      case 'unpaid':
        return '✗ Unpaid';
      default:
        return status;
    }
  }, []);

  // Format order status for display
  const formatOrderStatus = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳ Pending';
      case 'processing':
        return '⚙ Processing';
      case 'shipped':
        return '🚚 Shipped';
      case 'delivered':
        return '✅ Delivered';
      case 'completed':
        return '✅ Completed';
      case 'cancelled':
        return '✕ Cancelled';
      case 'refunded':
        return '↩ Refunded';
      case 'failed':
        return '✗ Failed';
      default:
        return status;
    }
  }, []);

  // Get only the first 2 items to show in summary
  const getDisplayItems = useCallback(() => {
    if (!orderItemsList.length) return [];
    return orderItemsList.slice(0, 2);
  }, [orderItemsList]);

  const getRemainingItemsCount = useCallback(() => {
    if (orderItemsList.length <= 2) return 0;
    return orderItemsList.length - 2;
  }, [orderItemsList]);

  // Order Selector Modal
  const OrderSelectorModal = useCallback(() => (
    <Modal
      visible={showOrderSelector}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowOrderSelector(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-5 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">Select Order</Text>
            <TouchableOpacity 
              onPress={() => setShowOrderSelector(false)}
              className="p-2"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`p-4 mb-2 rounded-xl border ${
                  orderId === item.id 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200'
                }`}
                onPress={() => handleOrderSelect(item)}
              >
                <View className="flex-row justify-between mb-1">
                  <Text className="font-semibold text-gray-900">
                    {item.order_number}
                  </Text>
                  <View className={`px-2 py-1 rounded-full border ${getOrderStatusColor(item.status)}`}>
                    <Text className="text-xs font-medium capitalize">{formatOrderStatus(item.status)}</Text>
                  </View>
                </View>
                
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600 text-sm">Date:</Text>
                  <Text className="text-gray-900 text-sm">{formatDate(item.created_at)}</Text>
                </View>
                
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600 text-sm">Items:</Text>
                  <Text className="text-gray-900 text-sm">{item.items_count}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 text-sm">Total:</Text>
                  <Text className="font-bold text-red-600">
                    {formatPrice(item.total)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Text className="text-gray-500">No orders found</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  ), [showOrderSelector, orders, orderId, handleOrderSelect, getOrderStatusColor, formatOrderStatus, formatDate, formatPrice]);

  if (loading) {
    return (
      <View className="bg-white rounded-xl border border-gray-200 p-4 mb-8 items-center">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="text-gray-600 mt-2">Loading order summary...</Text>
      </View>
    );
  }

  // Show cart-based summary ONLY if:
  // 1. There are no orders in the system
  // 2. No active order has been created in this session
  // 3. Cart has items
  if (!hasActiveOrder && orders.length === 0 && orderItems.length > 0) {
    return (
      <View className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
        <Text className="font-bold mb-4 text-gray-900">Order Summary</Text>

        {orderItems.map(item => (
          <View key={item.id} className="mb-4">
            <Text className="font-semibold mb-2 text-gray-900">{item.store}</Text>
            <View className="border border-gray-200 rounded-xl p-3 flex-row justify-between">
              <View className="flex-1 pr-2">
                <Text className="font-medium text-gray-900">{item.name}</Text>
                <Text className="text-gray-500 text-xs">Qty : {item.quantity}x</Text>
              </View>
              <Text className="font-bold text-red-600">
                {formatPrice(item.price)}
              </Text>
            </View>
          </View>
        ))}

        <View className="flex-row mb-3">
          <TextInput
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="Promo code"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            className="bg-red-600 px-4 ml-2 rounded-lg justify-center"
            onPress={handleApplyPromo}
            disabled={applyingPromo}
          >
            {applyingPromo ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white">Apply</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="border-t border-dashed border-gray-300 my-3" />

        <Row label="Discount" value={`-${formatPrice(discount)}`} red />
        <Row label="Shipping" value={formatPrice(shipping)} />
        <Row label="Sub total" value={formatPrice(subtotal)} />

        <View className="border-t border-gray-300 my-3" />

        <View className="flex-row justify-between">
          <Text className="font-bold text-lg text-gray-900">Total:</Text>
          <Text className="font-bold text-lg text-gray-900">
            {formatPrice(total)}
          </Text>
        </View>
      </View>
    );
  }

  // Show empty cart state
  if (!hasActiveOrder && orders.length === 0 && orderItems.length === 0) {
    return (
      <View className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
        <Text className="font-bold mb-4 text-gray-900">Order Summary</Text>
        <View className="py-8 items-center">
          <Text className="text-gray-500 text-center">Your cart is empty</Text>
        </View>
      </View>
    );
  }

  // Loading order details
  if (orders.length > 0 && loadingDetails && !selectedOrder) {
    return (
      <View className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
        <TouchableOpacity 
          onPress={() => setShowOrderSelector(true)}
          className="flex-row justify-between items-center mb-4"
        >
          <Text className="font-bold text-gray-900">Order Summary</Text>
          <View className="flex-row items-center">
            <Text className="text-red-600 mr-1">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#DC2626" />
          </View>
        </TouchableOpacity>
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#DC2626" />
          <Text className="text-gray-600 mt-2">Loading order details...</Text>
        </View>
      </View>
    );
  }

  // Display order summary from API
  return (
    <>
      <OrderSelectorModal />
      
      <View className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
        {/* Order Selector Header */}
        <TouchableOpacity 
          onPress={() => setShowOrderSelector(true)}
          className="flex-row justify-between items-center mb-4"
        >
          <Text className="font-bold text-gray-900">Order Summary</Text>
          <View className="flex-row items-center">
            <Text className="text-red-600 mr-1">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#DC2626" />
          </View>
        </TouchableOpacity>

        {selectedOrder ? (
          <>
            {/* Order Header - With Distinct Status Badges */}
            <View className="mb-4 p-3 bg-gray-50 rounded-lg">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-semibold text-gray-900 flex-1 mr-2">
                  {selectedOrder.order_number}
                </Text>
                <View className="flex-col items-end">
                  {/* Order Status Badge */}
                  <View className={`px-2 py-1 rounded-full border mb-1 ${getOrderStatusColor(selectedOrder.status)}`}>
                    <Text className="text-xs font-medium">
                      {formatOrderStatus(selectedOrder.status)}
                    </Text>
                  </View>
                  {/* Payment Status Badge */}
                  <View className={`px-2 py-1 rounded-full border ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    <Text className="text-xs font-medium">
                      {formatPaymentStatus(selectedOrder.payment_status)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-row justify-between mt-1">
                <Text className="text-gray-600">Order Date:</Text>
                <Text className="text-gray-900">{formatDate(selectedOrder.created_at)}</Text>
              </View>
              
              {/* Show cancelled date if order is cancelled */}
              {selectedOrder.cancelled_at && (
                <View className="flex-row justify-between mt-1">
                  <Text className="text-gray-600">Cancelled Date:</Text>
                  <Text className="text-gray-900">{formatDate(selectedOrder.cancelled_at)}</Text>
                </View>
              )}

              {/* ✅ Cancel Order Button - Only show if order can be cancelled and is not already cancelled */}
              {selectedOrder.can_cancel && selectedOrder.status !== 'cancelled' && (
                <TouchableOpacity
                  onPress={() => handleCancelOrder(selectedOrder.id)}
                  className="mt-3 flex-row items-center justify-center bg-red-50 p-3 rounded-lg border border-red-200"
                  disabled={cancellingOrder}
                >
                  {cancellingOrder ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <>
                      <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                      <Text className="text-red-600 font-medium ml-1">Cancel Order</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Order Items - Show only first 2 items for summary */}
            <View className="mb-4">
              <Text className="font-semibold mb-2 text-gray-900">
                Items ({selectedOrder.items?.length || 0})
              </Text>
              
              {getDisplayItems().map((item) => (
                <View key={item.id} className="mb-2 border border-gray-200 rounded-xl p-3">
                  <View className="flex-row justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="font-medium text-gray-900" numberOfLines={1}>
                        {item.product_name}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        Qty: {item.quantity}x • SKU: {item.product_sku}
                      </Text>
                    </View>
                    <Text className="font-bold text-red-600">
                      {formatPrice(item.total_price)}
                    </Text>
                  </View>
                </View>
              ))}
              
              {getRemainingItemsCount() > 0 && (
                <TouchableOpacity 
                  className="mt-1 py-2 items-center border border-gray-200 rounded-lg bg-gray-50"
                  onPress={() => Alert.alert(
                    'Order Details',
                    `This order has ${orderItemsList.length} items in total. View complete details in Order History.`
                  )}
                >
                  <Text className="text-red-600 text-sm">
                    +{getRemainingItemsCount()} more {getRemainingItemsCount() === 1 ? 'item' : 'items'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Order Totals - Summary */}
            <View className="mb-3">
              <Row label="Subtotal" value={formatPrice(selectedOrder.subtotal)} />
              {parseFloat(selectedOrder.discount) > 0 && (
                <Row label="Discount" value={`-${formatPrice(selectedOrder.discount)}`} red />
              )}
              {parseFloat(selectedOrder.shipping_cost) > 0 && (
                <Row label="Shipping" value={formatPrice(selectedOrder.shipping_cost)} />
              )}
            </View>

            {/* Promo Code - Only for pending orders */}
            {selectedOrder.status === 'pending' && selectedOrder.payment_status === 'pending' && (
              <>
                <View className="flex-row mb-3">
                  <TextInput
                    value={promoCode}
                    onChangeText={setPromoCode}
                    placeholder="Promo code"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    className="bg-red-600 px-4 ml-2 rounded-lg justify-center"
                    onPress={handleApplyPromo}
                    disabled={applyingPromo}
                  >
                    {applyingPromo ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white">Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View className="border-t border-dashed border-gray-300 my-3" />
              </>
            )}

            {/* Order Total */}
            <View className="flex-row justify-between items-center pt-2">
              <Text className="font-bold text-lg text-gray-900">Total:</Text>
              <View>
                <Text className="font-bold text-lg text-red-600">
                  {formatPrice(selectedOrder.total)}
                </Text>
                {selectedOrder.paid_at && (
                  <Text className="text-xs text-gray-500 text-right">
                    Paid on {formatDate(selectedOrder.paid_at)}
                  </Text>
                )}
              </View>
            </View>

            {/* Customer Notes - Show if exists */}
            {selectedOrder.customer_notes && (
              <View className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <Text className="text-xs text-yellow-800">
                  <Text className="font-semibold">Note: </Text>
                  {selectedOrder.customer_notes}
                </Text>
              </View>
            )}

            {/* Refresh button */}
            <TouchableOpacity 
              onPress={() => orderId && fetchOrderDetails(orderId)}
              className="mt-4 flex-row items-center justify-center"
            >
              <Ionicons name="refresh" size={16} color="#DC2626" />
              <Text className="text-red-600 text-sm ml-1">Refresh Order</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="py-8 items-center">
            <Text className="text-gray-500">No order selected</Text>
            <TouchableOpacity 
              onPress={() => setShowOrderSelector(true)}
              className="mt-4 bg-red-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">Select an Order</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

export default OrderSummarySection;