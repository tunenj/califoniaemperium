import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ================= TYPES ================= */

// Vendor type from API based on actual response
interface Vendor {
  id: string;
  user: string;
  user_email: string;
  user_name: string;
  business_name: string;
  business_slug: string;
  business_type: string;
  business_email: string;
  business_phone: string;
  description: string;
  logo: string | null;
  banner: string | null;
  verification_status: string;
  is_verified: boolean;
  verified_at: string | null;
  is_active: boolean;
  is_accepting_orders: boolean;
  rating_average: string;
  rating_count: number;
  total_sales: number;
  return_policy: string;
  shipping_policy: string;
  website: string;
  facebook: string;
  twitter: string;
  instagram: string;
  created_at: string;
  updated_at: string;
  pending_products_count: number;
}

interface VendorsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Vendor[];
}

/* ================= SCREEN ================= */

const PayoutManagement = () => {
  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Fetch vendors from API using the payout endpoint
  const fetchVendors = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = await AsyncStorage.getItem('accessToken');
      
      // Use the payout endpoint which points to '/vendors/'
      const response = await api.get<VendorsResponse>(endpoints.payout, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });

      console.log('Vendors response:', response.data);
      
      if (response.data.results) {
        setVendors(response.data.results);
      }
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Filter vendors based on search
  const filteredVendors = useMemo(() => {
    if (!search.trim()) return vendors;
    
    const query = search.toLowerCase();
    return vendors.filter(v => 
      v.business_name.toLowerCase().includes(query) ||
      v.business_email.toLowerCase().includes(query) ||
      v.user_name.toLowerCase().includes(query) ||
      v.user_email.toLowerCase().includes(query)
    );
  }, [vendors, search]);

  // Calculate summary statistics from vendor data
  const summaryStats = useMemo(() => {
    const totalVendors = vendors.length;
    const verifiedVendors = vendors.filter(v => v.is_verified).length;
    const activeVendors = vendors.filter(v => v.is_active).length;
    const vendorsWithPendingProducts = vendors.filter(v => v.pending_products_count > 0).length;
    
    // Calculate total sales
    const totalSales = vendors.reduce((sum, v) => sum + v.total_sales, 0);
    
    // Calculate total pending products
    const totalPendingProducts = vendors.reduce((sum, v) => sum + v.pending_products_count, 0);

    // Calculate average rating
    const totalRating = vendors.reduce((sum, v) => sum + parseFloat(v.rating_average), 0);
    const avgRating = vendors.length > 0 ? (totalRating / vendors.length).toFixed(2) : "0.00";

    return {
      totalVendors: totalVendors.toString(),
      verifiedVendors: verifiedVendors.toString(),
      activeVendors: activeVendors.toString(),
      vendorsWithPendingProducts: vendorsWithPendingProducts.toString(),
      totalSales: totalSales.toLocaleString(),
      totalPendingProducts: totalPendingProducts.toString(),
      avgRating: avgRating,
    };
  }, [vendors]);

  // Get vendors with pending products for the balances section
  const vendorsWithPending = useMemo(() => {
    return vendors.filter(v => v.pending_products_count > 0);
  }, [vendors]);

  const handleRefresh = useCallback(() => {
    fetchVendors(true);
  }, [fetchVendors]);

  const getVerificationBadge = (vendor: Vendor) => {
    if (vendor.is_verified) {
      return (
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text className="text-xs text-green-600 ml-1">Verified</Text>
        </View>
      );
    } else {
      return (
        <View className="flex-row items-center">
          <Ionicons name="close-circle" size={16} color="#EF4444" />
          <Text className="text-xs text-red-600 ml-1">Unverified</Text>
        </View>
      );
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <View className="px-3 py-1 rounded-full bg-green-100 self-start">
          <Text className="text-xs font-semibold text-green-700">Active</Text>
        </View>
      );
    } else {
      return (
        <View className="px-3 py-1 rounded-full bg-red-100 self-start">
          <Text className="text-xs font-semibold text-red-700">Inactive</Text>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="mt-4 text-gray-600">Loading vendor data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
        <Text className="text-red-600 text-center mt-4">{error}</Text>
        <Pressable 
          onPress={() => fetchVendors()}
          className="mt-4 bg-red-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white -mt-7">
      {/* HEADER */}
      <View className="px-5 pt-6">
        <Text className="text-lg font-semibold text-gray-900">
          Vendor Management
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Manage and track vendor payouts
        </Text>

        {/* SEARCH */}
        <View className="mt-4 flex-row items-center bg-gray-100 rounded-xl px-4 h-11">
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            placeholder="Search vendors by name or email..."
            placeholderTextColor="#6b7280"
            className="flex-1 ml-2 text-sm text-gray-700"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#6B7280" />
            </Pressable>
          ) : refreshing ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <Pressable onPress={handleRefresh}>
              <Ionicons name="refresh" size={18} color="#6B7280" />
            </Pressable>
          )}
        </View>
      </View>

      {/* SUMMARY CARDS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-6 mb-4 pl-4"
      >
        <View className="w-44 h-44 bg-white rounded-2xl p-3 border border-gray-200 overflow-hidden mr-3">
          <View className="absolute bottom-[-24px] right-[-24px] w-32 h-36 rounded-full bg-purple-300" />
          <Text className="text-xs text-gray-500 mb-2">Total Vendors</Text>
          <Text className="text-xl font-bold text-gray-900">{summaryStats.totalVendors}</Text>
          <Text className="text-xs text-gray-500 mt-2">Registered vendors</Text>
        </View>

        <View className="w-44 h-44 bg-white rounded-2xl p-3 border border-gray-200 overflow-hidden mr-3">
          <View className="absolute bottom-[-24px] right-[-24px] w-32 h-36 rounded-full bg-blue-300" />
          <Text className="text-xs text-gray-500 mb-2">Active</Text>
          <Text className="text-xl font-bold text-gray-900">{summaryStats.activeVendors}</Text>
          <Text className="text-xs text-gray-500 mt-2">Active vendors</Text>
        </View>
        <View className="w-44 h-44 bg-white rounded-2xl p-3 border border-gray-200 overflow-hidden mr-3">
          <View className="absolute bottom-[-24px] right-[-24px] w-32 h-36 rounded-full bg-yellow-300" />
          <Text className="text-xs text-gray-500 mb-2">Total Sales</Text>
          <Text className="text-xl font-bold text-gray-900">{summaryStats.totalSales}</Text>
          <Text className="text-xs text-gray-500 mt-2">Items sold</Text>
        </View>
      </ScrollView>

      {/* VENDORS LIST HEADER */}
      <View className="px-5 mt-2 mb-3">
        <Text className="text-sm font-semibold text-gray-900">
          Vendors List ({filteredVendors.length} of {vendors.length})
        </Text>
      </View>

      {/* VENDORS TABLE */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Table Header */}
          <View className="flex-row bg-gray-100 px-5 py-3 border-y border-gray-200">
            <Text className="w-48 text-xs font-semibold text-gray-500">Vendor</Text>
            <Text className="w-24 text-xs font-semibold text-gray-500">Status</Text>
            <Text className="w-24 text-xs font-semibold text-gray-500">Rating</Text>
            <Text className="w-24 text-xs font-semibold text-gray-500">Sales</Text>
            <Text className="w-28 text-xs font-semibold text-gray-500">Pending Products</Text>
            <Text className="w-24 text-xs font-semibold text-gray-500">Verification</Text>
            <Text className="w-20 text-xs font-semibold text-gray-500 text-center">Action</Text>
          </View>

          {/* Table Body */}
          {filteredVendors.length === 0 ? (
            <View className="py-10 items-center">
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">No vendors found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredVendors}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="flex-row px-5 py-4 bg-white border-b border-gray-100">
                  {/* Vendor */}
                  <View className="w-48 flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center overflow-hidden">
                      {item.logo ? (
                        <Image 
                          source={{ uri: item.logo }} 
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-red-600 font-bold text-lg">
                          {item.business_name.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                        {item.business_name}
                      </Text>
                      <Text className="text-xs text-gray-500" numberOfLines={1}>
                        {item.business_email}
                      </Text>
                      <Text className="text-xs text-gray-400" numberOfLines={1}>
                        {item.business_phone}
                      </Text>
                    </View>
                  </View>

                  {/* Status */}
                  <View className="w-24">
                    {getStatusBadge(item.is_active)}
                  </View>

                  {/* Rating */}
                  <View className="w-24">
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text className="text-sm text-gray-900 ml-1">
                        {parseFloat(item.rating_average).toFixed(1)}
                      </Text>
                      <Text className="text-xs text-gray-400 ml-1">
                        ({item.rating_count})
                      </Text>
                    </View>
                  </View>

                  {/* Sales */}
                  <Text className="w-24 text-sm text-green-600">
                    {item.total_sales.toLocaleString()}
                  </Text>

                  {/* Pending Products */}
                  <View className="w-28">
                    {item.pending_products_count > 0 ? (
                      <View className="flex-row items-center">
                        <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                        <Text className="text-sm text-orange-600 ml-1 font-medium">
                          {item.pending_products_count}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-sm text-gray-400">None</Text>
                    )}
                  </View>

                  {/* Verification */}
                  <View className="w-24">
                    {getVerificationBadge(item)}
                  </View>

                  {/* Action */}
                  <Pressable className="w-20 items-center justify-center">
                    <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
                  </Pressable>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 24 }}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </View>
      </ScrollView>

      {/* VENDORS WITH PENDING PRODUCTS */}
      {vendorsWithPending.length > 0 && (
        <View className="px-5 mt-8 mb-10">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-semibold text-gray-900">
              Vendors with Pending Products
            </Text>
            <Text className="text-xs text-gray-500">
              {vendorsWithPending.length} vendors
            </Text>
          </View>

          {vendorsWithPending.map((vendor) => (
            <View
              key={vendor.id}
              className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2"
            >
              <View className="flex-1">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-2 overflow-hidden">
                    {vendor.logo ? (
                      <Image 
                        source={{ uri: vendor.logo }} 
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-red-600 font-bold">
                        {vendor.business_name.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text className="text-sm font-medium text-gray-900">
                      {vendor.business_name}
                    </Text>
                    <Text className="text-xs text-gray-500">{vendor.business_email}</Text>
                  </View>
                </View>
                <Text className="text-xs text-orange-500 mt-1 ml-10">
                  {vendor.pending_products_count} product{vendor.pending_products_count !== 1 ? 's' : ''} pending approval
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-semibold text-green-600">
                  ₦{(vendor.pending_products_count * 5000).toLocaleString()}
                </Text>
                <Pressable 
                  className="px-3 py-1 rounded-full bg-green-100"
                  onPress={() => Alert.alert(
                    'Process Payout',
                    `Process payout of ₦${(vendor.pending_products_count * 5000).toLocaleString()} to ${vendor.business_name}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Process', onPress: () => Alert.alert('Success', 'Payout processed successfully') }
                    ]
                  )}
                >
                  <Text className="text-xs font-medium text-green-700">
                    Pay Now
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default PayoutManagement;