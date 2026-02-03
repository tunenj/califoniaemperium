import React from "react";
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLanguage } from '@/context/LanguageContext'; // Import hook

/* ---------------- TYPES ---------------- */

type OrderStatus =
    | "Delivered"
    | "Shipped"
    | "Processing"
    | "Pending"
    | "Canceled";

interface Order {
    id: string;
    date: string;
    customer: string;
    email: string;
    type: "Vendor" | "Dropship";
    item: number;
    total: string;
    status: OrderStatus;
    payment: "Paid" | "Pending" | "Not Paid";
}

/* ---------------- DATA ---------------- */

const ORDERS: Order[] = [
    {
        id: "ORD-2025-001",
        date: "Dec 30, 25",
        customer: "Emily Johnson",
        email: "example@email.com",
        type: "Vendor",
        item: 2,
        total: "₦102,000",
        status: "Delivered",
        payment: "Paid",
    },
    {
        id: "ORD-2025-002",
        date: "Dec 30, 25",
        customer: "Bob Williams",
        email: "example@email.com",
        type: "Vendor",
        item: 2,
        total: "₦102,000",
        status: "Shipped",
        payment: "Paid",
    },
    {
        id: "ORD-2025-003",
        date: "Dec 30, 25",
        customer: "Alice Brown",
        email: "example@email.com",
        type: "Vendor",
        item: 2,
        total: "₦102,000",
        status: "Processing",
        payment: "Paid",
    },
    {
        id: "ORD-2025-004",
        date: "Dec 30, 25",
        customer: "Dan Miller",
        email: "example@email.com",
        type: "Dropship",
        item: 2,
        total: "₦102,000",
        status: "Pending",
        payment: "Pending",
    },
    {
        id: "ORD-2025-005",
        date: "Dec 30, 25",
        customer: "Carlos Davis",
        email: "example@email.com",
        type: "Vendor",
        item: 2,
        total: "₦102,000",
        status: "Canceled",
        payment: "Not Paid",
    },
];

/* ================= SCREEN ================= */

