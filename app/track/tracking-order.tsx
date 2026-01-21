import React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

/* ---------------- TYPES ---------------- */

type StepStatus = "done" | "active" | "pending";

interface Step {
    label: string;
    date: string;
    status: StepStatus;
}

/* ---------------- SCREEN ---------------- */

export default function TrackingOrderScreen() {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const router = useRouter();

    const STEPS: Step[] = [
        {
            label: "Order placed",
            date: "Monday, 03-2025",
            status: "done",
        },
        {
            label: "Confirmed",
            date: "Monday, 03-2025",
            status: "done",
        },
        {
            label: "Waiting to be shipped",
            date: "Monday, 03-2025",
            status: "done",
        },
        {
            label: "Shipped",
            date: "Tuesday, 03-2025",
            status: "done",
        },
        {
            label: "Out for delivery",
            date: "Tuesday, 03-2025",
            status: "done",
        },
        {
            label: "Delivered",
            date: "Tuesday, 03-2025",
            status: "active",
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 py-4">
                    <View className="flex-row items-center gap-2">
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color="#111827"
                            onPress={() => router.back()}
                        />
                        <Text className="text-sm font-semibold text-gray-900">
                            Tracking Order
                        </Text>
                    </View>

                    <View className="bg-secondary px-3 py-1 rounded-full">
                        <Text className="text-[10px] font-semibold text-white">
                            Notify Customer
                        </Text>
                    </View>
                </View>

                {/* Order ID */}
                <View className="px-5">
                    <Text className="text-xs text-gray-500">
                        #{orderId ?? "ORD-2025-001"}
                    </Text>
                </View>

                {/* Map Placeholder */}
                <View className="mx-5 mt-4 h-40 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                        source={require("../../assets/images/map.png")}
                        className="rounded-lg"
                        resizeMode="cover"
                    />
                </View>

                {/* Timeline */}
                <View className="px-5 mt-6">
                    {STEPS.map((step, index) => {
                        const isDone = step.status === "done";
                        const isActive = step.status === "active";

                        return (
                            <View key={index} className="flex-row">
                                {/* Line */}
                                <View className="items-center mr-3">
                                    <View
                                        className={`w-5 h-5 rounded-full items-center justify-center ${isDone
                                            ? "bg-green-500"
                                            : isActive
                                                ? "bg-green-100 border border-green-500"
                                                : "bg-gray-200"
                                            }`}
                                    >
                                        {isDone && (
                                            <Ionicons name="checkmark" size={12} color="white" />
                                        )}
                                    </View>

                                    {index !== STEPS.length - 1 && (
                                        <View
                                            className={`w-[2px] flex-1 ${isDone ? "bg-green-400" : "bg-gray-200"
                                                }`}
                                        />
                                    )}
                                </View>

                                {/* Content */}
                                <View className="pb-6">
                                    <View
                                        className={`px-4 py-1 rounded-full self-start ${isDone
                                            ? "bg-green-500"
                                            : isActive
                                                ? "bg-green-100"
                                                : "bg-gray-200"
                                            }`}
                                    >
                                        <Text
                                            className={`text-[10px] font-semibold ${isDone
                                                ? "text-white"
                                                : isActive
                                                    ? "text-green-700"
                                                    : "text-gray-500"
                                                }`}
                                        >
                                            {step.label}
                                        </Text>
                                    </View>

                                    <Text className="text-[10px] text-gray-400 mt-1">
                                        {step.date}
                                    </Text>

                                    {/* ACTIVE MESSAGE FOR DELIVERED */}
                                    {step.label === "Delivered" && isActive && (
                                        <Text className="text-xs text-gray-600 mt-2 max-w-[260px]">
                                            Its won’t be long now! Your item/order will be delivered to
                                            you
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Footer Message */}
                <View className="px-5 pb-8">
                    <Text className="text-[10px] text-gray-400">
                        Order/item has not been delivered yet
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
