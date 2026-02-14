import React from 'react';
import { Modal, Pressable, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useCheckout } from '../../context/CheckoutContext';

const DeliveryOptionsModal = () => {
  const { showDeliveryOptions, setShowDeliveryOptions, deliveryOptions, shippingInfo, setShippingInfo } = useCheckout();

  const handleSelect = (option: string) => {
    setShippingInfo(prev => ({ ...prev, deliveryOption: option }));
    setShowDeliveryOptions(false);
  };

  return (
    <Modal visible={showDeliveryOptions} transparent animationType="fade" onRequestClose={() => setShowDeliveryOptions(false)}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={() => setShowDeliveryOptions(false)}>
        <Pressable className="bg-white rounded-xl w-11/12 max-w-sm" onPress={e => e.stopPropagation()}>
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-900">Select Delivery Option</Text>
          </View>

          <FlatList
            data={deliveryOptions}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="px-4 py-4 border-b border-gray-100 flex-row justify-between items-center"
                onPress={() => handleSelect(item)}
              >
                <Text className="text-gray-900">{item}</Text>
                {shippingInfo.deliveryOption === item && <AntDesign name="check" size={20} color="#DC2626" />}
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity className="p-4 border-t border-gray-200" onPress={() => setShowDeliveryOptions(false)}>
            <Text className="text-center text-red-600 font-medium">Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DeliveryOptionsModal;
