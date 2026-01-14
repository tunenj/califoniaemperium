import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const stockItems = [
  { name: "Smart watch Pro", qty: 8 },
  { name: "Ceramic plant pot", qty: 2 },
  { name: "Smart LED Tv", qty: 8 },
];

export default function LowStockAlert() {
  return (
    <View className="mt-6 mb-8 px-4">
      <View className="bg-[#ECEEF6] border border-orange-300 rounded-xl p-4">
        
        {/* HEADER */}
        <View className="flex-row items-center mb-2">
          <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
          <Text className="ml-2 font-semibold text-gray-800 text-sm">
            Low Stock Alert
          </Text>
        </View>

        <Text className="text-xs text-gray-500 mb-3">
          2 products running low
        </Text>

        {/* STOCK LIST */}
        <View className="space-y-2">
          {stockItems.map((item, index) => (
            <View
              key={item.name}
              className="flex-row items-center justify-between bg-white rounded-lg px-3 py-3 border border-gray-200"
              style={{ elevation: 2 }}
            >
              {/* Colored sidebar strip */}
              <View className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 rounded-l-lg" />

              <Text className="text-sm font-medium text-gray-800 ml-3">
                {item.name}
              </Text>

              {/* Stock Badge */}
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: "#FDE2E4" }}
              >
                <Text className="text-[11px] font-medium text-red-600">
                  {item.qty} left
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
