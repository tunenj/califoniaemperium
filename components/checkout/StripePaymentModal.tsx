import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStripe, StripeProvider } from '@stripe/stripe-react-native'; // ✅ Added useStripe
import stripePaymentService from '@/service/stripePaymentService';

interface StripePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  orderId: string;
  orderNumber: string;
  amount: number;
}

const PaymentSheetForm = ({
  orderId,
  orderNumber,
  amount,
  onSuccess,
  onError,
  onClose,
}: Omit<StripePaymentModalProps, 'visible'>) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe(); // ✅ Now works
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    try {
      // Step 1: Create payment intent
      const paymentIntent = await stripePaymentService.createPaymentIntent(orderId);

      // Step 2: Init payment sheet ✅ No returnURL = no Expo Router error
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: paymentIntent.client_secret,
        merchantDisplayName: 'Stock',
      });

      if (initError) {
        onError(initError.message || 'Failed to initialize payment');
        setProcessing(false);
        return;
      }

      // Step 3: Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          onError(presentError.message || 'Payment was cancelled');
        }
      } else {
        // Step 4: Confirm on backend
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
      {/* Order Summary */}
      <View className="bg-gray-50 p-4 rounded-xl mb-6">
        <Text className="text-gray-500 text-sm mb-1">Order #{orderNumber}</Text>
        <Text className="text-3xl font-bold text-gray-900">
          ₦{amount.toLocaleString()}
        </Text>
      </View>

      {/* Security badges */}
      <View className="flex-row justify-around mb-6 py-3 border border-gray-100 rounded-xl bg-gray-50">
        {[
          { icon: 'lock' as const, label: 'SSL' },
          { icon: 'security' as const, label: 'PCI DSS' },
          { icon: 'verified' as const, label: '3D Secure' },
        ].map(badge => (
          <View key={badge.label} className="flex-row items-center">
            <MaterialIcons name={badge.icon} size={14} color="#10B981" />
            <Text className="text-gray-500 text-xs ml-1">{badge.label}</Text>
          </View>
        ))}
      </View>

      {/* Pay Button */}
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
            Pay ₦{amount.toLocaleString()}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose} disabled={processing} className="mt-3 py-3">
        <Text className="text-gray-500 text-center text-sm">Cancel</Text>
      </TouchableOpacity>

      <Text className="text-center text-gray-400 text-xs mt-4">
        Powered by Stripe · Your payment is secure
      </Text>
    </View>
  );
};

const StripePaymentModal = (props: StripePaymentModalProps) => {
  const { visible, onClose, orderId, orderNumber, amount, onSuccess, onError } = props;
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);

  useEffect(() => {
    if (visible && orderId) {
      setKeyLoading(true);
      setPublishableKey(null);
      stripePaymentService
        .getStripeConfig()
        .then(key => setPublishableKey(key))
        .catch(() => {
          Alert.alert('Error', 'Failed to initialize payment system');
          onClose();
        })
        .finally(() => setKeyLoading(false));
    }
  }, [visible, orderId]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 min-h-[420px]">
          {/* Header */}
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
            <StripeProvider publishableKey={publishableKey}>
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

export default StripePaymentModal;
