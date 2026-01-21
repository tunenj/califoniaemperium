import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
  vendorName: string;
  vendorEmail: string;
  commissionRate: number;
  totalSales: number;
  onSave: (rate: number) => void;
}

const EditCommissionModal: React.FC<Props> = ({
  visible,
  onClose,
  vendorName,
  vendorEmail,
  commissionRate,
  totalSales,
  onSave,
}) => {
  const [rate, setRate] = React.useState(
    String(commissionRate)
  );

  const commissionValue =
    (Number(rate) / 100) * totalSales;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-4">
        <View className="w-full rounded-2xl bg-white p-5">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Edit Commission Rate
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} />
            </Pressable>
          </View>

          {/* Vendor Info */}
          <View className="border border-gray-300 rounded-xl px-4 py-3 mb-4">
            <Text className="font-semibold text-gray-900">
              {vendorName}
            </Text>
            <Text className="text-sm text-gray-500">
              {vendorEmail}
            </Text>
          </View>

          {/* Commission Input */}
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Commission Rate (%)
          </Text>
          <TextInput
            keyboardType="numeric"
            value={rate}
            onChangeText={setRate}
            className="border border-gray-300 rounded-xl px-4 py-3 mb-2 text-gray-900"
          />

          <Text className="text-xs text-gray-500 mb-4">
            Platform will earn {rate}% of each sale from this vendor
          </Text>

          {/* Preview */}
          <View className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
            <Text className="text-xs text-red-600 mb-2">
              Preview on current sale
            </Text>

            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-700">
                Total Sales:
              </Text>
              <Text className="font-semibold">
                ₦{totalSales.toLocaleString()}
              </Text>
            </View>

            <View className="flex-row justify-between mt-1">
              <Text className="text-sm text-gray-700">
                Commission:
              </Text>
              <Text className="font-semibold text-red-600">
                ₦{commissionValue.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row justify-between">
            <Pressable
              onPress={onClose}
              className="flex-1 mr-2 border border-red-500 rounded-full py-3"
            >
              <Text className="text-center text-red-500 font-medium">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onSave(Number(rate))}
              className="flex-1 ml-2 bg-red-600 rounded-full py-3"
            >
              <Text className="text-center text-white font-medium">
                Save change
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditCommissionModal;
