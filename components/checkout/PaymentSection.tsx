import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useCheckout } from '@/context/CheckoutContext';

// Card types for Stripe with specific FontAwesome icon names
const cardTypes = [
  { type: 'visa', name: 'Visa', icon: 'cc-visa' as const },
  { type: 'mastercard', name: 'Mastercard', icon: 'cc-mastercard' as const },
  { type: 'amex', name: 'Amex', icon: 'cc-amex' as const }, // Shortened to 'Amex'
  { type: 'discover', name: 'Discover', icon: 'cc-discover' as const },
];

const PaymentSection = () => {
  const { selectedPayment, setSelectedPayment } = useCheckout();

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

          {/* Supported Cards - Improved layout to prevent overcrowding */}
          <View className="mt-3">
            <Text className="text-gray-600 text-sm mb-2">We accept:</Text>
            
            {/* Option 1: Icons only (cleanest) */}
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

            {/* Option 2: Compact chips with icons only (no text labels) - Uncomment to use instead */}
            {/* <View className="flex-row space-x-2">
              {cardTypes.map(card => (
                <View key={card.type} className="bg-gray-50 p-2 rounded-lg">
                  <FontAwesome name={card.icon} size={24} color="#4B5563" />
                </View>
              ))}
            </View> */}

            {/* Option 3: Even more compact - icons only */}
            {/* <View className="flex-row space-x-3">
              {cardTypes.map(card => (
                <FontAwesome key={card.type} name={card.icon} size={28} color="#4B5563" />
              ))}
            </View> */}
          </View>

          {/* Security Badges - Made more compact */}
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

        {/* Payment Info Note - More compact */}
        <View className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <View className="flex-row items-center">
            <MaterialIcons name="info" size={16} color="#3B82F6" />
            <Text className="text-blue-700 text-xs ml-2 flex-1">
              Secure Stripe payment - we don&apos;t store card details
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PaymentSection;