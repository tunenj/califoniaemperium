import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useCheckout, OrderDetail } from '@/context/CheckoutContext';
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
  payment_method: 'stripe' | 'paystack' | 'card' | 'cash';
  customer_notes: string;
  coupon_code?: string;
  order_items: {
    product_id: string;
    quantity: number;
  }[];
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
    payment_intent?: string;
  };
}

const CheckoutFooter = () => {
  const router = useRouter();
  const { 
    total,
    phoneError, 
    shippingInfo,
    selectedCountry,
    clearCart,
    cartItems, // ✅ Now this comes from CartContext via CheckoutContext
    promoCode,
    setOrderId,
    setHasActiveOrder,
    setCurrentOrder,
  } = useCheckout();
  
  const [loading, setLoading] = useState(false);

  // Parse full name into first and last names
  const parseFullName = (fullName: string) => {
    const names = fullName.trim().split(' ');
    return {
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || names[0] || ''
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
      Alert.alert('Cart Empty', 'Your cart is empty. Please add items to your cart before checkout.');
      return false;
    }

    return true;
  };

  // Handle checkout/order placement
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (phoneError) {
      Alert.alert('Validation Error', phoneError);
      return;
    }

    setLoading(true);

    try {
      // Parse full name
      const { firstName, lastName } = parseFullName(shippingInfo.fullName);

      // ✅ Prepare order items from cart
      const orderItems = cartItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
      }));

      // Prepare request data
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
        payment_method: 'stripe',
        customer_notes: shippingInfo.customerNotes || '',
        order_items: orderItems,
      };

      // Add coupon code if provided
      if (promoCode.trim()) {
        formData.coupon_code = promoCode.trim();
      }

      // Debug log
      console.log('=== PLACING ORDER ===');
      console.log('Cart Items:', cartItems);
      console.log('Order Items:', orderItems);
      console.log('Total:', total);

      // Make API call to create order
      const response = await api.post<ShippingFormResponse>(
        endpoints.ShippingForm,
        formData
      );

      if (response.data.success) {
        const orderData = response.data.data.order;
        
        // Set order state in context
        setOrderId?.(orderData.id);
        setHasActiveOrder?.(true);
        
        // Create order detail object with API-calculated totals
        const orderDetail: OrderDetail = {
          id: orderData.id,
          order_number: orderData.order_number,
          status: orderData.status,
          payment_status: orderData.payment_status,
          subtotal: orderData.subtotal,
          shipping_cost: orderData.shipping_cost,
          discount: orderData.discount,
          total: orderData.total,
          items: cartItems.map((item, index) => ({
            id: `temp-${item.id}-${index}`,
            product_name: item.productName,
            product_sku: item.productId,
            quantity: item.quantity,
            unit_price: item.price.toString(),
            total_price: (item.price * item.quantity).toString(),
            vendor: item.storeName,
          })),
          created_at: orderData.created_at || new Date().toISOString(),
          paid_at: null,
          can_cancel: true,
          customer_notes: shippingInfo.customerNotes || '',
          items_count: cartItems.length,
        };
        
        // Set current order for OrderSummarySection to display
        setCurrentOrder?.(orderDetail);
        
        // Clear cart after successful order
        await clearCart();
        
        // Navigate to order confirmation screen
        router.push({
          pathname: '/(customer)/checkout/confirmation',
          params: {
            orderId: orderData.id,
            orderNumber: orderData.order_number,
            paymentReference: response.data.data.payment_reference,
            paymentIntent: response.data.data.payment_intent || '',
            total: orderData.total,
            subtotal: orderData.subtotal,
            shipping: orderData.shipping_cost,
            discount: orderData.discount,
            paymentMethod: orderData.payment_method,
            itemsCount: orderData.items_count || cartItems.length,
          },
        });
      } else {
        Alert.alert(
          'Order Error',
          response.data.message || 'Failed to create order. Please try again.'
        );
      }
    } catch (error: any) {
      console.error('Order Error:', error);
      
      let errorMessage = 'Failed to create order. Please try again.';
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert('Order Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      {/* Simple Footer - Just Payment Note and Button */}
      
      {/* Stripe Payment Note */}
      <View className="mb-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <Text className="text-blue-700 text-sm text-center">
          💳 Payment will be processed securely via Stripe
        </Text>
      </View>

      {/* Place Order Button */}
      <TouchableOpacity
        onPress={handlePlaceOrder}
        disabled={loading || !!phoneError || cartItems.length === 0}
        className={`rounded-xl py-4 items-center ${
          loading || phoneError || cartItems.length === 0 
            ? 'bg-gray-400' 
            : 'bg-red-600'
        } ${loading ? 'opacity-80' : 'active:opacity-90'}`}
      >
        {loading ? (
          <View className="flex-row items-center">
            <ActivityIndicator color="#fff" size="small" />
            <Text className="text-white font-bold text-lg ml-2">Processing...</Text>
          </View>
        ) : (
          <View className="flex-col items-center">
            <Text className="text-white font-bold text-lg">
              {cartItems.length === 0 ? 'Cart is Empty' : 'Place Order'}
            </Text>
            {cartItems.length > 0 && (
              <Text className="text-white text-sm mt-1">
                Total: ₦{total.toLocaleString()}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Error Messages */}
      {phoneError && (
        <Text className="text-red-500 text-sm text-center mt-2">
          {phoneError}
        </Text>
      )}

      {cartItems.length === 0 && (
        <Text className="text-orange-500 text-sm text-center mt-2">
          Your cart is empty. Add items to proceed.
        </Text>
      )}
    </View>
  );
};

export default CheckoutFooter;