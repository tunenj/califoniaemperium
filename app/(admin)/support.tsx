import React, { memo, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from '@/context/LanguageContext'; // Import hook

/* ================= TYPES ================= */

type Status = "Open" | "In Progress" | "Urgent" | "Resolved";

interface Ticket {
  id: string;
  priority: "High" | "Medium";
  type: string;
  customer: string;
  email: string;
  status: Status;
  createdAt: string;
}

/* ================= DATA ================= */

const SupportDisputes = () => {
  const [filter, setFilter] = useState<Status | "All">("All");
  const { t } = useLanguage(); // Add hook

  const SUMMARY = [
    {
      title: t('open_tickets'),
      value: 5,
      accent: "bg-emerald-300",
      text: "text-emerald-700",
    },
    {
      title: t('in_progress'),
      value: 2,
      accent: "bg-rose-300",
      text: "text-rose-700",
    },
    {
      title: t('urgent'),
      value: 1,
      accent: "bg-orange-300",
      text: "text-orange-700",
    },
    {
      title: t('resolved_today'),
      value: 0,
      accent: "bg-purple-300",
      text: "text-purple-700",
    },
  ];

  const TICKETS: Ticket[] = [
    {
      id: "#TKT-001",
      priority: "High",
      type: "Order not received",
      customer: "Alice Brown",
      email: "alice@gmail.com",
      status: "Resolved",
      createdAt: "Jan 3, 2026",
    },
    {
      id: "#TKT-002",
      priority: "High",
      type: "Refund request",
      customer: "Bob Williams",
      email: "bob@gmail.com",
      status: "Resolved",
      createdAt: "Jan 3, 2026",
    },
    {
      id: "#TKT-003",
      priority: "Medium",
      type: "Vendor complaint",
      customer: "Carol Davis",
      email: "carol@gmail.com",
      status: "In Progress",
      createdAt: "Jan 3, 2026",
    },
    {
      id: "#TKT-004",
      priority: "High",
      type: "Order issue",
      customer: "Bob Williams",
      email: "bob@gmail.com",
      status: "Open",
      createdAt: "Jan 3, 2026",
    },
  ];

  /* ================= STATUS STYLES WITH TRANSLATIONS ================= */

  const STATUS_STYLE: Record<Status, { bg: string; text: string; label: string }> = {
    Open: { 
      bg: "bg-orange-100", 
      text: "text-orange-700",
      label: t('open')
    },
    "In Progress": { 
      bg: "bg-yellow-100", 
      text: "text-yellow-700",
      label: t('in_progress')
    },
    Urgent: { 
      bg: "bg-red-100", 
      text: "text-red-700",
      label: t('urgent')
    },
    Resolved: { 
      bg: "bg-emerald-100", 
      text: "text-emerald-700",
      label: t('resolved')
    },
  };

  const getPriorityTranslation = (priority: "High" | "Medium") => {
    return priority === "High" ? t('high') : t('medium');
  };

  const getFilterTranslation = (filter: Status | "All") => {
    const translations: Record<string, string> = {
      'All': t('all'),
      'Open': t('open'),
      'In Progress': t('in_progress'),
      'Resolved': t('resolved'),
    };
    return translations[filter] || filter;
  };

  /* ================= ROW ================= */

  const TicketRow = memo(({ item }: { item: Ticket }) => {
    const status = STATUS_STYLE[item.status];
    
    return (
      <View className="flex-row px-5 py-4 bg-white border-b border-gray-100">
        {/* Ticket */}
        <View className="w-28">
          <Text className="text-xs font-semibold text-gray-900">
            {item.id}
          </Text>
          <Text
            className={`text-xs font-medium ${
              item.priority === "High"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {getPriorityTranslation(item.priority)}
          </Text>
        </View>

        {/* Type */}
        <Text className="w-36 text-xs text-gray-600">
          {item.type}
        </Text>

        {/* Customer */}
        <View className="w-40">
          <Text className="text-sm text-gray-900">
            {item.customer}
          </Text>
          <Text className="text-xs text-gray-500">
            {item.email}
          </Text>
        </View>

        {/* Status */}
        <View className="w-32">
          <View
            className={`px-3 py-1 rounded-full self-start ${status.bg}`}
          >
            <Text
              className={`text-xs font-semibold ${status.text}`}
            >
              {status.label}
            </Text>
          </View>
        </View>

        {/* Date */}
        <Text className="w-24 text-xs text-gray-600">
          {item.createdAt}
        </Text>

        {/* Action */}
        <Pressable className="w-16 items-center justify-center">
          <Ionicons
            name="ellipsis-vertical"
            size={16}
            color="#6B7280"
          />
        </Pressable>
      </View>
    );
  });

  TicketRow.displayName = "TicketRow";

  const filteredTickets = useMemo(() => {
    if (filter === "All") return TICKETS;
    return TICKETS.filter((t) => t.status === filter);
  }, [filter]);

  const filters: (Status | "All")[] = ["All", "Open", "In Progress", "Resolved"];

  return (
    <View className="flex-1 bg-white">
      {/* ===== HORIZONTAL HEADER ===== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pt-6"
      >
        <View className="px-5 w-[380px]">
          <Text className="text-lg font-semibold text-gray-900">
            {t('support_disputes')}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {t('manage_support_tickets')}
          </Text>

          {/* Search + Filters */}
          <View className="mt-4 flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 h-11">
              <Ionicons name="search" size={18} color="#6B7280" />
              <TextInput
                placeholder={t('search')}
                className="flex-1 ml-2 text-sm text-gray-700"
              />
            </View>

            {filters.map((item) => (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                className={`px-4 h-9 rounded-full justify-center ${
                  filter === item ? "bg-gray-900" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs ${
                    filter === item ? "text-white" : "text-gray-600"
                  }`}
                >
                  {getFilterTranslation(item)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ===== SUMMARY CARDS ===== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-6 pl-5"
      >
        {SUMMARY.map((item, i) => (
          <View
            key={i}
            className="w-44 h-40 bg-white rounded-2xl p-4 border border-gray-200 mr-4 overflow-hidden"
          >
            {/* Accent blob */}
            <View
              className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full ${item.accent}`}
            />

            <Text className="text-xs text-gray-500">
              {item.title}
            </Text>
            <Text
              className={`mt-2 text-2xl font-semibold ${item.text}`}
            >
              {item.value}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* ===== TABLE HEADER ===== */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View className="flex-row bg-gray-100 px-5 py-3 border-y border-gray-200 mt-6">
            <Text className="w-28 text-xs font-semibold text-gray-500">
              {t('ticket')}
            </Text>
            <Text className="w-36 text-xs font-semibold text-gray-500">
              {t('type')}
            </Text>
            <Text className="w-40 text-xs font-semibold text-gray-500">
              {t('customer')}
            </Text>
            <Text className="w-32 text-xs font-semibold text-gray-500">
              {t('status')}
            </Text>
            <Text className="w-24 text-xs font-semibold text-gray-500">
              {t('created')}
            </Text>
            <Text className="w-16 text-xs font-semibold text-gray-500 text-center">
              {t('action')}
            </Text>
          </View>

          <FlatList
            data={filteredTickets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TicketRow item={item} />}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default SupportDisputes;