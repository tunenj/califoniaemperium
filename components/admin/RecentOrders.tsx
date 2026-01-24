import React from "react";
import { View, Text } from "react-native";
import { useLanguage } from '@/context/LanguageContext'; // Import hook

type OrderStatus =
  | "Delivered"
  | "Shipped"
  | "Processed"
  | "Pending";

interface Order {
  id: string;
  customer: string;
  total: string;
  status: OrderStatus;
  date: string;
}

const ORDERS: Order[] = [
  {
    id: "ORD-0001",
    customer: "Alice Brown",
    total: "₦20,000",
    status: "Delivered",
    date: "Jan 3, 2025",
  },
  {
    id: "ORD-0002",
    customer: "Alice Brown",
    total: "₦20,000",
    status: "Shipped",
    date: "Jan 3, 2025",
  },
  {
    id: "ORD-0003",
    customer: "Alice Brown",
    total: "₦20,000",
    status: "Processed",
    date: "Jan 3, 2025",
  },
  {
    id: "ORD-0004",
    customer: "Alice Brown",
    total: "₦20,000",
    status: "Pending",
    date: "Jan 3, 2025",
  },
  {
    id: "ORD-0005",
    customer: "Alice Brown",
    total: "₦20,000",
    status: "Delivered",
    date: "Jan 3, 2025",
  },
];

const RecentOrders = () => {
  const { t } = useLanguage(); // Add hook

  const statusStyles: Record<
    OrderStatus,
    { bg: string; text: string; label: string }
  > = {
    Delivered: {
      bg: "bg-green-100",
      text: "text-green-600",
      label: t('delivered'),
    },
    Shipped: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      label: t('shipped'),
    },
    Processed: {
      bg: "bg-red-100",
      text: "text-red-500",
      label: t('processed'),
    },
    Pending: {
      bg: "bg-orange-100",
      text: "text-orange-500",
      label: t('pending'),
    },
  };

  return (
    <View className="px-4 mt-6">
      {/* Title */}
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        {t('recent_orders')}
      </Text>

      {/* Card */}
      <View className="bg-white rounded-2xl border border-[#F8B4B4] overflow-hidden gap-3">
        {/* Header */}
        <View className="flex-row bg-[#FDECEF] px-4 py-3">
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            {t('order_number')}
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            {t('customer')}
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            {t('total')}
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            {t('status')}
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            {t('date')}
          </Text>
        </View>

        {/* Rows */}
        {ORDERS.map((order, index) => {
          const status = statusStyles[order.status];

          return (
            <View
              key={`${order.id}-${index}`}
              className="flex-row items-center px-4 py-3 border-t border-gray-100"
            >
              <Text className="flex-1 text-xs text-gray-700">
                {order.id}
              </Text>

              <Text className="flex-1 text-xs text-gray-700">
                {order.customer}
              </Text>

              <Text className="flex-1 text-xs font-semibold text-gray-900">
                {order.total}
              </Text>

              <View className="flex-1">
                <View
                  className={`self-start px-1 py-1 p-2 rounded-full ${status.bg}`}
                >
                  <Text
                    className={`text-xs font-medium ${status.text}`}
                  >
                    {status.label}
                  </Text>
                </View>
              </View>

              <Text className="flex-1 text-xs text-gray-600">
                {order.date}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default RecentOrders;