import React from "react";
import { View, Text } from "react-native";
import { useLanguage } from "@/context/LanguageContext";

interface OrderCardProps {
  id: string;
  buyer: string;
  amount: string | number;
  status: "Pending" | "Processing" | "Delivered" | "Cancelled" | "Completed";
  itemsCount?: number;
  date?: string;
  paymentStatus?: string;
}

export function OrderCard({ 
  id, 
  buyer, 
  amount, 
  status, 
  itemsCount = 1, 
  date, 
  paymentStatus 
}: OrderCardProps) {
  const { t } = useLanguage();

  // Format status to ensure first letter uppercase for the object keys
  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() as "Pending" | "Processing" | "Delivered" | "Cancelled" | "Completed";
  
  const deepBgColor = {
    Pending: "#F59E0B",
    Processing: "#2563EB",
    Delivered: "#16A34A",
    Cancelled: "#DC2626",
    Completed: "#6B7280",
  }[formattedStatus];

  const dotColor = {
    Pending: "#DC2626",      // red dot
    Processing: "#2563EB",   // blue dot
    Delivered: "#16A34A",    // green dot
    Cancelled: "#DC2626",    // red dot
    Completed: "#6B7280",    // gray dot
  }[formattedStatus];

  // Payment status color
  const getPaymentStatusColor = (paymentStatus?: string) => {
    if (!paymentStatus) return "#9CA3AF";
    return paymentStatus.toLowerCase() === 'paid' ? "#16A34A" : "#F59E0B";
  };

  // Translate status text
  const translatedStatus = t(status.toLowerCase()) || status;

  // Format the order number (remove ORD- prefix if it exists)
  const orderNumber = id.replace('ORD-', '');

  return (
    <View className="bg-[#ECEEF6] rounded-xl px-4 py-4 mb-3">
      <View className="flex-row items-center justify-between">
        {/* LEFT */}
        <View className="flex-row items-center gap-3 flex-1">
          {/* Avatar = first letter of status */}
          <View
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: deepBgColor }}
          >
            <Text className="font-semibold text-xs text-white">
              {translatedStatus.charAt(0)}
            </Text>
          </View>

          {/* Buyer + Order Info */}
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-sm">{buyer}</Text>

            <View className="flex-row items-center mt-1 flex-wrap">
              <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: dotColor }} />
              <Text className="text-xs text-gray-600">
                {t("order_prefix") || "ORD"}-{orderNumber}
              </Text>

              {/* Items count dot */}
              <View className="w-2 h-2 rounded-full mx-2" style={{ backgroundColor: "#16A34A" }} />
              <Text className="text-xs text-gray-600">
                {itemsCount} {itemsCount === 1 ? t('item') || 'item' : t('items') || 'items'}
              </Text>

              {/* Date if available */}
              {date && (
                <>
                  <View className="w-2 h-2 rounded-full mx-2" style={{ backgroundColor: "#9CA3AF" }} />
                  <Text className="text-xs text-gray-500">{date}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* RIGHT */}
        <View className="items-end ml-2">
          <Text className="font-semibold text-gray-900 text-sm">{amount}</Text>

          <View className="flex-row items-center mt-1 gap-1">
            {/* Payment status badge if available */}
            {paymentStatus && (
              <View
                className="px-1.5 py-0.5 rounded-full mr-1"
                style={{ backgroundColor: getPaymentStatusColor(paymentStatus) + '20' }}
              >
                <Text 
                  className="text-[10px] font-medium"
                  style={{ color: getPaymentStatusColor(paymentStatus) }}
                >
                  {paymentStatus}
                </Text>
              </View>
            )}

            {/* Order status badge */}
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: deepBgColor }}
            >
              <Text className="text-xs font-medium text-white">
                {translatedStatus}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}