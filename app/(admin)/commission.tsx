import React, { memo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EditCommissionTable from "@/app/commissionTable/EditCommissionModal";

/* ================= TYPES ================= */

interface Vendor {
  id: string;
  name: string;
  email: string;
  sales: number;
  commissionRate: number;
}

interface EarningsRow {
  id: string;
  platformEarnings: number;
  vendorEarnings: number;
  orders: number;
}

/* ================= DATA ================= */

const INITIAL_VENDORS: Vendor[] = [
  { id: "1", name: "Emily Tech", email: "emily@gmail.com", sales: 102000, commissionRate: 0.1 },
  { id: "2", name: "Fashion Hub", email: "emily@gmail.com", sales: 102000, commissionRate: 0.1 },
  { id: "3", name: "Sport Hub", email: "king@gmail.com", sales: 102000, commissionRate: 0.1 },
  { id: "4", name: "Vicky Store", email: "vicky@gmail.com", sales: 102000, commissionRate: 0.07 },
  { id: "5", name: "Emily Tech", email: "emily@gmail.com", sales: 102000, commissionRate: 0.1 },
];

const EARNINGS: EarningsRow[] = [
  { id: "1", platformEarnings: 102000, vendorEarnings: 102000, orders: 10 },
  { id: "2", platformEarnings: 102000, vendorEarnings: 102000, orders: 10 },
  { id: "3", platformEarnings: 102000, vendorEarnings: 102000, orders: 10 },
  { id: "4", platformEarnings: 102000, vendorEarnings: 102000, orders: 7 },
  { id: "5", platformEarnings: 102000, vendorEarnings: 102000, orders: 10 },
];

/* ================= ROW ================= */

const TableRow = memo(
  ({
    vendor,
    earnings,
    onEdit,
  }: {
    vendor: Vendor;
    earnings: EarningsRow;
    onEdit: () => void;
  }) => {
    const initial = vendor.name.charAt(0).toUpperCase();

    return (
      <View className="flex-row px-5 py-4 bg-white border-b border-gray-100">
        <View className="w-44 flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
            <Text className="text-red-600 font-bold">{initial}</Text>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-900">
              {vendor.name}
            </Text>
            <Text className="text-xs text-gray-500">
              {vendor.email}
            </Text>
          </View>
        </View>

        <Text className="w-32 text-sm text-green-600">
          ₦{vendor.sales.toLocaleString()}
        </Text>

        <Text className="w-28 text-sm text-gray-700">
          {(vendor.commissionRate * 100).toFixed(0)}%
        </Text>

        <Text className="w-36 text-sm text-green-600">
          ₦{earnings.platformEarnings.toLocaleString()}
        </Text>

        <Text className="w-36 text-sm text-red-500">
          ₦{earnings.vendorEarnings.toLocaleString()}
        </Text>

        <Text className="w-20 text-sm text-gray-700">
          {earnings.orders}
        </Text>

        <Pressable
          className="w-16 items-center justify-center"
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={18} color="#6B7280" />
        </Pressable>
      </View>
    );
  }
);

TableRow.displayName = "TableRow";

/* ================= COMMISSION STRUCTURE ================= */

const CommissionStructure = memo(() => (
  <View className="px-5 mt-4 mb-16">
    <Text className="text-sm font-semibold text-gray-900 mb-4">
      Commission Structure
    </Text>

    <View className="flex-row gap-4">
      <View className="flex-1 bg-white rounded-xl border border-red-200 p-4">
        <Text className="text-xs font-semibold text-red-600">Standard Rate</Text>
        <Text className="text-lg font-bold text-red-600 mt-1">10%</Text>
        <Text className="text-xs text-gray-500 mt-2">
          Default commission for new vendors
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-xl border border-purple-200 p-4">
        <Text className="text-xs font-semibold text-purple-600">
          Volume Discount
        </Text>
        <Text className="text-lg font-bold text-purple-600 mt-1">7%</Text>
        <Text className="text-xs text-gray-500 mt-2">
          ₦100k+ monthly sales
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-xl border border-red-200 p-4">
        <Text className="text-xs font-semibold text-red-600">
          Premium Partners
        </Text>
        <Text className="text-lg font-bold text-red-600 mt-1">5%</Text>
        <Text className="text-xs text-gray-500 mt-2">
          Enterprise vendors
        </Text>
      </View>
    </View>
  </View>
));

CommissionStructure.displayName = "CommissionStructure";

/* ================= SCREEN ================= */

const CommissionManagement = () => {
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const handleSaveCommission = (newRate: number) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === selectedVendor?.id
          ? { ...v, commissionRate: newRate / 100 }
          : v
      )
    );
    setSelectedVendor(null);
  };

  return (
    <View className="flex-1 bg-white -mt-6">
      {/* HEADER */}
      <View className="px-5 pt-6">
        <Text className="text-lg font-semibold text-gray-900">
          Commission Management
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Manage vendor commissions rates and track earnings
        </Text>

        <View className="mt-4 flex-row items-center rounded-xl bg-gray-100 px-4 h-11">
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            placeholder="Search vendors..."
             placeholderTextColor="#6b7280"
            className="flex-1 ml-2 text-sm text-gray-700"
          />
        </View>
      </View>

      {/* ✅ SUMMARY CARDS — UNCHANGED DESIGN */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-6 mb-4 pl-4"
      >
        {[
          { title: "Total Platform Earnings", value: "₦2,000,000", accent: "bg-emerald-300" },
          { title: "Total Commission", value: "₦2,000,000", accent: "bg-green-300" },
          { title: "Avg. Commission Rate", value: "8.2%", accent: "bg-orange-300" },
          { title: "Active Vendors", value: "20", accent: "bg-purple-300" },
        ].map((item, index) => (
          <View
            key={index}
            className="w-44 h-44 bg-white rounded-2xl p-3 border border-gray-200 overflow-hidden mr-3"
          >
            <View
              className={`absolute bottom-[-24px] right-[-24px] w-32 h-40 rounded-full ${item.accent}`}
            />
            <Text className="text-xs text-gray-500 mb-2">
              {item.title}
            </Text>
            <Text className="text-xl font-bold text-gray-900">
              {item.value}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* TABLE */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <FlatList
            data={vendors}
            keyExtractor={(item) => item.id}
            stickyHeaderIndices={[0]}
            ListHeaderComponent={() => (
              <View className="flex-row bg-gray-100 px-5 py-3 border-y border-gray-200">
                <Text className="w-44 text-xs font-semibold text-gray-500">Vendor</Text>
                <Text className="w-32 text-xs font-semibold text-gray-500">Total Sales</Text>
                <Text className="w-28 text-xs font-semibold text-gray-500">Commission</Text>
                <Text className="w-36 text-xs font-semibold text-gray-500">Platform Earnings</Text>
                <Text className="w-36 text-xs font-semibold text-gray-500">Vendor Earnings</Text>
                <Text className="w-20 text-xs font-semibold text-gray-500">Orders</Text>
                <Text className="w-16 text-xs font-semibold text-gray-500 text-center">Action</Text>
              </View>
            )}
            renderItem={({ item, index }) => (
              <TableRow
                vendor={item}
                earnings={EARNINGS[index]}
                onEdit={() => setSelectedVendor(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </ScrollView>

      <CommissionStructure />

      {selectedVendor && (
        <EditCommissionTable
          visible
          vendorName={selectedVendor.name}
          vendorEmail={selectedVendor.email}
          commissionRate={selectedVendor.commissionRate * 100}
          totalSales={selectedVendor.sales}
          onClose={() => setSelectedVendor(null)}
          onSave={handleSaveCommission}
        />
      )}
    </View>
  );
};

export default CommissionManagement;
