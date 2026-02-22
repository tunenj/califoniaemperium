import React from 'react';
import { Modal, Pressable, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useCheckout, ShippingInfo } from '../../context/CheckoutContext';

const CountryPickerModal: React.FC = () => {
  const {
    showCountryPicker,
    setShowCountryPicker,
    mappedCountries,
    selectedCountry,
    setSelectedCountry,
    setShippingInfo,
    phoneInputRef,
  } = useCheckout();

  // Type-safe handler for selecting a country
  const handleSelect = (country: typeof mappedCountries[number]) => {
    setSelectedCountry(country);
    setShippingInfo((prev: ShippingInfo) => ({
      ...prev,
      country: country.label,
    }));
    setShowCountryPicker(false);

    // Focus phone input after selecting country
    setTimeout(() => phoneInputRef.current?.focus(), 100);
  };

  return (
    <Modal
      visible={showCountryPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCountryPicker(false)}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={() => setShowCountryPicker(false)}
      >
        <Pressable
          className="bg-white rounded-t-3xl p-6 max-h-[70%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">Select Country</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <AntDesign name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Country List */}
          <FlatList
            data={mappedCountries}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center py-3 px-2 border-b border-gray-100"
                onPress={() => handleSelect(item)}
              >
                <Text className="text-2xl mr-3">{item.flag}</Text>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">{item.label}</Text>
                  <Text className="text-gray-500 text-sm">{item.dialCode}</Text>
                </View>
                {selectedCountry.value === item.value && (
                  <AntDesign name="check" size={20} color="#DC2626" />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Text className="text-gray-500">No countries found</Text>
              </View>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CountryPickerModal;
