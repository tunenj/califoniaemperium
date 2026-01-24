import { View, Text } from "react-native";
import { OrderCard } from "../OrderCard/OrderCard";
import { useLanguage } from "@/context/LanguageContext"; // Add this import

export default function RecentOrders() {
  const { t } = useLanguage(); // Add this hook

  return (
    <View className="mt-6 px-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base font-semibold text-gray-800">
          {t("recent_orders") || "Recent Order"} {/* Use translation */}
        </Text>
        <Text className="text-red-500 text-base">
          {t("view_all") || "View All"} {/* Use translation */}
        </Text>
      </View>
      <View className="space-y-3 rounded-xl border border-orange-300 shadow-sm">
        <OrderCard id="2025-04" buyer="Emily Johnson" amount="₦20,000" status="Pending" />
        <OrderCard id="2025-04" buyer="Michael Chen" amount="₦20,000" status="Delivered" />
        <OrderCard id="2025-04" buyer="Sarah Williams" amount="₦20,000" status="Delivered" />
      </View>
    </View>
  );
}