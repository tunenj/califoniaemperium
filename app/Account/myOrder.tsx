import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

type OrderStatus = "Ongoing" | "Delivered" | "Cancelled";

interface OrderItem {
    id: string;
    title: string;
    store: string;
    qty: number;
    status: OrderStatus;
    price: string;
    estimated: string;
    image: ImageSourcePropType;
}

const statusColors: Record<OrderStatus, string> = {
    Ongoing: "bg-blue-100 text-blue-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
};

const ordersData: Record<OrderStatus, OrderItem[]> = {
    Ongoing: [
        {
            id: "ORD-2025-001",
            title: "Modern Ceramic Vase Set",
            store: "Ormani Store",
            qty: 1,
            status: "Ongoing",
            price: "₦47,500",
            estimated: "12-12-2025 4:32pm",
            image: require("@/assets/images/vase.png"),
        },
    ],
    Delivered: [
        {
            id: "ORD-2025-002",
            title: "Wall Art Luxury Piece",
            store: "Artisans Hub",
            qty: 1,
            status: "Delivered",
            price: "₦65,000",
            estimated: "06-09-2025 10:12am",
            image: require("@/assets/images/vase.png"),
        },
    ],
    Cancelled: [
        {
            id: "ORD-2025-003",
            title: "Minimalist Flower Pot",
            store: "Green Decor",
            qty: 2,
            status: "Cancelled",
            price: "₦21,400",
            estimated: "01-08-2025 1:22pm",
            image: require("@/assets/images/vase.png"),
        },
        {
            id: "ORD-2025-004",
            title: "Minimalist Flower Pot",
            store: "Green Decor",
            qty: 2,
            status: "Cancelled",
            price: "₦21,400",
            estimated: "01-08-2025 1:22pm",
            image: require("@/assets/images/vase.png"),
        },
        {
            id: "ORD-2025-005",
            title: "Minimalist Flower Pot",
            store: "Green Decor",
            qty: 2,
            status: "Cancelled",
            price: "₦21,400",
            estimated: "01-08-2025 1:22pm",
            image: require("@/assets/images/vase.png"),
        },
    ],
};

function OrderCard({ item }: { item: OrderItem }) {
    return (
        <View className="flex-row bg-white rounded-xl p-3 mb-4 shadow-sm border border-gray-100">
            <Image source={item.image} className="w-14 h-14 rounded-md mr-3" />
            <View className="flex-1">
                <View className="flex-row justify-between items-center">
                    <Text className="font-semibold text-gray-900">{item.store}</Text>
                    <Text className={`px-2 py-0.5 rounded-full text-xs ${statusColors[item.status]}`}>
                        {item.status}
                    </Text>
                </View>

                <Text className="text-gray-800 mt-1">{item.title}</Text>

                <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-xs">
                        <Text className="text-gray-500">{item.qty} item </Text>
                        <Text className="text-red-500">Order {item.id}</Text>
                    </Text>
                    <Text className="font-semibold text-gray-900">{item.price}</Text>
                </View>

                <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-xs text-gray-500">Estimated Delivery</Text>
                    <Text className="text-xs text-gray-500">{item.estimated}</Text>
                </View>

                <View className="mt-2 flex-row justify-between space-x-3 gap-4">
                    <TouchableOpacity className="flex-1 bg-red-600 rounded-full py-2 px-4 flex-row items-center justify-center">
                        <Text className="text-white text-sm">Track Order</Text>
                        <Ionicons name="chevron-forward" size={18} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-red-600 rounded-full py-2 px-4 flex-row items-center justify-center">
                        <Ionicons name="call" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

export default function OrdersScreen() {
    const tabs: OrderStatus[] = ["Ongoing", "Delivered", "Cancelled"];
    const [activeTab, setActiveTab] = useState<OrderStatus>("Ongoing");
    const [loading, setLoading] = useState(false);

    const handleTabSwitch = (tab: OrderStatus) => {
        setActiveTab(tab);
        setLoading(true);
        setTimeout(() => setLoading(false), 500);
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
            {/* FIXED TABS */}
            <View className="px-4 pt-4 bg-gray-50 z-10">
                <Text className="font-semibold text-gray-900 mb-2">My Orders</Text>

                <View className="flex-row bg-gray-100 rounded-full p-1 mb-4">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => handleTabSwitch(tab)}
                            className={`flex-1 py-1.5 rounded-full ${activeTab === tab ? "bg-white" : ""
                                }`}
                        >
                            <Text
                                className={`text-center text-sm ${activeTab === tab ? "text-gray-800" : "text-gray-500"
                                    }`}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* SCROLLABLE ORDER LIST */}
            <ScrollView
                className="flex-1 bg-gray-50 px-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {loading && (
                    <View className="py-10">
                        <ActivityIndicator size="small" color="gray" />
                    </View>
                )}

                {!loading && ordersData[activeTab].length === 0 && (
                    <View className="items-center py-20">
                        <Text className="text-gray-600">No {activeTab} Orders</Text>
                    </View>
                )}

                {!loading &&
                    ordersData[activeTab].map((item) => <OrderCard key={item.id} item={item} />)}

                {!loading && activeTab === "Ongoing" && (
                    <>
                        <Text className="font-semibold text-gray-900 mt-2 mb-2">Recent Orders</Text>
                        {ordersData.Delivered.map((item) => (
                            <OrderCard key={item.id} item={item} />
                        ))}
                        {ordersData.Cancelled.map((item) => (
                            <OrderCard key={item.id} item={item} />
                        ))}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
