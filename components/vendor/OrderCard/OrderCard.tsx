import React from "react";
import { View, Text } from "react-native";

interface OrderCardProps {
  id: string;
  buyer: string;
  amount: string | number;
  status: "Pending" | "Processing" | "Delivered" | "Cancelled" | "Completed";
}

export function OrderCard({ id, buyer, amount, status }: OrderCardProps) {
  const deepBgColor = {
    Pending: "#F59E0B",
    Processing: "#2563EB",
    Delivered: "#16A34A",
    Cancelled: "#DC2626",
    Completed: "#6B7280",
  }[status];

  const dotColor = {
    Pending: "#DC2626",      // red dot
    Processing: "#2563EB",   // blue dot
    Delivered: "#16A34A",    // green dot
    Cancelled: "#DC2626",    // red dot
    Completed: "#6B7280",    // gray dot
  }[status];

  return (
    <View className="bg-[#ECEEF6] rounded-xl px-4 py-4">
      <View className="flex-row items-center justify-between">
        {/* LEFT */}
        <View className="flex-row items-center gap-3">

          {/* Avatar = first letter of status */}
          <View
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: deepBgColor }}
          >
            <Text className="font-semibold text-xs text-white">
              {status.charAt(0)}
            </Text>
          </View>

          {/* Buyer + Order Info */}
          <View>
            <Text className="font-semibold text-gray-900 text-sm">{buyer}</Text>

            <View className="flex-row items-center mt-1">
              <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: dotColor }} />
              <Text className="text-xs text-gray-600">ORD-{id}</Text>

              {/* static green dot for items */}
              <View className="w-2 h-2 rounded-full mx-2" style={{ backgroundColor: "#16A34A" }} />
              <Text className="text-xs text-gray-600">1 item</Text>
            </View>
          </View>
        </View>

        {/* RIGHT */}
        <View className="items-end">
          <Text className="font-semibold text-gray-900 text-sm">{amount}</Text>

          <View
            className="px-2 py-0.5 rounded-full mt-1"
            style={{ backgroundColor: deepBgColor }}
          >
            <Text className="text-xs font-medium text-white">{status}</Text>
          </View>
        </View>

      </View>
    </View>
  );
}
