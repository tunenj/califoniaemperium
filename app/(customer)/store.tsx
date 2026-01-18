import React from "react";
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

type Product = {
    id: string;
    name: string;
    price: string;
    oldPrice: string;
    rating: number;
    reviews: number;
    discount?: string;
    image: any;
};

const products: Product[] = [
    {
        id: "1",
        name: "Smart Watch Series 5",
        price: "₦102,000",
        oldPrice: "₦139,000",
        rating: 4,
        reviews: 234,
        discount: "50%",
        image: require("../../assets/images/watch.png"),
    },
    {
        id: "2",
        name: "Running Shoes Pro Max",
        price: "₦102,000",
        oldPrice: "₦139,000",
        rating: 4,
        reviews: 234,
        discount: "50%",
        image: require("../../assets/images/shoe.png"),
    },
    {
        id: "3",
        name: "Professional Yoga Mat",
        price: "₦102,000",
        oldPrice: "₦139,000",
        rating: 4,
        reviews: 234,
        discount: "50%",
        image: require("../../assets/images/yoga.png"),
    },
    {
        id: "4",
        name: "Portable Bluetooth Speaker",
        price: "₦102,000",
        oldPrice: "₦139,000",
        rating: 4,
        reviews: 234,
        discount: "50%",
        image: require("../../assets/images/speaker.png"),
    },
];

export default function StoreScreen() {
    const router = useRouter();
    const categories = [
        "All Store",
        "Electronics",
        "Fashion",
        "Home & Garden",
        "Sports",
    ];

    return (
        <View className="flex-1">
            {/* HEADER (FIXED) */}
            <View className="rounded-b-2xl overflow-hidden">
                <LinearGradient
                    className="w-full min-h-60"
                    colors={["#B13239", "#4D0812"]}
                    start={[0, 0]}
                    end={[1, 0]}
                >
                    <SafeAreaView className="flex-1">
                        <View className="flex-row justify-end items-center px-4 pt-10">
                            <TouchableOpacity className="mx-2">
                                <Ionicons name="mail-outline" size={26} color="white" />
                                <View className="absolute -top-1 -right-1 bg-red-600 w-3 h-3 rounded-full" />
                            </TouchableOpacity>

                            <TouchableOpacity className="mx-2">
                                <Ionicons
                                    name="notifications-outline"
                                    size={26}
                                    color="white"
                                />
                                <View className="absolute -top-1 -right-1 bg-red-600 w-3 h-3 rounded-full" />
                            </TouchableOpacity>

                            <TouchableOpacity className="mx-2">
                                <MaterialIcons
                                    name="person-outline"
                                    size={28}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mt-6"
                            contentContainerStyle={{ paddingHorizontal: 12 }}
                        >
                            {categories.map((cat) => (
                                <TouchableOpacity key={cat} className="mr-3">
                                    <Text
                                        className={`text-base text-white ${cat === "All Store" ? "font-bold" : "font-normal"
                                            }`}
                                    >
                                        {cat}
                                    </Text>
                                    {cat === "All Store" && (
                                        <View className="h-1 bg-white rounded-full mt-1" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </SafeAreaView>
                </LinearGradient>
            </View>

            {/* SCROLLING CONTENT */}
            <ScrollView showsVerticalScrollIndicator={false}
                className="mt-4"
            >
                {/* STORE CARD */}
                <View className="mx-4 bg-white rounded-xl overflow-hidden mt-4 shadow-sm">
                    <Image
                        source={require("../../assets/images/cover.png")}
                        className="w-full h-40"
                        resizeMode="cover"
                    />

                    <View className="p-4">
                        <View className="flex-row justify-between">
                            <View className="flex-row">
                                <Image
                                    source={require("../../assets/images/electronicsIcon.png")}
                                    className="w-16 h-14 rounded-xl -mt-10 border border-white"
                                />
                                <View className="ml-1">
                                    <Text className="font-bold text-white text-lg -mt-10 z-10">
                                        TechHub
                                    </Text>
                                    <Text className="text-xs text-gray-500">
                                        Beautiful home decor and essential items
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity className="bg-red-500 px-4 py-1 rounded-full relative bottom-4 left-3 z-10">
                                <Text className="text-white text-xs font-semibold">Follow</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-between mt-4">
                            <Text className="text-xs text-gray-500">
                                4.8 ⭐ (76 reviews)
                            </Text>
                            <Text className="text-xs text-gray-500">2,340 followers</Text>
                            <Text className="text-xs text-gray-500">64 products</Text>
                        </View>
                    </View>
                </View>

                {/* TABS */}
                <View className="flex-row px-4 mt-6">
                    <TouchableOpacity className="mr-6">
                        <Text className="font-bold text-red-500">Products (4)</Text>
                        <View className="h-1 bg-red-500 rounded-full mt-1" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push("/(customer)/store-reviews")}
                    >
                        <Text className="text-gray-400">Reviews (0)</Text>
                    </TouchableOpacity>
                </View>

                {/* PRODUCTS */}
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    scrollEnabled={false}
                    contentContainerStyle={{ padding: 16 }}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    renderItem={({ item }) => (
                        <View className="bg-white w-[48%] mb-4 rounded-xl p-3 shadow-sm">
                            {item.discount && (
                                <View className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded-full z-10">
                                    <Text className="text-white text-xs font-bold">
                                        {item.discount}
                                    </Text>
                                </View>
                            )}

                            <Ionicons
                                name="heart-outline"
                                size={18}
                                color="#9CA3AF"
                                style={{ position: "absolute", top: 8, right: 8 }}
                            />

                            <Image
                                source={item.image}
                                className="w-full h-28"
                                resizeMode="contain"
                            />

                            <Text className="mt-2 text-xs text-gray-400">TechHub</Text>
                            <Text className="font-semibold text-sm">{item.name}</Text>

                            <View className="flex-row items-center mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Ionicons
                                        key={i}
                                        name={i < item.rating ? "star" : "star-outline"}
                                        size={12}
                                        color="#FBBF24"
                                    />
                                ))}
                                <Text className="text-xs text-gray-400 ml-1">
                                    ({item.reviews})
                                </Text>
                            </View>

                            <View className="flex-row justify-between items-center mt-2">
                                <View>
                                    <Text className="text-red-500 font-bold">
                                        {item.price}
                                    </Text>
                                    <Text className="text-xs text-gray-400 line-through">
                                        {item.oldPrice}
                                    </Text>
                                </View>

                                <Ionicons name="cart-outline" size={20} color="#EF4444" />
                            </View>
                        </View>
                    )}
                />
            </ScrollView>
        </View>
    );
}
