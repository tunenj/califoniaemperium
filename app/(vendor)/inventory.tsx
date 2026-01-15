import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/* ---------- Types ---------- */

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  image: any; // 👈 local require
};

type StatCard = {
  id: string;
  label: string;
  value: string;
  type: "active" | "default" | "warning" | "danger";
};

/* ---------- Data ---------- */

const STATS: StatCard[] = [
  { id: "1", label: "All Product", value: "100", type: "active" },
  { id: "2", label: "In Stock", value: "60", type: "default" },
  { id: "3", label: "Low Stock", value: "20", type: "warning" },
  { id: "4", label: "Out of Stock", value: "20", type: "danger" },
];

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Italian Red Dress",
    sku: "IT-0001",
    category: "Fashion",
    stock: 60,
    image: require("../../assets/images/cloth.png"),
  },
  {
    id: "2",
    name: "G-shock wrist watch",
    sku: "WW-0002",
    category: "Fashion",
    stock: 60,
    image: require("../../assets/images/watch.png"),
  },
  {
    id: "3",
    name: "Italian Red Dress",
    sku: "IT-0003",
    category: "Fashion",
    stock: 60,
    image: require("../../assets/images/dress.png"),
  },
  {
    id: "4",
    name: "Casual sneakers",
    sku: "SH-0004",
    category: "Shoes",
    stock: 60,
    image: require("../../assets/images/sneakers.png"),
  },
  {
    id: "5",
    name: "Samsung smart tv",
    sku: "PV-0005",
    category: "Electronics",
    stock: 60,
    image: require("../../assets/images/monitor.png"),
  },
  {
    id: "6",
    name: "HP Laptop core i7",
    sku: "HP-0006",
    category: "Gadgets",
    stock: 60,
    image: require("../../assets/images/laptop.png"),
  },
];

/* ---------- Screen ---------- */

export default function InventoryScreen() {
  return (
    <View className="flex-1 bg-white px-5 pt-5">
      {/* Header */}
      <Text className="text-lg font-semibold text-gray-900">
        Inventory
      </Text>
      <Text className="text-xs text-gray-400 mt-1">
        Track and manage your stock levels.
      </Text>

      {/* Stat Cards – Horizontal Scroll */}
      <FlatList
        data={STATS}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingVertical: 8 }}
        className="mt-4"
        renderItem={({ item }) => (
          <InventoryCard
            label={item.label}
            value={item.value}
            type={item.type}
          />
        )}
      />

      {/* Search */}
      <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2.5 mt-4">
        <Ionicons name="search" size={16} color="#9ca3af" />
        <TextInput
          placeholder="search by name or SKU..."
          className="ml-2 flex-1 text-xs text-gray-700"
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Table Header */}
      <View className="flex-row mt-6 text-xs font-medium bg-gray-100 p-6 -mx-5 text-black pb-4">
        <Text className="w-[38%]">
          Products
        </Text>
        <Text className="w-[20%]">
          SKU
        </Text>
        <Text className="w-[22%]">
          Category
        </Text>
        <Text className="w-[20%] text-right">
          Stock
        </Text>
      </View>

      {/* Product List */}
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="flex-row items-center py-4 border-b border-gray-50">
            {/* Product */}
            <View className="w-[38%] flex-row items-center">
              <Image
                source={item.image}
                className="w-9 h-9 rounded-full mr-3 bg-gray-200"
                resizeMode="cover"
              />
              <Text className="text-xs text-gray-700" numberOfLines={2}>
                {item.name}
              </Text>
            </View>

            {/* SKU */}
            <Text className="w-[20%] text-xs text-gray-600">
              {item.sku}
            </Text>

            {/* Category */}
            <Text className="w-[22%] text-xs text-gray-600">
              {item.category}
            </Text>

            {/* Stock */}
            <Text className="w-[20%] text-xs text-gray-700 text-right">
              {item.stock}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

/* ---------- Components ---------- */

type CardProps = {
  label: string;
  value: string;
  type: "active" | "default" | "warning" | "danger";
};

function InventoryCard({ label, value, type }: CardProps) {
  const styles = {
    active: "border-orange-200 bg-orange-50",
    default: "border-gray-200 bg-gray-50",
    warning: "border-yellow-200 bg-yellow-50",
    danger: "border-red-200 bg-red-50",
  };

  return (
    <View className={`w-40 rounded-xl p-4 border ${styles[type]}`}>
      <Text className="text-xs text-gray-500">
        {label}
      </Text>
      <Text className="text-lg font-semibold text-gray-900 mt-1">
        {value}
      </Text>
    </View>
  );
}
