import { View, Text } from "react-native";
import { OrderCard } from "../OrderCard/OrderCard";

export default function RecentOrders() {
  return (
    <View className="mt-6 px-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base font-semibold text-gray-800">Recent Order</Text>
        <Text className="text-red-500 text-base">View All</Text>
      </View>
      <View className="space-y-3 rounded-xl border border-orange-300 shadow-sm">
        <OrderCard id="2025-04" buyer="Emily Johnson" amount="₦20,000" status="Pending" />
        <OrderCard id="2025-04" buyer="Michael Chen" amount="₦20,000" status="Delivered" />
        <OrderCard id="2025-04" buyer="Sarah Williams" amount="₦20,000" status="Delivered" />
      </View>
    </View>
  );
}
