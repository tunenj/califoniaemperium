// components/checkout/PaymentSection.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Modal 
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStripe, StripeProvider } from '@stripe/stripe-react-native';
import { useCheckout } from '@/context/CheckoutContext';
import stripePaymentService from '@/service/stripePaymentService';

// Card types for Stripe with specific FontAwesome icon names
const cardTypes = [
  { type: 'visa', name: 'Visa', icon: 'cc-visa' as const },
  { type: 'mastercard', name: 'Mastercard', icon: 'cc-mastercard' as const },
  { type: 'amex', name: 'Amex', icon: 'cc-amex' as const },
  { type: 'discover', name: 'Discover', icon: 'cc-discover' as const },
];

// Stripe Payment Form Component
const StripePaymentForm = ({ 
  amount, 
  onPaymentSuccess,
  onPaymentError,
  orderId 
}: { 
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  orderId: string;
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [processing, setProcessing] = useState(false);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStripeConfig();
  }, []);

  const loadStripeConfig = async () => {
    setIsLoading(true);
    try {
      const key = await stripePaymentService.getStripeConfig();
      setPublishableKey(key);
    } catch (error) {
      console.error('Failed to load Stripe config:', error);
      Alert.alert('Error', 'Failed to initialize payment system');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPress = async () => {
    if (!orderId) {
      Alert.alert('Error', 'Order information is missing');
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create payment intent
      console.log('Creating payment intent for order:', orderId);
      const paymentIntent = await stripePaymentService.createPaymentIntent(orderId);
      
      console.log('Payment intent created:', paymentIntent);

      // Step 2: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: paymentIntent.client_secret,
        merchantDisplayName: 'Stock',
        style: 'alwaysDark',
        defaultBillingDetails: {
          name: 'Customer',
        },
        returnURL: 'yourapp://stripe-redirect', // Add your app's URL scheme
      });

      if (initError) {
        console.error('Init error:', initError);
        onPaymentError(initError.message);
        setProcessing(false);
        return;
      }

      // Step 3: Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Present error:', presentError);
        
        if (presentError.code === 'Canceled') {
          // User cancelled - no need to show error
          console.log('Payment cancelled');
        } else {
          onPaymentError(presentError.message);
          
          // Step 4: Confirm payment status with backend if needed
          try {
            const confirmResult = await stripePaymentService.confirmPayment(paymentIntent.payment_intent_id);
            console.log('Payment status:', confirmResult);
          } catch (confirmError) {
            console.error('Error confirming payment:', confirmError);
          }
        }
      } else {
        // Payment successful
        onPaymentSuccess(paymentIntent.payment_intent_id);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      onPaymentError(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!publishableKey || isLoading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="large" color="#635BFF" />
        <Text className="text-gray-500 mt-3">Initializing payment system...</Text>
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <View className="mt-4">
        <TouchableOpacity
          onPress={handlePayPress}
          disabled={processing}
          className={`py-4 rounded-xl ${processing ? 'bg-gray-400' : 'bg-[#635BFF]'}`}
        >
          {processing ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                Processing...
              </Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg text-center">
              Pay ₦{amount.toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </StripeProvider>
  );
};

// Main PaymentSection Component
const PaymentSection = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    selectedPayment, 
    setSelectedPayment, 
    orderId: contextOrderId,
    total,
    clearCart,
    shippingInfo,
    hasActiveOrder,
    currentOrder
  } = useCheckout();
  
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Use orderId from params (if coming from orders) or from context
  const orderId = (params.orderId as string) || contextOrderId;
  const autoOpenPayment = params.autoOpenPayment === 'true';
  const returnTo = (params.returnTo as string) || 'orders';

  // Auto-open payment modal when coming from orders page
  useEffect(() => {
    if (autoOpenPayment && orderId && hasActiveOrder && currentOrder) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        setShowStripeModal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [autoOpenPayment, orderId, hasActiveOrder, currentOrder]);

  // Check if order is ready for payment
  const isOrderReady = orderId && hasActiveOrder && currentOrder;

  const handleStripePayment = async () => {
    if (!isOrderReady) {
      Alert.alert(
        'Order Not Ready',
        'Please create your order first before proceeding to payment.',
        [
          { text: 'OK' }
        ]
      );
      return;
    }

    setShowStripeModal(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setProcessingPayment(true);
    
    try {
      console.log('Payment successful! Intent ID:', paymentIntentId);
      console.log('Order ID:', orderId);
      
      // Clear cart after successful payment (only if this was from cart)
      if (!params.orderId) {
        await clearCart();
      }
      
      Alert.alert(
        'Payment Successful! 🎉',
        `Order #${currentOrder?.order_number || ''} has been paid successfully.`,
        [
          { 
            text: 'View Orders', 
            onPress: () => {
              setShowStripeModal(false);
              // Navigate back to appropriate page
              if (returnTo === 'history') {
                router.push('/(customer)/orders/history');
              } else {
                router.push('/(customer)/orders');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error processing successful payment:', error);
      Alert.alert(
        'Success',
        'Payment was successful, but there was an issue updating your cart. Please check your orders.'
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    Alert.alert(
      'Payment Failed',
      errorMessage || 'An error occurred during payment. Please try again.'
    );
  };

  // Render Stripe logo
  const StripeLogo = () => (
    <View className="flex-row items-center">
      <Text className="font-bold text-xl" style={{ color: '#635BFF' }}>Stripe</Text>
      <View className="ml-2 px-2 py-1 bg-blue-50 rounded-md">
        <Text className="text-blue-600 text-xs font-semibold">SECURE</Text>
      </View>
    </View>
  );

  return (
    <View className="mb-6 px-3">
      <Text className="font-bold mb-1 text-gray-900 text-lg">Payment Method</Text>
      <Text className="text-gray-500 mb-4 text-sm">Secure payment powered by Stripe</Text>

      {/* Stripe Payment Option */}
      <View className="space-y-4">
        <TouchableOpacity
          onPress={() => setSelectedPayment('stripe')}
          className={`border-2 rounded-xl p-4 ${selectedPayment === 'stripe' ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white'}`}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-between mb-3">
            <StripeLogo />
            <View className={`w-6 h-6 rounded-full border-2 ${selectedPayment === 'stripe' ? 'border-red-600 bg-red-600' : 'border-gray-300'}`}>
              {selectedPayment === 'stripe' && (
                <View className="w-2 h-2 rounded-full bg-white m-auto" />
              )}
            </View>
          </View>

          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: '#635BFF20' }}>
              <MaterialIcons name="credit-card" size={28} color="#635BFF" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-base text-gray-900">Credit/Debit Card</Text>
              <Text className="text-gray-500 text-sm mt-1">Pay with Visa, Mastercard, Amex, or Discover</Text>
            </View>
          </View>

          {/* Supported Cards */}
          <View className="mt-3">
            <Text className="text-gray-600 text-sm mb-2">We accept:</Text>
            <View className="flex-row items-center space-x-4">
              {cardTypes.map(card => (
                <View key={card.type} className="items-center">
                  <FontAwesome 
                    name={card.icon} 
                    size={28} 
                    color="#4B5563"
                  />
                  <Text className="text-gray-500 text-[10px] mt-1">{card.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Security Badges */}
          <View className="mt-4 pt-3 border-t border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialIcons name="lock" size={14} color="#10B981" />
                <Text className="text-gray-500 text-[10px] ml-1">SSL</Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="security" size={14} color="#10B981" />
                <Text className="text-gray-500 text-[10px] ml-1">PCI DSS</Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="verified" size={14} color="#10B981" />
                <Text className="text-gray-500 text-[10px] ml-1">3D Secure</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Payment Info Note */}
        <View className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <View className="flex-row items-center">
            <MaterialIcons name="info" size={16} color="#3B82F6" />
            <Text className="text-blue-700 text-xs ml-2 flex-1">
              Secure Stripe payment - we don&apos;t store card details
            </Text>
          </View>
        </View>

        {/* Pay Button - Only show if Stripe is selected */}
        {selectedPayment === 'stripe' && (
          <View className="mt-4">
            <TouchableOpacity
              onPress={handleStripePayment}
              disabled={processingPayment || !isOrderReady}
              className={`py-4 rounded-xl ${
                processingPayment || !isOrderReady 
                  ? 'bg-gray-400' 
                  : 'bg-[#635BFF]'
              }`}
            >
              {processingPayment ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold text-lg ml-2">
                    Processing...
                  </Text>
                </View>
              ) : !isOrderReady ? (
                <Text className="text-white font-semibold text-lg text-center">
                  Create Order First
                </Text>
              ) : (
                <Text className="text-white font-semibold text-lg text-center">
                  Pay ₦{total.toLocaleString()}
                </Text>
              )}
            </TouchableOpacity>
            
            {/* Order Status Hint */}
            {!isOrderReady && (
              <Text className="text-gray-500 text-xs text-center mt-2">
                Please create your order first using the button below
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Stripe Payment Modal */}
      <Modal
        visible={showStripeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStripeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 min-h-[400px]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Complete Payment</Text>
              <TouchableOpacity
                onPress={() => setShowStripeModal(false)}
                className="p-2"
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View className="mb-6">
              <View className="bg-gray-50 p-4 rounded-xl">
                <Text className="text-gray-600 mb-2">Order Total</Text>
                <Text className="text-3xl font-bold text-gray-900">
                  ₦{total.toLocaleString()}
                </Text>
                
                {/* Show order number for reference */}
                {currentOrder && (
                  <Text className="text-gray-500 text-xs mt-2">
                    Order #{currentOrder.order_number}
                  </Text>
                )}
              </View>
            </View>

            {/* Shipping Info Summary */}
            {shippingInfo?.fullName && (
              <View className="mb-4">
                <Text className="text-gray-600 text-sm">Shipping to:</Text>
                <Text className="text-gray-900 font-medium">
                  {shippingInfo.fullName}, {shippingInfo.city}, {shippingInfo.country}
                </Text>
              </View>
            )}

            {orderId && (
              <StripePaymentForm
                amount={total}
                orderId={orderId}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            )}

            <Text className="text-center text-gray-500 text-xs mt-6">
              Powered by Stripe - Your payment is secure
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentSection;