import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ---------------- TYPES ---------------- */

type OrderStatus = "delivered" | "shipped" | "processing" | "pending" | "cancelled";
type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

interface ApiOrder {
    id: string;
    order_number: string;
    customer: string;
    customer_email: string;
    status: string;
    payment_status: string;
    total: string;
    items_count: number;
    created_at: string;
    paid_at: string | null;
}

interface ApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ApiOrder[];
}

interface Order {
    id: string;
    order_number: string;
    date: string;
    email: string;  // Only email for customer
    items_count: number;
    total: string;
    status: OrderStatus;
    payment_status: PaymentStatus;
    created_at: string;
}

// Helper function to format price in euros
const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return `€${numPrice.toFixed(2)}`;
};

/* ================= SCREEN ================= */

export default function OrderManagementScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [pagination, setPagination] = useState({
        count: 0,
        next: null as string | null,
        previous: null as string | null,
    });

    // Format date to readable format
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: '2-digit'
        });
    };

    // Map API status to UI status
    const mapOrderStatus = (status: string): OrderStatus => {
        const statusMap: Record<string, OrderStatus> = {
            'pending': 'pending',
            'processing': 'processing',
            'shipped': 'shipped',
            'delivered': 'delivered',
            'cancelled': 'cancelled',
            'canceled': 'cancelled',
        };
        return statusMap[status.toLowerCase()] || 'pending';
    };

    // Map API payment status to UI payment status
    const mapPaymentStatus = (status: string): PaymentStatus => {
        const statusMap: Record<string, PaymentStatus> = {
            'paid': 'paid',
            'pending': 'pending',
            'failed': 'failed',
            'refunded': 'refunded',
            'not paid': 'failed',
        };
        return statusMap[status.toLowerCase()] || 'pending';
    };

    // Fetch orders from API - wrapped in useCallback
    const fetchOrders = useCallback(async (url?: string) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const apiUrl = url || endpoints.listOrder;

            console.log('🔍 Fetching orders from:', apiUrl);

            const response = await api.get<ApiResponse>(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token || ''}`,
                },
            });

            console.log('✅ Orders fetched:', response.data.count);

            const formattedOrders: Order[] = response.data.results.map((item: ApiOrder) => ({
                id: item.id,
                order_number: item.order_number,
                date: formatDate(item.created_at),
                email: item.customer_email, // Only using email
                items_count: item.items_count,
                total: formatPrice(item.total),
                status: mapOrderStatus(item.status),
                payment_status: mapPaymentStatus(item.payment_status),
                created_at: item.created_at,
            }));

            setOrders(formattedOrders);
            setPagination({
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
            });
        } catch (error: any) {
            console.error('❌ Error fetching orders:', error);
            // You might want to show an error toast here
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []); // Empty deps since it doesn't depend on any props/state

    // Initial load
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]); // Added fetchOrders to dependency array

    // Handle refresh
    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    // Handle load more
    const loadMore = () => {
        if (pagination.next && !loading) {
            fetchOrders(pagination.next);
        }
    };

    // Filter orders based on search and selected filter
    const filteredOrders = orders.filter(order => {
        // Search filter - only searching by order number and email now
        const matchesSearch =
            order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const matchesFilter =
            selectedFilter === "all" ||
            order.status === selectedFilter;

        return matchesSearch && matchesFilter;
    });

    // Get email initial for avatar
    const getEmailInitial = (email: string): string => {
        return email.charAt(0).toUpperCase();
    };

    /* ---------------- BADGES WITH TRANSLATIONS ---------------- */
    const statusBadge = (status: OrderStatus) => {
        switch (status) {
            case "delivered":
                return { bg: "bg-green-100", label: t('delivered'), text: "text-green-900" };
            case "shipped":
                return { bg: "bg-blue-100", label: t('shipped'), text: "text-blue-900" };
            case "processing":
                return { bg: "bg-purple-100", label: t('processing'), text: "text-purple-900" };
            case "pending":
                return { bg: "bg-orange-100", label: t('pending'), text: "text-orange-900" };
            case "cancelled":
                return { bg: "bg-red-100", label: t('canceled'), text: "text-red-900" };
        }
    };

    const paymentBadge = (payment: PaymentStatus) => {
        switch (payment) {
            case "paid":
                return { bg: "bg-green-100", label: t('paid'), text: "text-green-900" };
            case "pending":
                return { bg: "bg-orange-100", label: t('payment_pending'), text: "text-orange-900" };
            case "failed":
                return { bg: "bg-red-100", label: t('not_paid'), text: "text-red-900" };
            case "refunded":
                return { bg: "bg-gray-100", label: t('refunded'), text: "text-gray-900" };
        }
    };

    /* ---------------- FILTERS WITH COUNTS ---------------- */
    const getFilterCounts = () => {
        const counts = {
            all: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'processing').length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
        };
        return counts;
    };

    const filterCounts = getFilterCounts();

    const filters = [
        { key: 'all', label: t('all_orders', { count: filterCounts.all }) },
        { key: 'pending', label: t('pending_orders', { count: filterCounts.pending }) },
        { key: 'processing', label: t('processing_orders', { count: filterCounts.processing }) },
        { key: 'shipped', label: t('shipped_orders', { count: filterCounts.shipped }) },
        { key: 'delivered', label: t('delivered_orders', { count: filterCounts.delivered }) },
        { key: 'cancelled', label: t('cancelled_orders', { count: filterCounts.cancelled }) },
    ];

    // Loading state
    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#ef4444" />
                <Text className="mt-4 text-gray-600">{t('loading_orders')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white -mt-10">
            {/* Sticky Header */}
            <View className="px-5 pt-4 pb-3 border-b border-gray-200 bg-white z-10">
                <Text className="text-lg font-semibold text-gray-900">
                    {t('order_management')}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                    {t('track_and_manage_orders')} • {pagination.count} {t('total_orders')}
                </Text>

                {/* Search */}
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mt-4">
                    <Ionicons name="search" size={14} color="#9ca3af" />
                    <TextInput
                        placeholder={t('search_order')}
                        placeholderTextColor="#6b7280"
                        className="ml-2 text-xs flex-1 text-black"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={14} color="#9ca3af" />
                        </Pressable>
                    )}
                </View>

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                    {filters.map((filter) => (
                        <Pressable
                            key={filter.key}
                            onPress={() => setSelectedFilter(filter.key)}
                            className={`px-3 py-1 mr-2 rounded-full ${selectedFilter === filter.key ? 'bg-red-600' : 'bg-gray-100'
                                }`}
                        >
                            <Text
                                className={`text-xs ${selectedFilter === filter.key ? 'text-white' : 'text-gray-600'
                                    }`}
                            >
                                {filter.label}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Horizontal Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="min-w-[900px]">
                    {/* Header Row */}
                    <View className="flex-row px-5 py-3 border-b border-gray-200 bg-gray-50">
                        <Text className="w-32 text-xs font-semibold text-gray-500">
                            {t('order')}
                        </Text>
                        <Text className="w-52 text-xs font-semibold text-gray-500">
                            {t('customer')}
                        </Text>
                        <Text className="w-20 text-xs font-semibold text-gray-500">
                            {t('items')}
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
                        data={filteredOrders}
                        keyExtractor={(item) => item.id}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={
                            <View className="py-10 items-center">
                                <Ionicons name="bag-outline" size={40} color="#9ca3af" />
                                <Text className="mt-2 text-gray-500">
                                    {searchQuery
                                        ? t('no_orders_found')
                                        : t('no_orders_yet')}
                                </Text>
                            </View>
                        }
                        renderItem={({ item }) => {
                            const status = statusBadge(item.status);
                            const payment = paymentBadge(item.payment_status);

                            return (
                                <View className="flex-row px-5 py-4 border-b border-gray-100">
                                    {/* Order */}
                                    <View className="w-32">
                                        <Text className="text-xs font-medium text-gray-900">
                                            {item.order_number}
                                        </Text>
                                        <Text className="text-[10px] text-gray-400">
                                            {item.date}
                                        </Text>
                                    </View>

                                    {/* Customer - Now only showing email */}
                                    <View className="w-52 flex-row items-center gap-2">
                                        <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center">
                                            <Text className="text-sm font-semibold text-red-600">
                                                {getEmailInitial(item.email)}
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-xs text-gray-900" numberOfLines={1}>
                                                {item.email}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Items */}
                                    <Text className="w-20 text-xs text-gray-800">
                                        {item.items_count}
                                    </Text>

                                    {/* Total */}
                                    <Text className="w-28 text-xs text-red-500">
                                        {item.total}
                                    </Text>

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
                                                    pathname: "/order-details/[id]",
                                                    params: { id: item.id },
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