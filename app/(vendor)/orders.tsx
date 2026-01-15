import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Order = {
    id: string;
    customer: string;
    date: string;
    items: number;
};

const ORDERS: Order[] = Array.from({ length: 6 }).map(() => ({
    id: "ORD-2025-001",
    customer: "Emily Johnson",
    date: "Dec 30-25",
    items: 2,
}));

export default function OrdersScreen() {
    const [search, setSearch] = useState("");

    return (
        <View className="flex-1 bg-white px-4 pt-4">
            {/* Header */}
            <Text className="text-xl font-semibold">Orders</Text>
            <Text className="text-sm text-black mt-1">
                Manage and track customers orders.
            </Text>

            {/* Search + Filter */}
            <View className="flex-row items-center mt-4 space-x-3 gap-2">
                <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-0.5">
                    <Ionicons name="search" size={18} color="#9ca3af" />
                    <TextInput
                        placeholder="search order..."
                        value={search}
                        onChangeText={setSearch}
                        className="ml-2 flex-1 text-sm text-gray-700"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                <TouchableOpacity className="flex-row items-center border border-gray-200 rounded-full px-4 py-2">
                    <Text className="text-sm text-gray-700 mr-1">All Status</Text>
                    <Ionicons name="chevron-down" size={16} color="#6b7280" />
                </TouchableOpacity>
            </View>

            {/* Table Header */}
            <View className="flex-row bg-gray-100 p-6 mt-4 mb-4 text-black text-xs -mx-5">
                <Text className="w-1/4">Orders</Text>
                <Text className="w-1/4 ml-2">
                    Customer
                </Text>
                <Text className="w-1/5 text-right">Date</Text>
                <Text className="w-1/5 text-right">Item</Text>
            </View>

            {/* Orders List */}
            <FlatList
                data={ORDERS}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item }) => (
                    <View className="flex-row py-3 border-b border-gray-100 items-center">
                        <Text className="w-1/6 text-sm mr-2 text-gray-700">{item.id}</Text>

                        <View className="w-1/4 flex-row items-center">
                            <View className="w-6 h-6 ml-3 rounded-full bg-red-100 items-center justify-center mr-2">
                                <Text className="text-xs font-semibold text-red-500">
                                    {item.customer.charAt(0)}
                                </Text>
                            </View>
                            <Text className="text-sm text-gray-700">
                                {item.customer}
                            </Text>
                        </View>

                        <Text className="w-1/4 text-sm text-right ml-8 text-gray-700">{item.date}</Text>
                        <Text className="w-1/6 text-sm text-right px-2 text-gray-700">
                            {item.items}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}