export default function OrderManagementScreen() {
    const router = useRouter();
    const { t } = useLanguage(); // Add hook

    /* ---------------- BADGES WITH TRANSLATIONS ---------------- */
    const statusBadge = (status: OrderStatus) => {
        switch (status) {
            case "Delivered":
                return { bg: "bg-green-100", label: t('delivered'), text: "text-green-900" };
            case "Shipped":
                return { bg: "bg-blue-100", label: t('shipped'), text: "text-blue-900" };
            case "Processing":
                return { bg: "bg-purple-100", label: t('processing'), text: "text-purple-900" };
            case "Pending":
                return { bg: "bg-orange-100", label: t('pending'), text: "text-orange-900" };
            case "Canceled":
                return { bg: "bg-red-100", label: t('canceled'), text: "text-red-900" };
        }
    };

    const paymentBadge = (payment: Order["payment"]) => {
        switch (payment) {
            case "Paid":
                return { bg: "bg-green-100", label: t('paid'), text: "text-green-900" };
            case "Pending":
                return { bg: "bg-orange-100", label: t('payment_pending'), text: "text-orange-900" };
            case "Not Paid":
                return { bg: "bg-red-100", label: t('not_paid'), text: "text-red-900" };
        }
    };

    /* ---------------- FILTERS WITH TRANSLATIONS ---------------- */
    const filters = [
        t('all_orders', { count: 5 }),
        t('pending_orders', { count: 1 }),
        t('processing_orders', { count: 1 }),
        t('shipped_orders', { count: 1 }),
        t('delivered_orders', { count: 3 }),
    ];

    return (
        <SafeAreaView className="flex-1 bg-white -mt-10">
            {/* Sticky Header */}
            <View className="px-5 pt-4 pb-3 border-b border-gray-200 bg-white z-10">
                <Text className="text-lg font-semibold text-gray-900">
                    {t('order_management')}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                    {t('track_and_manage_orders')}
                </Text>

                {/* Search */}
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mt-4">
                    <Ionicons name="search" size={14} color="#9ca3af" />
                    <TextInput
                        placeholder={t('search_order')}
                        placeholderTextColor="#6b7280"
                        className="ml-2 text-xs flex-1 text-black"
                    />
                </View>

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                    {filters.map((filter, index) => (
                        <View key={index} className="px-1.5 py-1 mr-2 bg-gray-100 rounded-full">
                            <Text className="text-xs text-gray-600">{filter}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Horizontal Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="min-w-[900px]">
                    {/* Header Row */}
                    <View className="flex-row px-5 py-3 border-b border-gray-200 bg-gray-50">
                        <Text className="w-32 text-xs font-semibold text-gray-500">
                            {t('orders')}
                        </Text>
                        <Text className="w-52 text-xs font-semibold text-gray-500">
                            {t('customer')}
                        </Text>
                        <Text className="w-28 text-xs font-semibold text-gray-500">
                            {t('type')}
                        </Text>
                        <Text className="w-20 text-xs font-semibold text-gray-500">
                            {t('item')}
                        </Text>
                        <Text className="w-28 text-xs font-semibold text-gray-500">
                            {t('total')}
                        </Text>
                        <Text className="w-28 text-xs font-semibold text-gray-500">
                            {t('status')}
                        </Text>
                        <Text className="w-28 text-xs font-semibold text-gray-500">
                            {t('payment')}
                        </Text>
                        <Text className="w-16 text-xs font-semibold text-gray-500">
                            {t('action')}
                        </Text>
                    </View>

                    {/* Rows */}
                    <FlatList
                        data={ORDERS}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        renderItem={({ item }) => {
                            const status = statusBadge(item.status);
                            const payment = paymentBadge(item.payment);
                            
                            return (
                                <View className="flex-row px-5 py-4 border-b border-gray-100">
                                    {/* Order */}
                                    <View className="w-32">
                                        <Text className="text-xs font-medium text-gray-900">
                                            {item.id}
                                        </Text>
                                        <Text className="text-[10px] text-gray-400">
                                            {item.date}
                                        </Text>
                                    </View>

                                    {/* Customer */}
                                    <View className="w-52 flex-row items-center gap-2">
                                        <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center">
                                            <Text className="text-sm font-semibold text-red-600">
                                                {item.customer.charAt(0)}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text className="text-xs text-gray-900">
                                                {item.customer}
                                            </Text>
                                            <Text className="text-[10px] text-gray-400">
                                                {item.email}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Type */}
                                    <Text
                                        className={`w-28 text-xs ${item.type === "Dropship"
                                            ? "text-blue-600 font-medium"
                                            : "text-gray-800"
                                            }`}
                                    >
                                        {item.type === "Dropship" ? t('dropship') : t('vendor')}
                                    </Text>

                                    {/* Item */}
                                    <Text className="w-20 text-xs text-gray-800">{item.item}</Text>

                                    {/* Total */}
                                    <Text className="w-28 text-xs text-red-500">{item.total}</Text>

                                    {/* Status */}
                                    <View className="w-28">
                                        <View className={`self-start px-3 py-1 rounded-full ${status.bg}`}>
                                            <Text className={`text-[10px] font-semibold ${status.text}`}>
                                                {status.label}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Payment */}
                                    <View className="w-28">
                                        <View className={`self-start px-3 py-1 rounded-full ${payment.bg}`}>
                                            <Text className={`text-[10px] font-semibold ${payment.text}`}>
                                                {payment.label}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Action */}
                                    <View className="w-16 items-center">
                                        <Ionicons
                                            name="eye"
                                            size={16}
                                            color="#ef4444"
                                            onPress={() =>
                                                router.push({
                                                    pathname: "/order-details",
                                                    params: { orderId: item.id },
                                                })
                                            }
                                        />
                                    </View>
                                </View>
                            );
                        }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}