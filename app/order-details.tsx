import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLanguage } from "@/context/LanguageContext"; // Add import


/* ================= SCREEN ================= */

export default function OrderDetailsScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams();
    const { t } = useLanguage(); // Add hook


    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
                    <View className="flex-row items-center gap-3">
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color="#111827"
                            onPress={() => router.back()}
                        />
                        <Text className="text-base font-semibold text-gray-900">
                            {t('order_details')}
                        </Text>
                    </View>

                    <View className="bg-red-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-red-700">
                            {t('cancel_order')}
                        </Text>
                    </View>
                </View>

                {/* Order Summary */}
                <View className="px-5 py-4">
                    <Text className="text-sm font-semibold text-gray-900">
                        {t('order_number', { number: orderId })}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-1">
                        {t('placed_on', { date: '03-11-2025' })}
                    </Text>

                    <View className="flex-row justify-between mt-3">
                        <Text className="text-xs text-gray-500">{t('no_of_items', { count: 1 })}</Text>
                        <Text className="text-xs font-semibold text-gray-900">
                            {t('total_amount', { amount: '₦47,500' })}
                        </Text>
                    </View>
                </View>

                {/* Items */}
                <View className="bg-red-50 px-5 py-2">
                    <Text className="text-xs font-semibold text-red-600">
                        {t('items_in_order')}
                    </Text>
                </View>

                <View className="px-5 py-4 border-b border-gray-100">
                    <View className="self-start bg-blue-100 px-3 py-1 rounded-full mb-2">
                        <Text className="text-[10px] font-semibold text-blue-900">
                            {t('ongoing')}
                        </Text>
                    </View>

                    <Text className="text-xs text-gray-500 mb-3">
                        {t('delivery_estimate')}
                    </Text>

                    <View className="flex-row gap-3">
                        <Image
                            source={require("../assets/images/vase.png")}
                            className="w-16 h-16 rounded-lg"
                            resizeMode="cover"
                        />

                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-900">
                                Modern Ceramic Vase Set
                            </Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                {t('quantity_label', { count: 1 })}
                            </Text>
                        </View>

                        <Text className="text-sm font-semibold text-red-600">
                            ₦11,250
                        </Text>
                    </View>
                </View>

                {/* Track Button */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        router.push({
                            pathname: "/track/tracking-order",
                            params: { orderId: "ORD-2025-001" },
                        })
                    }
                    className="px-5 py-4"
                >
                    <View className="bg-red-600 py-3 rounded-xl items-center">
                        <Text className="text-sm font-semibold text-white">
                            {t('track_order')}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Payment */}
                <View className="bg-red-50 px-5 py-2">
                    <Text className="text-xs font-semibold text-red-600">
                        {t('payment')}
                    </Text>
                </View>

                <View className="px-5 py-4 border-b border-gray-100">
                    <Text className="text-xs text-gray-500 mb-2">
                        {t('payment_method')}
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900 mb-4">
                        {t('card')}
                    </Text>

                    <Text className="text-xs text-gray-500 mb-2">
                        {t('payment_details')}
                    </Text>

                    <View className="flex-row justify-between mb-1">
                        <Text className="text-xs text-gray-500">{t('items_total')}</Text>
                        <Text className="text-xs text-gray-700">₦37,500</Text>
                    </View>

                    <View className="flex-row justify-between mb-1">
                        <Text className="text-xs text-gray-500">{t('delivery_fee')}</Text>
                        <Text className="text-xs text-gray-700">₦8,000</Text>
                    </View>

                    <View className="flex-row justify-between mt-2">
                        <Text className="text-sm font-semibold text-gray-900">
                            {t('total')}
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900">
                            ₦45,000
                        </Text>
                    </View>
                </View>

                {/* Delivery */}
                <View className="bg-red-50 px-5 py-2">
                    <Text className="text-xs font-semibold text-red-600">
                        {t('delivery')}
                    </Text>
                </View>

                <View className="px-5 py-4">
                    <Text className="text-xs text-gray-500 mb-1">
                        {t('delivery_option')}
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900 mb-4">
                        {t('billing_address')}
                    </Text>

                    <Text className="text-xs text-gray-500 mb-1">
                        {t('billing_address')}
                    </Text>
                    <Text className="text-sm text-gray-800">
                        124 Ringroad street Lagos Nigeria
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}