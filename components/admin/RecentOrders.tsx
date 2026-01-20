import React from "react";
import { View, Text } from "react-native";

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
    id: "ORD-0001",
    customer: "Alice Brown",
    total: "₦20,000",
    status: "Shipped",
    date: "Jan 3, 2025",
  },
  {
    id: "ORD-0001",
    customer: "Alice Brown",
    total: "₦20,000",
    status: "Processed",
    date: "Jan 3, 2025",
  },
  {
    id: "ORD-0001",
    customer: "Alice Brown",
    total: "₦20,000",
    status: "Pending",
    date: "Jan 3, 2025",
  },
  {
    id: "ORD-0001",
    customer: "Alice Brown",
    total: "₦20,000",
    status: "Delivered",
    date: "Jan 3, 2025",
  },
];

const statusStyles: Record<
  OrderStatus,
  { bg: string; text: string }
> = {
  Delivered: {
    bg: "bg-green-100",
    text: "text-green-600",
  },
  Shipped: {
    bg: "bg-purple-100",
    text: "text-purple-600",
  },
  Processed: {
    bg: "bg-red-100",
    text: "text-red-500",
  },
  Pending: {
    bg: "bg-orange-100",
    text: "text-orange-500",
  },
};

const RecentOrders = () => {
  return (
    <View className="px-4 mt-6">
      {/* Title */}
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        Recent Order
      </Text>

      {/* Card */}
      <View className="bg-white rounded-2xl border border-[#F8B4B4] overflow-hidden gap-3">
        {/* Header */}
        <View className="flex-row bg-[#FDECEF] px-4 py-3">
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            Order #
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            Customer
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            Total
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            Status
          </Text>
          <Text className="flex-1 text-xs font-semibold text-gray-700">
            Date
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
                    {order.status}
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