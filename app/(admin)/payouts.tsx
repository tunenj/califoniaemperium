import React, { memo, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from '@/context/LanguageContext'; // Import hook

/* ================= TYPES ================= */

type StatusType = "All" | "Pending" | "Processing" | "Completed";

interface PayoutRow {
  id: string;
  vendor: string;
  email: string;
  amount: number;
  method: string;
  status: Exclude<StatusType, "All">;
  date: string;
}

interface PendingBalance {
  id: string;
  vendor: string;
  email: string;
  amount: number;
}

/* ================= DATA ================= */

const PAYOUTS: PayoutRow[] = [
  {
    id: "TXN-78901234",
    vendor: "Emily Tech",
    email: "emily@gmail.com",
    amount: 200000,
    method: "paypal",
    status: "Completed",
    date: "Jan 5, 2026",
  },
  {
    id: "TXN-78901235",
    vendor: "Fashion Hub",
    email: "emily@gmail.com",
    amount: 200000,
    method: "paypal",
    status: "Pending",
    date: "Jan 5, 2026",
  },
  {
    id: "TXN-78901236",
    vendor: "Sport Hub",
    email: "king@gmail.com",
    amount: 200000,
    method: "bank transfer",
    status: "Processing",
    date: "Jan 5, 2026",
  },
];

const PENDING_BALANCES: PendingBalance[] = [
  {
    id: "1",
    vendor: "TechZone Electronics",
    email: "john@techzone.com",
    amount: 100000,
  },
  {
    id: "2",
    vendor: "Fashion Forward",
    email: "jane@fashion.com",
    amount: 100000,
  },
];

/* ================= ROW ================= */

const PayoutRowItem = memo(({ item }: { item: PayoutRow }) => {
  const { t } = useLanguage(); // Add hook
  
  const initial = item.vendor.charAt(0).toUpperCase();

  const statusMap = {
    Completed: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: t('completed'),
    },
    Pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: t('pending'),
    },
    Processing: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      label: t('processing'),
    },
  };

  const getMethodTranslation = (method: string) => {
    const methodTranslations: Record<string, string> = {
      'paypal': t('paypal'),
      'bank transfer': t('bank_transfer'),
    };
    return methodTranslations[method] || method;
  };

  const status = statusMap[item.status];

  return (
    <View className="flex-row px-5 py-4 bg-white border-b border-gray-100">
      {/* Vendor */}
      <View className="w-44 flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
          <Text className="text-red-600 font-bold">{initial}</Text>
        </View>
        <View>
          <Text className="text-sm font-medium text-gray-900">
            {item.vendor}
          </Text>
          <Text className="text-xs text-gray-500">{item.email}</Text>
        </View>
      </View>

      {/* Amount */}
      <Text className="w-28 text-sm text-green-600">
        ₦{item.amount.toLocaleString()}
      </Text>

      {/* Method */}
      <Text className="w-28 text-sm text-gray-600 capitalize">
        {getMethodTranslation(item.method)}
      </Text>

      {/* Transaction ID */}
      <Text className="w-40 text-sm text-gray-500">{item.id}</Text>

      {/* Status */}
      <View className="w-32">
        <View className={`px-3 py-1 rounded-full self-start ${status.bg}`}>
          <Text className={`text-xs font-semibold ${status.text}`}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Date */}
      <Text className="w-28 text-sm text-gray-500">{item.date}</Text>

      {/* Action */}
      <Pressable className="w-16 items-center justify-center">
        <Ionicons name="ellipsis-vertical" size={16} color="#6B7280" />
      </Pressable>
    </View>
  );
});

PayoutRowItem.displayName = "PayoutRowItem";

/* ================= SCREEN ================= */

const PayoutManagement = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusType>("All");
  const { t } = useLanguage(); // Add hook

  const filteredData = useMemo(() => {
    return PAYOUTS.filter((item) => {
      const matchesSearch =
        item.vendor.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "All" ? true : item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const statusFilters = ["All", "Pending", "Processing", "Completed"] as StatusType[];
  
  const getStatusTranslation = (status: StatusType) => {
    const translations: Record<StatusType, string> = {
      'All': t('all'),
      'Pending': t('pending'),
      'Processing': t('processing'),
      'Completed': t('completed'),
    };
    return translations[status];
  };

  return (
    <View className="flex-1 bg-white -mt-7">
      {/* HEADER */}
      <View className="px-5 pt-6">
        <Text className="text-lg font-semibold text-gray-900">
          {t('payout_management')}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t('process_and_track_payouts')}
        </Text>

        {/* SEARCH */}
        <View className="mt-4 flex-row items-center bg-gray-100 rounded-xl px-4 h-11">
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            placeholder={t('search_vendor_transaction')}
            placeholderTextColor="#6b7280"
            className="flex-1 ml-2 text-sm text-gray-700"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* STATUS FILTER */}
      <View className="flex-row gap-3 px-5 mt-4">
        {statusFilters.map((item) => (
          <Pressable
            key={item}
            onPress={() => setStatus(item)}
            className={`px-4 py-2 rounded-full ${
              status === item
                ? "bg-gray-900"
                : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                status === item
                  ? "text-white"
                  : "text-gray-600"
              }`}
            >
              {getStatusTranslation(item)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* SUMMARY CARDS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-6 mb-4 pl-4"
      >
        {[
          { title: t('pending_payout'), value: "₦2,000,000", accent: "bg-orange-300" },
          { title: t('processing_count'), value: "2", accent: "bg-emerald-300" },
          { title: t('completed_payout'), value: "₦2,000,000", accent: "bg-green-300" },
          { title: t('total_vendors'), value: "20", accent: "bg-purple-300" },
        ].map((item, index) => (
          <View
            key={index}
            className="w-44 h-44 bg-white rounded-2xl p-3 border border-gray-200 overflow-hidden mr-3"
          >
            <View
              className={`absolute bottom-[-24px] right-[-24px] w-32 h-36 rounded-full ${item.accent}`}
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
          <View className="flex-row bg-gray-100 px-5 py-3 border-y border-gray-200">
            <Text className="w-44 text-xs font-semibold text-gray-500">
              {t('vendor')}
            </Text>
            <Text className="w-28 text-xs font-semibold text-gray-500">
              {t('amount')}
            </Text>
            <Text className="w-28 text-xs font-semibold text-gray-500">
              {t('method')}
            </Text>
            <Text className="w-40 text-xs font-semibold text-gray-500">
              {t('transaction_id')}
            </Text>
            <Text className="w-32 text-xs font-semibold text-gray-500">
              {t('status')}
            </Text>
            <Text className="w-28 text-xs font-semibold text-gray-500">
              {t('date')}
            </Text>
            <Text className="w-16 text-xs font-semibold text-gray-500 text-center">
              {t('action')}
            </Text>
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PayoutRowItem item={item} />}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </View>
      </ScrollView>

      {/* VENDOR PENDING BALANCES */}
      <View className="px-5 mt-8 mb-10">
        <Text className="text-sm font-semibold text-gray-900 mb-3">
          {t('vendor_pending_balances')}
        </Text>

        {PENDING_BALANCES.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2"
          >
            <View>
              <Text className="text-sm font-medium text-gray-900">
                {item.vendor}
              </Text>
              <Text className="text-xs text-gray-500">{item.email}</Text>
            </View>

            <View className="flex-row items-center gap-3">
              <Text className="text-sm font-semibold text-green-600">
                ₦{item.amount.toLocaleString()}
              </Text>
              <Pressable className="px-3 py-1 rounded-full bg-green-100">
                <Text className="text-xs font-medium text-green-700">
                  {t('pay_now')}
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PayoutManagement;