import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from '@/context/LanguageContext'; // Add import

type MessageStatus = "read" | "unread" | "replied";

type Message = {
  id: string;
  name: string;
  email: string;
  date: string;
  subject: string;
  preview: string;
  status: MessageStatus;
};

const MESSAGES: Message[] = [
  {
    id: "1",
    name: "Jennifer Lee",
    email: "jennifer@example.com",
    date: "Dec 30",
    subject: "Question about shipping",
    preview: "Hi, I placed an order yesterday and...",
    status: "read",
  },
  {
    id: "2",
    name: "Robert Taylor",
    email: "jennifer@example.com",
    date: "Dec 30",
    subject: "Question about shipping",
    preview: "Hi, I placed an order yesterday and...",
    status: "unread",
  },
  {
    id: "3",
    name: "Jennifer Lee",
    email: "jennifer@example.com",
    date: "Dec 30",
    subject: "Question about shipping",
    preview: "Hi, I placed an order yesterday and...",
    status: "unread",
  },
  {
    id: "4",
    name: "Amanda Garcia",
    email: "amanda@example.com",
    date: "Dec 30",
    subject: "I received my order but the size...",
    preview: "I received my order but the size doesn't fit...",
    status: "replied",
  },
];

export default function MessagesScreen() {
  const { t } = useLanguage(); // Add hook
  const [activeTab, setActiveTab] = useState<
    "All" | "Unread" | "Replied"
  >("All");
  const [search, setSearch] = useState("");

  const filteredMessages = MESSAGES.filter((msg) => {
    if (activeTab === "Unread") return msg.status === "unread";
    if (activeTab === "Replied") return msg.status === "replied";
    return true;
  });

  const tabs = [t('all'), t('unread'), t('replied')];

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      {/* Header */}
      <Text className="text-lg font-semibold text-gray-900">
        {t('messages')}
      </Text>
      <Text className="text-xs text-gray-400 mt-1">
        {t('customer_inquiries_communications')}
      </Text>

      {/* Filters */}
      <View className="flex-row gap-2 mt-4">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            className={`px-3 py-1.5 rounded-full border ${
              activeTab === tab
                ? "bg-gray-900 border-gray-900"
                : "border-gray-200"
            }`}
          >
            <Text
              className={`text-xs ${
                activeTab === tab
                  ? "text-white"
                  : "text-gray-600"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-1 mt-4">
        <Ionicons name="search" size={16} color="#9ca3af" />
        <TextInput
          placeholder={t('search_messages')}
          value={search}
          onChangeText={setSearch}
          className="ml-2 flex-1 text-xs text-gray-700"
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Messages List */}
      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        className="mt-5"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-gray-50 rounded-xl p-4 mb-3"
            activeOpacity={0.85}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-row items-center">
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    item.status === "unread"
                      ? "bg-red-100"
                      : "bg-gray-200"
                  }`}
                >
                  <Ionicons
                    name={
                      item.status === "unread"
                        ? "mail-unread-outline"
                        : "mail-outline"
                    }
                    size={16}
                    color={
                      item.status === "unread"
                        ? "#ef4444"
                        : "#6b7280"
                    }
                  />
                </View>

                <View className="ml-3">
                  <Text className="text-sm font-medium text-gray-900">
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {item.email}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-xs text-gray-400">
                  {item.date}
                </Text>

                {item.status === "unread" && (
                  <View className="mt-1 px-2 py-0.5 rounded-full bg-red-100">
                    <Text className="text-[10px] text-red-500">
                      {t('unread')}
                    </Text>
                  </View>
                )}

                {item.status === "read" && (
                  <View className="mt-1 px-2 py-0.5 rounded-full border border-gray-300">
                    <Text className="text-[10px] text-gray-500">
                      {t('read')}
                    </Text>
                  </View>
                )}

                {item.status === "replied" && (
                  <View className="mt-1 px-2 py-0.5 rounded-full border border-green-300">
                    <Text className="text-[10px] text-green-600">
                      {t('replied')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Text className="text-xs font-medium text-gray-800 mt-3">
              {item.subject}
            </Text>
            <Text
              className="text-xs text-gray-500 mt-1"
              numberOfLines={1}
            >
              {item.preview}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}