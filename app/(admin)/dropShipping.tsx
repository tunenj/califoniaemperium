import React, { memo, useMemo, useState } from "react";
import { View, Text, FlatList, Image, ScrollView, TextInput, TouchableOpacity, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type VendorStatus = "Approved" | "Pending" | "Rejected";

type Product = {
    id: string;
    name: string;
    vendor: string;
    category: string;
    stock: number;
    price: string;
    cost: string;
    status: VendorStatus;
    created: string;
    image: any;
};

/* ================= DATA ================= */

const PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Italian Red Dress",
        vendor: "Fashion Forward",
        category: "Fashion",
        stock: 60,
        price: "₦20,000",
        cost: "₦14,000",
        status: "Approved",
        created: "Jan 3, 2026",
        image: require("@/assets/images/dress.png"),
    },
    {
        id: "2",
        name: "Smart Watch",
        vendor: "TechZone",
        category: "Electronics",
        stock: 20,
        price: "₦55,000",
        cost: "₦41,000",
        status: "Pending",
        created: "Jan 5, 2026",
        image: require("@/assets/images/watch.png"),
    },
    {
        id: "3",
        name: "Shoe",
        vendor: "TechZone",
        category: "Fashion",
        stock: 20,
        price: "₦65,000",
        cost: "₦31,000",
        status: "Rejected",
        created: "Jan 5, 2026",
        image: require("@/assets/images/shoe.png"),
    },
];

const SummaryCard = ({
    label,
    value,
    accent,
}: {
    label: string;
    value: string;
    accent: string;
}) => (
    <View className="w-44 h-44 bg-white rounded-2xl p-3 border border-gray-200 overflow-hidden mr-3">
        <View
            className={`absolute bottom-[-24px] right-[-24px] w-32 h-32 rounded-full ${accent}`}
        />
        <Text className="text-xs text-gray-500 mb-2">{label}</Text>
        <Text className="text-xl font-bold text-gray-900">{value}</Text>
    </View>
);

const StatusBadge = ({ status }: { status: VendorStatus }) => {
    const style =
        status === "Approved"
            ? "bg-green-100 text-green-700"
            : status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700";

    return (
        <View className={`px-4 py-0.5 rounded-full ${style}`}>
            <Text className="text-xs font-medium">{status}</Text>
        </View>
    );
};

const HeaderCell = memo(({ title, width }: { title: string; width: string }) => (
    <View className={`${width} px-4 py-3`}>
        <Text className="text-xs font-semibold text-gray-500">{title}</Text>
    </View>
));
HeaderCell.displayName = "HeaderCell";

const DataCell = memo(({ text, width }: { text: string; width: string }) => (
    <View className={`${width} px-4 py-3`}>
        <Text className="text-sm text-gray-700">{text}</Text>
    </View>
));
DataCell.displayName = "DataCell";

const ProductRow = memo(({ item }: { item: Product }) => (
    <View className="flex-row bg-white border-b border-gray-200">
        <View className="w-48 flex-row items-center gap-2 px-4 py-3">
            <Image source={item.image} className="w-9 h-9 rounded-md" />
            <Text className="text-sm font-semibold" numberOfLines={1}>
                {item.name}
            </Text>
        </View>

        <DataCell width="w-36" text={item.vendor} />
        <DataCell width="w-32" text={item.category} />
        <DataCell width="w-24" text={String(item.stock)} />

        <View className="w-36 px-4 py-3">
            <Text className="text-sm font-semibold">{item.price}</Text>
            <Text className="text-xs text-gray-500">Cost: {item.cost}</Text>
        </View>

        <View className="w-32 px-4 py-3">
            <StatusBadge status={item.status} />
        </View>

        <DataCell width="w-32" text={item.created} />
    </View>
));
ProductRow.displayName = "ProductRow";

/* ================= SCREEN ================= */

export default function ProductModeration() {
    const [search, setSearch] = useState("");

    const filteredData = useMemo(() => {
        return PRODUCTS.filter(
            (p) =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.vendor.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    return (
        <View className="flex-1 bg-gray-50 -mt-4">
            {/* Title + Add Product */}
            <View className="px-4 pt-5 flex-row items-center justify-between">
                <View>
                    <Text className="text-lg font-bold text-gray-900">
                        Dropshipping Products
                    </Text>
                    <Text className="text-xs text-gray-500">
                        Manage CJ Dropshipping product catalog
                    </Text>
                </View>

                <TouchableOpacity className="flex-row items-center bg-white px-4 py-2 border border-secondary rounded-lg">
                    <Ionicons name="add" size={18} color="#ef4444" />
                    <TouchableOpacity
                        onPress={() => router.push("/Products/addDropproject")}
                    >
                        <Text className="text-red-500 text-xs font-semibold">
                             Add Product
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>
            {/* Search */}
            <View className="px-4 mt-5">
                <View className="flex-row items-center bg-gray-100 border border-gray-400 rounded-lg px-3 py-0.5">
                    <Ionicons name="search-outline" size={18} color="#6b7280" />
                    <TextInput
                        placeholder="Search products..."
                        placeholderTextColor="#6b7280"
                        className="ml-2 flex-1 text-sm"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>
            {/* Summary Cards (Side Scroll) */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-8 pl-2"
            >
                <SummaryCard label="Total Products" value="7" accent="bg-green-300" />
                <SummaryCard label="Active Products" value="7" accent="bg-green-400" />
                <SummaryCard
                    label="Total Profit"
                    value="₦2,000,000"
                    accent="bg-orange-300"
                />
                <SummaryCard
                    label="Avg Margin"
                    value="₦200,000"
                    accent="bg-purple-300"
                />
            </ScrollView>

            {/* TABLE */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mt-32"
            >
                <View>
                    <FlatList
                        data={filteredData}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <ProductRow item={item} />}
                        showsVerticalScrollIndicator={false}
                        stickyHeaderIndices={[0]}
                        ListHeaderComponent={() => (
                            <View className="flex-row bg-gray-100 border-y border-gray-300">
                                <HeaderCell title="Products" width="w-48" />
                                <HeaderCell title="Vendor" width="w-36" />
                                <HeaderCell title="Category" width="w-32" />
                                <HeaderCell title="Stock" width="w-24" />
                                <HeaderCell title="Price" width="w-36" />
                                <HeaderCell title="Status" width="w-32" />
                                <HeaderCell title="Created" width="w-32" />
                            </View>
                        )}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
