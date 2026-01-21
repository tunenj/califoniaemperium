import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/* ================= TYPES ================= */

type VendorStatus = "Approved" | "Pending" | "Suspended";

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
    vendor: "TechShoe",
    category: "Fashion",
    stock: 30,
    price: "₦65,000",
    cost: "₦51,000",
    status: "Suspended",
    created: "Jan 5, 2026",
    image: require("@/assets/images/shoe.png"),
  },
];

/* ================= ROW ================= */

function ProductRow({ item }: { item: Product }) {
  return (
    <View className="flex-row border-b border-gray-200 py-3 bg-white">
      {/* Product */}
      <View className="w-48 px-3 flex-row items-center gap-2">
        <Image source={item.image} className="w-9 h-9 rounded-md" />
        <Text
          numberOfLines={1}
          className="text-sm font-semibold"
        >
          {item.name}
        </Text>
      </View>

      {/* Vendor */}
      <Cell width="w-36" text={item.vendor} />

      {/* Category */}
      <Cell width="w-32" text={item.category} />

      {/* Stock */}
      <Cell width="w-24" text={String(item.stock)} />

      {/* Price */}
      <View className="w-36 px-3">
        <Text className="text-sm font-semibold">{item.price}</Text>
        <Text className="text-xs text-gray-500">
          Cost: {item.cost}
        </Text>
      </View>

      {/* Status */}
      <View className="w-32 px-3">
        <Text
          className={`text-xs px-3 py-0.5 rounded-full text-center ${item.status === "Approved"
              ? "bg-green-100 text-green-700"
              : item.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
        >
          {item.status}
        </Text>
      </View>

      {/* Created */}
      <Cell width="w-32" text={item.created} />
    </View>
  );
}

/* ================= SCREEN ================= */

export default function ProductModeration() {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<
    "All" | VendorStatus
  >("All");

  const data = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.vendor.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        activeStatus === "All" || p.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [search, activeStatus]);

  return (
    <View className="flex-1 bg-white px-4">
      {/* Title */}
      <Text className="text-lg font-bold text-gray-900">
        Product Moderation
      </Text>
      <Text className="text-sm text-gray-500 mb-4">
        Review and approve vendor products
      </Text>

      {/* Search */}
      <View className="flex-row items-center bg-gray-100 rounded-xl border border-gray-300 px-3 py-1 mb-4">
        <Ionicons
          name="search-outline"
          size={20}
          color="#6b7280"
        />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#6b7280"
          className="flex-1 ml-2 text-sm"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* STATUS FILTERS */}
      <View className="flex-row gap-2 mb-4">
        {["All", "Pending", "Approved", "Suspended"].map(
          (status) => {
            const isActive = activeStatus === status;

            return (
              <TouchableOpacity
                key={status}
                onPress={() =>
                  setActiveStatus(status as any)
                }
                className={`px-4 py-1 rounded-full ${isActive
                    ? "bg-red-600"
                    : "bg-gray-100"
                  }`}
              >
                <Text
                  className={`text-xs ${isActive
                      ? "text-white font-semibold"
                      : "text-gray-600"
                    }`}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </View>

      {/* TABLE */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductRow item={item} />}
            stickyHeaderIndices={[0]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <View className="flex-row border-b  border-gray-300 bg-gray-100">
                <Header title="Products" width="w-48" />
                <Header title="Vendor" width="w-36" />
                <Header title="Category" width="w-32" />
                <Header title="Stock" width="w-24" />
                <Header title="Price" width="w-36" />
                <Header title="Status" width="w-32" />
                <Header title="Created" width="w-32" />
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* ================= SMALL COMPONENTS ================= */

const Header = ({
  title,
  width,
}: {
  title: string;
  width: string;
}) => (
  <Text
    className={`${width} px-3 text-xm font-semibold text-gray-500 mt-4`}
  >
    {title}
  </Text>
);

const Cell = ({
  text,
  width,
}: {
  text: string;
  width: string;
}) => (
  <Text
    className={`${width} px-3 text-sm text-gray-600`}
  >
    {text}
  </Text>
);
