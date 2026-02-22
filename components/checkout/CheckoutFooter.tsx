// CheckoutFooter.tsx
import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useCheckout, OrderDetail } from '@/context/CheckoutContext';
import { useCart } from '@/context/CartContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { useRouter } from 'expo-router';

// Type for the API request body
interface ShippingFormData {
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  billing_same_as_shipping: boolean;
  payment_method: string;
  customer_notes: string;
  coupon_code?: string;
  order_items: {
    product_id: string;
    quantity: number;
  }[];
  // ✅ Correct field names matching your API
  shipping_method?: string;
  shipping_option_cost?: number;
  estimated_delivery?: string;
}

// Type for the API response
interface ShippingFormResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      id: string;
      order_number: string;
      customer: string;
      customer_email: string;
      status: string;
      payment_status: string;
      subtotal: string;
      shipping_cost: string;
      discount: string;
      tax: string;
      total: string;
      items_count: number;
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
    };
    payment_reference: string;
  };
}

// Format price helper
const formatPrice = (price: number): string => {
  return `€${price.toFixed(2)}`;
};

const CheckoutFooter = () => {
  const router = useRouter();
  const { 
    total,
    phoneError, 
    shippingInfo,
    selectedCountry,
    clearCart,
    cartItems,
    promoCode,
    setOrderId,
    setHasActiveOrder,
    setCurrentOrder,
    selectedPayment,
  } = useCheckout();

  // ✅ Pull selected shipping option directly from CartContext
  const { selectedShipping, shippingCost } = useCart();

  const [loading, setLoading] = useState(false);

  // Parse full name into first and last names
  const parseFullName = (fullName: string) => {
    const names = fullName.trim().split(' ');
    return {
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || names[0] || '',
    };
  };

  // Validate form data
  const validateForm = (): boolean => {
    if (!shippingInfo.fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }

    if (!shippingInfo.phoneNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return false;
    }

    if (!shippingInfo.billingAddress.trim()) {
      Alert.alert('Validation Error', 'Please enter your billing address');
      return false;
    }

    if (!shippingInfo.city.trim()) {
      Alert.alert('Validation Error', 'Please enter your city');
      return false;
    }

    if (!shippingInfo.state?.trim()) {
      Alert.alert('Validation Error', 'Please enter your state');
      return false;
    }

    if (!shippingInfo.postalCode?.trim()) {
      Alert.alert('Validation Error', 'Please enter your postal code');
      return false;
    }

    if (!shippingInfo.country.trim()) {
      Alert.alert('Validation Error', 'Please select your country');
      return false;
    }

    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty. Please add items before checkout.');
      return false;
    }

    return true;
  };

  // Map UI payment method to API valid choices
  const getValidPaymentMethod = (uiMethod: string): string => {
    const paymentMethodMap: Record<string, string> = {
      'card': 'card',
      'cash': 'cash_on_delivery',
      'bank': 'bank_transfer',
    };
    return paymentMethodMap[uiMethod] || 'card';
  };

  // Create order
  const handleCreateOrder = async () => {
    if (!validateForm()) return;

    if (phoneError) {
      Alert.alert('Validation Error', phoneError);
      return;
    }

    setLoading(true);

    try {
      const { firstName, lastName } = parseFullName(shippingInfo.fullName);
      const orderItems = cartItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
      }));

      const validPaymentMethod = getValidPaymentMethod(selectedPayment || 'card');

      const formData: ShippingFormData = {
        shipping_first_name: firstName,
        shipping_last_name: lastName,
        shipping_phone: selectedCountry.dialCode + shippingInfo.phoneNumber.replace(/^0+/, ''),
        shipping_address_line1: shippingInfo.billingAddress,
        shipping_address_line2: shippingInfo.addressLine2 || '',
        shipping_city: shippingInfo.city,
        shipping_state: shippingInfo.state || '',
        shipping_postal_code: shippingInfo.postalCode || '',
        shipping_country: selectedCountry.value || 'NG',
        billing_same_as_shipping: true,
        payment_method: validPaymentMethod,
        customer_notes: shippingInfo.customerNotes || '',
        order_items: orderItems,

        // Correct field names matching your Postman/API spec
        ...(selectedShipping && {
          shipping_method: selectedShipping.logistics_name,
          shipping_option_cost: shippingCost,
          estimated_delivery: selectedShipping.estimated_delivery,
        }),
      };

      if (promoCode.trim()) {
        formData.coupon_code = promoCode.trim();
      }

      const response = await api.post<ShippingFormResponse>(
        endpoints.ShippingForm,
        formData
      );

      if (response.data.success) {
        const order = response.data.data.order;

        if (setOrderId) setOrderId(order.id);
        if (setHasActiveOrder) setHasActiveOrder(true);

        // Store order detail using values returned by backend
        const orderDetail: OrderDetail = {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          payment_status: 'pending',
          subtotal: order.subtotal,
          shipping_cost: order.shipping_cost,  // ✅ From backend
          discount: order.discount,
          total: order.total,                  // ✅ From backend (includes shipping)
          items: cartItems.map((item, index) => ({
            id: `temp-${item.id}-${index}`,
            product_name: item.productName,
            product_sku: item.productId,
            quantity: item.quantity,
            unit_price: item.price.toString(),
            total_price: (item.price * item.quantity).toString(),
            vendor: item.storeName,
          })),
          created_at: order.created_at || new Date().toISOString(),
          paid_at: null,
          can_cancel: true,
          customer_notes: shippingInfo.customerNotes || '',
          items_count: cartItems.length,
        };

        if (setCurrentOrder) setCurrentOrder(orderDetail);

        Alert.alert(
          '✅ Order Created!',
          `Order #${order.order_number} has been created.\nTotal: €${parseFloat(order.total).toFixed(2)}`,
          [
            {
              text: 'View Orders',
              onPress: async () => {
                await clearCart();
                router.push('/(customer)/orders');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Order Creation Error:', error);
      Alert.alert('Order Error', error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pb-6 pt-3">

      {/* ✅ Shipping summary line */}
      {selectedShipping ? (
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-500 text-xs">
            🚚 {selectedShipping.logistics_name} · {selectedShipping.estimated_delivery}
          </Text>
          <Text className="text-gray-700 text-xs font-medium">
            +{formatPrice(shippingCost)}
          </Text>
        </View>
      ) : (
        <Text className="text-orange-500 text-xs font-medium mb-2">
          ⚠️ No shipping method selected — go back to cart to choose one
        </Text>
      )}

      {/* Create Order Button */}
      <TouchableOpacity
        onPress={handleCreateOrder}
        disabled={loading || !!phoneError || cartItems.length === 0}
        className={`rounded-xl py-4 px-4 flex-row items-center justify-between ${
          loading || phoneError || cartItems.length === 0
            ? 'bg-gray-400'
            : 'bg-secondary'
        }`}
      >
        {loading ? (
          <View className="flex-row items-center flex-1 justify-center">
            <ActivityIndicator color="#fff" size="small" />
            <Text className="text-white font-bold text-lg ml-2">Creating Order...</Text>
          </View>
        ) : (
          <>
            <Text className="text-white font-bold text-lg">
              {cartItems.length === 0 ? 'Cart is Empty' : 'Create Order'}
            </Text>
            {cartItems.length > 0 && (
              <Text className="text-white font-bold text-lg">
                {formatPrice(total)}
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>

      {/* Phone error */}
      {phoneError && (
        <Text className="text-red-500 text-sm text-center mt-2">
          {phoneError}
        </Text>
      )}
    </View>
  );
};

export default CheckoutFooter;