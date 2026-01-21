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

const SUMMARY = [
  {
    title: "Open Tickets",
    value: 5,
    accent: "bg-emerald-300",
    text: "text-emerald-700",
  },
  {
    title: "In Progress",
    value: 2,
    accent: "bg-rose-300",
    text: "text-rose-700",
  },
  {
    title: "Urgent",
    value: 1,
    accent: "bg-orange-300",
    text: "text-orange-700",
  },
  {
    title: "Resolved Today",
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

/* ================= STATUS STYLES ================= */

const STATUS_STYLE: Record<Status, { bg: string; text: string }> = {
  Open: { bg: "bg-orange-100", text: "text-orange-700" },
  "In Progress": { bg: "bg-yellow-100", text: "text-yellow-700" },
  Urgent: { bg: "bg-red-100", text: "text-red-700" },
  Resolved: { bg: "bg-emerald-100", text: "text-emerald-700" },
};

/* ================= ROW ================= */

const TicketRow = memo(({ item }: { item: Ticket }) => {
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
          {item.priority}
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
          className={`px-3 py-1 rounded-full self-start ${STATUS_STYLE[item.status].bg}`}
        >
          <Text
            className={`text-xs font-semibold ${STATUS_STYLE[item.status].text}`}
          >
            {item.status}
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

/* ================= SCREEN ================= */

export default function SupportDisputes() {
  const [filter, setFilter] = useState<Status | "All">("All");

  const filteredTickets = useMemo(() => {
    if (filter === "All") return TICKETS;
    return TICKETS.filter((t) => t.status === filter);
  }, [filter]);

  return (
    <View className="flex-1 bg-white">
      {/* ===== HORIZONTAL HEADER (IMAGE 1 + 2) ===== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pt-6"
      >
        <View className="px-5 w-[380px]">
          <Text className="text-lg font-semibold text-gray-900">
            Support & Disputes
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Manage customer support tickets and disputes
          </Text>

          {/* Search + Filters */}
          <View className="mt-4 flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 h-11">
              <Ionicons name="search" size={18} color="#6B7280" />
              <TextInput
                placeholder="Search..."
                className="flex-1 ml-2 text-sm text-gray-700"
              />
            </View>

            {["All", "Open", "In Progress", "Resolved"].map((item) => (
              <Pressable
                key={item}
                onPress={() => setFilter(item as any)}
                className={`px-4 h-9 rounded-full justify-center ${
                  filter === item ? "bg-gray-900" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs ${
                    filter === item ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item}
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
              Ticket
            </Text>
            <Text className="w-36 text-xs font-semibold text-gray-500">
              Type
            </Text>
            <Text className="w-40 text-xs font-semibold text-gray-500">
              Customer
            </Text>
            <Text className="w-32 text-xs font-semibold text-gray-500">
              Status
            </Text>
            <Text className="w-24 text-xs font-semibold text-gray-500">
              Created
            </Text>
            <Text className="w-16 text-xs font-semibold text-gray-500 text-center">
              Action
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
}
