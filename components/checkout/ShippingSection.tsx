import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useCheckout } from '@/context/CheckoutContext';

const ShippingSection: React.FC = () => {
  const {
    shippingInfo,
    setShippingInfo,
    selectedCountry,
    setShowCountryPicker,
    phoneInputRef,
    phoneError,
    formatDisplayPhoneNumber,
  } = useCheckout();

  // Update a specific field safely
  const updateShippingField = (field: keyof typeof shippingInfo, value: string) => {
    setShippingInfo(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className='px-3 py-4'>
        <Text className="text-xl font-bold mb-6 text-gray-900">
          Shipping Information
        </Text>

        {/* Full Name and Phone */}
        <View className="flex-row space-x-3 mb-4 gap-2">
          {/* Full Name */}
          <View className="flex-1">
            <Text className="text-sm mb-2 text-gray-700 font-medium">
              Full Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={shippingInfo.fullName}
              onChangeText={text => updateShippingField('fullName', text)}
              placeholder="Enter your full name"
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900"
            />
          </View>

          {/* Phone Number */}
          <View className="flex-1">
            <Text className="text-sm mb-2 text-gray-700 font-medium">
              Phone Number <Text className="text-red-500">*</Text>
            </Text>
            <View className="relative">
              <View className="flex-row">
                {/* Country Code Button */}
                <TouchableOpacity
                  onPress={() => setShowCountryPicker(true)}
                  className="border border-gray-300 rounded-l-xl px-3 py-3 bg-gray-50 flex-row items-center min-w-16"
                >
                  <Text className="text-gray-900 font-medium mr-2">
                    {selectedCountry.dialCode}
                  </Text>
                  <AntDesign name="down" size={12} color="#6B7280" />
                </TouchableOpacity>

                {/* Phone Input */}
                <TextInput
                  ref={phoneInputRef}
                  value={formatDisplayPhoneNumber(
                    shippingInfo.phoneNumber,
                    selectedCountry.dialCode
                  )}
                  onChangeText={text =>
                    updateShippingField(
                      'phoneNumber',
                      text.replace(/\D/g, '')
                    )
                  }
                  placeholder="Enter phone number"
                  className={`flex-1 border border-gray-300 border-l-0 rounded-r-xl px-4 py-3 bg-white text-gray-900 ${
                    phoneError ? 'border-red-500' : ''
                  }`}
                  keyboardType="phone-pad"
                />
              </View>
              {phoneError ? (
                <Text className="text-red-500 text-xs mt-1">{phoneError}</Text>
              ) : (
                <Text className="text-gray-500 text-xs mt-1">
                  Country: {selectedCountry.label}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Billing Address */}
        <View className="mb-4">
          <Text className="text-sm mb-2 text-gray-700 font-medium">
            Billing Address <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={shippingInfo.billingAddress}
            onChangeText={text => updateShippingField('billingAddress', text)}
            placeholder="Street address, house number"
            className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* Address Line 2 */}
        <View className="mb-4">
          <Text className="text-sm mb-2 text-gray-700 font-medium">
            Address Line 2 (Optional)
          </Text>
          <TextInput
            value={shippingInfo.addressLine2 || ''}
            onChangeText={text => updateShippingField('addressLine2', text)}
            placeholder="Apartment, suite, unit, building, floor, etc."
            className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900"
          />
        </View>

        {/* City, State, Postal Code */}
        <View className="flex-row space-x-3 mb-4 gap-2">
          {/* City */}
          <View className="flex-1">
            <Text className="text-sm mb-2 text-gray-700 font-medium">
              City <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={shippingInfo.city}
              onChangeText={text => updateShippingField('city', text)}
              placeholder="Enter your city"
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900"
            />
          </View>

          {/* State */}
          <View className="flex-1">
            <Text className="text-sm mb-2 text-gray-700 font-medium">
              State <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={shippingInfo.state || ''}
              onChangeText={text => updateShippingField('state', text)}
              placeholder="Enter your state"
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900"
            />
          </View>
        </View>

        <View className="flex-row space-x-3 mb-4 gap-2">
          {/* Postal Code */}
          <View className="flex-1">
            <Text className="text-sm mb-2 text-gray-700 font-medium">
              Postal Code <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={shippingInfo.postalCode || ''}
              onChangeText={text => updateShippingField('postalCode', text)}
              placeholder="Enter postal code"
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900"
              keyboardType="number-pad"
            />
          </View>

          {/* Country */}
          <View className="flex-1">
            <Text className="text-sm mb-2 text-gray-700 font-medium">
              Country <Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowCountryPicker(true)}
              className="border border-gray-300 rounded-xl px-4 py-3 flex-row justify-between items-center bg-white"
            >
              <Text className="text-gray-900">
                {shippingInfo.country || 'Select Country'}
              </Text>
              <AntDesign name="down" size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Information Note */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <Text className="text-blue-800 text-sm">
            <Text className="font-bold">Note:</Text> Your shipping information will be used for order delivery. Payment will be completed in the next step.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ShippingSection;