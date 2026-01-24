import React, { memo, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from '@/context/LanguageContext'; // Import hook

/* ================= TYPES ================= */

type VendorStatus = "Approved" | "Pending" | "Suspended";

type Vendor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  commission: string;
  totalSales: string;
  status: VendorStatus;
};

/* ================= DATA ================= */

const DATA: Vendor[] = [
  {
    id: "1",
    name: "Emily Johnson",
    email: "emily@gmail.com",
    phone: "+234 812 982 778",
    joined: "Dec 30 - 25",
    commission: "10%",
    totalSales: "₦102,000",
    status: "Approved",
  },
  {
    id: "2",
    name: "Kim Johnson",
    email: "kim@gmail.com",
    phone: "+234 812 982 778",
    joined: "Dec 30 - 25",
    commission: "7%",
    totalSales: "₦102,000",
    status: "Pending",
  },
  {
    id: "3",
    name: "Vicky Johnson",
    email: "vicky@gmail.com",
    phone: "+234 812 982 778",
    joined: "Dec 30 - 25",
    commission: "10%",
    totalSales: "₦102,000",
    status: "Suspended",
  },
];

/* ================= STATUS BADGE ================= */

const StatusBadge = memo(({ status }: { status: VendorStatus }) => {
  const { t } = useLanguage(); // Add hook
  
  const statusStyle = (status: VendorStatus) => {
    switch (status) {
      case "Approved":
        return { 
          bg: "bg-green-100", 
          text: "text-green-800",
          label: t('approved')
        };
      case "Pending":
        return { 
          bg: "bg-yellow-100", 
          text: "text-yellow-800",
          label: t('pending')
        };
      case "Suspended":
        return { 
          bg: "bg-red-100", 
          text: "text-red-800",
          label: t('suspended')
        };
    }
  };

  const style = statusStyle(status);

  return (
    <View className={`px-3 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-xs font-medium ${style.text}`}>
        {style.label}
      </Text>
    </View>
  );
});

StatusBadge.displayName = "StatusBadge";

/* ================= ROW ================= */

const VendorRow = memo(function VendorRow({
  item,
}: {
  item: Vendor;
}) {
  return (
    <View className="flex-row border-b border-gray-100 py-3">
      {/* Vendor */}
      <View className="w-44 px-3 flex-row items-center gap-2">
        <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
          <Text className="text-red-600 font-bold">
            {item.name.charAt(0)}
          </Text>
        </View>
        <Text className="font-semibold text-gray-900">
          {item.name}
        </Text>
      </View>

      {/* Contact */}
      <View className="w-44 px-3">
        <Text className="text-xs text-gray-500">
          {item.email}
        </Text>
        <Text className="text-xs text-gray-500">
          {item.phone}
        </Text>
      </View>

      {/* Joined */}
      <Text className="w-28 px-3 text-sm text-gray-600">
        {item.joined}
      </Text>

      {/* Commission */}
      <Text className="w-28 px-3 text-sm text-gray-600">
        {item.commission}
      </Text>

      {/* Total Sales */}
      <Text className="w-32 px-3 text-sm text-red-600">
        {item.totalSales}
      </Text>

      {/* Status */}
      <View className="w-28 px-3">
        <StatusBadge status={item.status} />
      </View>
    </View>
  );
});

VendorRow.displayName = "VendorRow";

/* ================= SCREEN ================= */

export default function VendorManagementScreen() {
  const [activeFilter, setActiveFilter] = useState<
    "All" | VendorStatus
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage(); // Add hook

  const filteredData = useMemo(() => {
    let data =
      activeFilter === "All"
        ? DATA
        : DATA.filter(
            (vendor) => vendor.status === activeFilter
          );

    if (!searchQuery.trim()) return data;

    const q = searchQuery.toLowerCase();

    return data.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(q) ||
        vendor.email.toLowerCase().includes(q) ||
        vendor.phone.toLowerCase().includes(q)
    );
  }, [activeFilter, searchQuery]);

  const getFilterTranslation = (filter: "All" | VendorStatus) => {
    const translations: Record<string, string> = {
      'All': t('all'),
      'Approved': t('approved'),
      'Pending': t('pending'),
      'Suspended': t('suspended'),
    };
    return translations[filter];
  };

  const filters: ("All" | VendorStatus)[] = ["All", "Pending", "Approved", "Suspended"];

  return (
    <View className="flex-1 bg-white px-4">
      <Text className="text-lg font-bold text-gray-900">
        {t('vendor_management')}
      </Text>
      <Text className="text-sm text-gray-500 mb-4">
        {t('review_and_manage_vendors')}
      </Text>

      {/* Search */}
      <View className="flex-row items-center bg-gray-100 rounded-xl border border-gray-400 px-3 py-0.5 mb-4">
        <Ionicons
          name="search-outline"
          size={20}
          color="#6b7280"
        />
        <TextInput
          placeholder={t('search_vendors')}
          placeholderTextColor="#6b7280"
          className="flex-1 ml-2 text-sm text-black"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View className="flex-row gap-2 mb-4">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;

          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`px-4 py-1 rounded-full ${
                isActive ? "bg-red-600" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-xs ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-gray-600"
                }`}
              >
                {getFilterTranslation(filter)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TABLE */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VendorRow item={item} />
            )}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <View className="flex-row border-b border-gray-200 bg-white">
                <Text className="w-44 px-3 text-sm font-semibold text-gray-500">
                  {t('vendor')}
                </Text>
                <Text className="w-44 px-3 text-sm font-semibold text-gray-500">
                  {t('contact')}
                </Text>
                <Text className="w-28 px-3 text-sm font-semibold text-gray-500">
                  {t('joined')}
                </Text>
                <Text className="w-28 px-3 text-sm font-semibold text-gray-500">
                  {t('commission')}
                </Text>
                <Text className="w-32 px-3 text-sm font-semibold text-gray-500">
                  {t('total_sales')}
                </Text>
                <Text className="w-32 px-6 text-sm font-semibold text-gray-500">
                  {t('status')}
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}