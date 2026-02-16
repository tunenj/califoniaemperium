import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ---------------- TYPES ---------------- */

interface Order {
    id: string;
    order_number: string;
    customer: string;        // ⚠️ API returns UUID, not a name
    customer_email: string;
    status: string;
    payment_status: string;
    total: string;
    items_count: number;
    created_at: string;
    paid_at: string | null;
}

interface OrdersResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Order[];
}

/* ---------------- HELPERS ---------------- */

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
    });
};

const formatCurrency = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return '₦0';
    return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/* ================= SCREEN ================= */

export default function OrderManagementScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [stats, setStats] = useState({
        all: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
    });

    /* ---------------- FETCH ---------------- */

    const fetchOrders = useCallback(async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);
            setError(null);

            const token = await AsyncStorage.getItem('accessToken');

            const response = await api.get<OrdersResponse>(endpoints.getOrder, {
                headers: { Authorization: `Bearer ${token || ''}` },
            });

            const ordersData = response.data?.results ?? [];
            setOrders(ordersData);

            setStats({
                all: ordersData.length,
                pending: ordersData.filter(o => o.status.toLowerCase() === 'pending').length,
                processing: ordersData.filter(o => o.status.toLowerCase() === 'processing').length,
                shipped: ordersData.filter(o => o.status.toLowerCase() === 'shipped').length,
                delivered: ordersData.filter(o => o.status.toLowerCase() === 'delivered').length,
                cancelled: ordersData.filter(o =>
                    o.status.toLowerCase() === 'cancelled' ||
                    o.status.toLowerCase() === 'canceled'
                ).length,
            });
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    /* ---------------- FILTERING (derived, no extra state) ---------------- */

    const filteredOrders = React.useMemo(() => {
        let result = orders;

        if (selectedFilter !== 'all') {
            result = result.filter(o => o.status.toLowerCase() === selectedFilter);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.order_number.toLowerCase().includes(q) ||
                o.customer_email?.toLowerCase().includes(q)
            );
        }

        return result;
    }, [orders, selectedFilter, searchQuery]);

    /* ---------------- BADGES ---------------- */

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return { bg: 'bg-green-100', text: 'text-green-700', label: t('delivered') };
            case 'shipped':
                return { bg: 'bg-blue-100', text: 'text-blue-700', label: t('shipped') };
            case 'processing':
                return { bg: 'bg-purple-100', text: 'text-purple-700', label: t('processing') };
            case 'pending':
                return { bg: 'bg-orange-100', text: 'text-orange-700', label: t('pending') };
            case 'cancelled':
            case 'canceled':
                return { bg: 'bg-red-100', text: 'text-red-700', label: t('canceled') };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
        }
    };

    const getPaymentBadge = (paymentStatus: string) => {
        switch (paymentStatus.toLowerCase()) {
            case 'paid':
                return { bg: 'bg-green-100', text: 'text-green-700', label: t('paid') };
            case 'pending':
                return { bg: 'bg-orange-100', text: 'text-orange-700', label: t('payment_pending') };
            case 'failed':
                return { bg: 'bg-red-100', text: 'text-red-700', label: t('failed') };
            case 'refunded':
                return { bg: 'bg-purple-100', text: 'text-purple-700', label: t('refunded') };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', label: paymentStatus };
        }
    };

    /* ---------------- FILTER TABS ---------------- */

    const filters = [
        { key: 'all',        label: `All (${stats.all})` },
        { key: 'pending',    label: `Pending (${stats.pending})` },
        { key: 'processing', label: `Processing (${stats.processing})` },
        { key: 'shipped',    label: `Shipped (${stats.shipped})` },
        { key: 'delivered',  label: `Delivered (${stats.delivered})` },
        { key: 'cancelled',  label: `Cancelled (${stats.cancelled})` },
    ];

    /* ---------------- LOADING / ERROR STATES ---------------- */

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#DC2626" />
                <Text className="mt-4 text-gray-500 text-sm">Loading orders...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
                <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
                <Text className="text-red-600 text-center mt-4 mb-4">{error}</Text>
                <TouchableOpacity
                    onPress={() => fetchOrders()}
                    className="bg-red-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold">Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    /* ---------------- RENDER ---------------- */

    return (
        <SafeAreaView className="flex-1 bg-white -mt-10">

            {/* ── HEADER ── */}
            <View className="px-5 pt-4 pb-3 border-b border-gray-200 bg-white z-10">
                <Text className="text-lg font-semibold text-gray-900">
                    {t('order_management')}
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                    {t('track_and_manage_orders')}
                </Text>

                {/* Search */}
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mt-4">
                    <Ionicons name="search" size={14} color="#9ca3af" />
                    <TextInput
                        placeholder="Search by order number or email..."
                        placeholderTextColor="#6b7280"
                        className="ml-2 text-xs flex-1 text-black"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={16} color="#9ca3af" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Filter Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-3"
                >
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            onPress={() => setSelectedFilter(filter.key)}
                            className={`px-3 py-1.5 mr-2 rounded-full ${
                                selectedFilter === filter.key
                                    ? 'bg-red-600'
                                    : 'bg-gray-100'
                            }`}
                        >
                            <Text
                                className={`text-xs ${
                                    selectedFilter === filter.key
                                        ? 'text-white font-medium'
                                        : 'text-gray-600'
                                }`}
                            >
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* ── TABLE ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="min-w-[860px]">

                    {/* Table Header */}
                    <View className="flex-row px-5 py-3 border-b border-gray-200 bg-gray-50">
                        <Text className="w-36 text-xs font-semibold text-gray-500">Order</Text>
                        <Text className="w-48 text-xs font-semibold text-gray-500">Customer</Text>
                        <Text className="w-20 text-xs font-semibold text-gray-500">Items</Text>
                        <Text className="w-32 text-xs font-semibold text-gray-500">Total</Text>
                        <Text className="w-28 text-xs font-semibold text-gray-500">Status</Text>
                        <Text className="w-28 text-xs font-semibold text-gray-500">Payment</Text>
                        <Text className="w-24 text-xs font-semibold text-gray-500">Date</Text>
                        <Text className="w-16 text-xs font-semibold text-gray-500 text-center">Action</Text>
                    </View>

                    {/* Table Body */}
                    {filteredOrders.length === 0 ? (
                        <View className="py-16 items-center">
                            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-3 text-sm">No orders found</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredOrders}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={() => fetchOrders(true)}
                                    colors={['#DC2626']}
                                />
                            }
                            renderItem={({ item }) => {
                                const status = getStatusBadge(item.status);
                                const payment = getPaymentBadge(item.payment_status);

                                // ✅ customer is a UUID — use email for display
                                                const initial = (item.customer_email || 'U').charAt(0).toUpperCase();

                                return (
                                    <View className="flex-row px-5 py-4 border-b border-gray-100 items-center">

                                        {/* Order Number */}
                                        <View className="w-36">
                                            <Text className="text-xs font-semibold text-gray-900">
                                                {item.order_number}
                                            </Text>
                                        </View>

                                        {/* Customer — avatar initial + full email */}
                                        <View className="w-48 flex-row items-center gap-2">
                                            <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center flex-shrink-0">
                                                <Text className="text-sm font-semibold text-red-600">
                                                    {initial}
                                                </Text>
                                            </View>
                                            <Text className="flex-1 text-xs text-gray-700" numberOfLines={1}>
                                                {item.customer_email}
                                            </Text>
                                        </View>

                                        {/* Items count */}
                                        <View className="w-20 flex-row items-center gap-1">
                                            <Ionicons name="cube-outline" size={12} color="#9CA3AF" />
                                            <Text className="text-xs text-gray-700">
                                                {item.items_count}
                                            </Text>
                                        </View>

                                        {/* Total */}
                                        <Text className="w-32 text-xs font-semibold text-red-600">
                                            {formatCurrency(item.total)}
                                        </Text>

                                        {/* Order Status */}
                                        <View className="w-28">
                                            <View className={`self-start px-2 py-1 rounded-full ${status.bg}`}>
                                                <Text className={`text-[10px] font-medium ${status.text}`}>
                                                    {status.label}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Payment Status */}
                                        <View className="w-28">
                                            <View className={`self-start px-2 py-1 rounded-full ${payment.bg}`}>
                                                <Text className={`text-[10px] font-medium ${payment.text}`}>
                                                    {payment.label}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Date */}
                                        <Text className="w-24 text-[10px] text-gray-400">
                                            {formatDate(item.created_at)}
                                        </Text>

                                        {/* Action */}
                                        <TouchableOpacity
                                            className="w-16 items-center"
                                            onPress={() =>
                                                router.push({
                                                    pathname: '/order-details',
                                                    params: { orderId: item.id },
                                                })
                                            }
                                        >
                                            <Ionicons name="eye-outline" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                );
                            }}
                        />
                    )}
                </View>
            </ScrollView>

            {/* ── FOOTER ── */}
            <View className="px-5 py-3 border-t border-gray-200 bg-gray-50">
                <Text className="text-xs text-gray-500">
                    Showing {filteredOrders.length} of {stats.all} orders
                </Text>
            </View>

        </SafeAreaView>
    );
}