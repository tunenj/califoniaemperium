import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  visible: boolean;
  onClose: () => void;
  vendorName: string;
  vendorEmail: string;
  vendorSlug: string;
  commissionRate: number;
  totalSales: number;
  onSave: (rate: number) => void;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    vendor_name: string;
    business_slug: string;
    commission_rate: number;
  };
}

// Helper function to format price in euros
const formatPrice = (price: number) => {
  return `€${price.toLocaleString('de-DE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

const EditCommissionModal: React.FC<Props> = ({
  visible,
  onClose,
  vendorName,
  vendorEmail,
  vendorSlug,
  commissionRate,
  totalSales,
  onSave,
}) => {
  const { t } = useLanguage();
  const [rate, setRate] = useState(String(commissionRate));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      console.log('📦 EditCommissionModal received props:', {
        vendorName,
        vendorEmail,
        vendorSlug,
        commissionRate,
        totalSales
      });
      setRate(String(commissionRate));
      setError(null);
    }
  }, [visible, vendorName, vendorEmail, vendorSlug, commissionRate, totalSales]);

  const commissionValue = (Number(rate) / 100) * totalSales;

  const handleSave = async () => {
    const newRate = Number(rate);
    
    // Validate rate
    if (isNaN(newRate) || newRate < 0 || newRate > 100) {
      Alert.alert(
        t('error') || 'Error',
        t('invalid_commission_rate') || 'Please enter a valid commission rate between 0 and 100'
      );
      return;
    }

    if (!vendorSlug) {
      Alert.alert(
        t('error') || 'Error',
        'Vendor slug is missing. Please try again.'
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('accessToken');
      
      console.log('🔐 Calling API:', endpoints.createCommission(vendorSlug), 'with rate:', newRate);
      
      // Call the create commission endpoint
      const response = await api.post<ApiResponse>(
        endpoints.createCommission(vendorSlug),
        { commission_rate: newRate },
        {
          headers: {
            Authorization: `Bearer ${token || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Commission update response:', response.data);

      if (response.data.success) {
        Alert.alert(
          t('success') || 'Success',
          response.data.message || 'Commission rate updated successfully'
        );
        onSave(newRate);
        onClose();
      } else {
        setError(response.data.message || 'Failed to update commission rate');
      }
    } catch (error: any) {
      console.error('❌ Error updating commission:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to update commission rate';
      setError(errorMessage);
      Alert.alert(
        t('error') || 'Error',
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRate(String(commissionRate));
    setError(null);
    onClose();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-4">
        <View className="w-full rounded-2xl bg-white p-5">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              {t('edit_commission_rate') || 'Edit Commission Rate'}
            </Text>
            <Pressable onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={22} color={loading ? "#9CA3AF" : "#000"} />
            </Pressable>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          {/* Vendor Info */}
          <View className="border border-gray-300 rounded-xl px-4 py-3 mb-4">
            <Text className="font-semibold text-gray-900">
              {vendorName}
            </Text>
            <Text className="text-sm text-gray-500">
              {vendorEmail}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              Slug: {vendorSlug}
            </Text>
          </View>

          {/* Commission Input */}
          <Text className="text-sm font-medium text-gray-700 mb-1">
            {t('commission_rate_percent') || 'Commission Rate (%)'}
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 mb-2">
            <TextInput
              keyboardType="numeric"
              value={rate}
              onChangeText={setRate}
              className="flex-1 text-gray-900"
              editable={!loading}
              placeholder="Enter commission rate"
            />
            <Text className="text-gray-500 ml-2">%</Text>
          </View>

          <Text className="text-xs text-gray-500 mb-4">
            {t('platform_earn_commission', { rate }) || 
              `Platform will earn ${rate}% commission on each sale`}
          </Text>

          {/* Preview */}
          <View className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
            <Text className="text-xs text-red-600 mb-2">
              {t('preview_on_current_sale') || 'Preview on current sales'}
            </Text>

            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-700">
                {t('total_sales') || 'Total Sales'}:
              </Text>
              <Text className="font-semibold">
                {formatPrice(totalSales)}
              </Text>
            </View>

            <View className="flex-row justify-between mt-1">
              <Text className="text-sm text-gray-700">
                {t('commission') || 'Commission'}:
              </Text>
              <Text className="font-semibold text-red-600">
                {formatPrice(commissionValue)}
              </Text>
            </View>

            <View className="flex-row justify-between mt-1 pt-1 border-t border-red-200">
              <Text className="text-sm font-medium text-gray-700">
                {t('vendor_earnings') || 'Vendor Earnings'}:
              </Text>
              <Text className="font-semibold text-green-600">
                {formatPrice(totalSales - commissionValue)}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row justify-between">
            <Pressable
              onPress={handleClose}
              className="flex-1 mr-2 border border-red-500 rounded-full py-3"
              disabled={loading}
            >
              <Text className="text-center text-red-500 font-medium">
                {t('cancel') || 'Cancel'}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              className="flex-1 ml-2 bg-red-600 rounded-full py-3 items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center text-white font-medium">
                  {t('save_change') || 'Save Changes'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditCommissionModal;