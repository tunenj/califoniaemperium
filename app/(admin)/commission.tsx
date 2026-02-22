import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EditCommissionTable from "@/app/commissionTable/EditCommissionModal";
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ================= TYPES ================= */

interface VendorEarning {
  id: string;
  vendor_name: string;
  business_slug: string;
  total_earnings: number;
  commission_rate: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: VendorEarning[];
}

// Helper function to format price in euros
const formatPrice = (price: number) => {
  return `€${price.toLocaleString('de-DE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/* ================= ROW ================= */

const TableRow = memo(
  ({
    vendor,
    onEdit,
  }: {
    vendor: VendorEarning;
    onEdit: () => void;
  }) => {
    const initial = vendor.vendor_name.charAt(0).toUpperCase();

    // Calculate platform earnings (commission)
    const platformEarnings = (vendor.total_earnings * vendor.commission_rate) / 100;
    
    // Vendor keeps the rest
    const vendorEarnings = vendor.total_earnings - platformEarnings;

    return (
      <View className="flex-row px-5 py-4 bg-white border-b border-gray-100">
        <View className="w-44 flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
            <Text className="text-red-600 font-bold">{initial}</Text>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-900">
              {vendor.vendor_name}
            </Text>
            <Text className="text-xs text-gray-500">
              {vendor.business_slug}
            </Text>
          </View>
        </View>

        <Text className="w-32 text-sm text-green-600">
          {formatPrice(vendor.total_earnings)}
        </Text>

        <Text className="w-28 text-sm text-gray-700">
          {vendor.commission_rate}%
        </Text>

        <Text className="w-36 text-sm text-green-600">
          {formatPrice(platformEarnings)}
        </Text>

        <Text className="w-36 text-sm text-blue-600">
          {formatPrice(vendorEarnings)}
        </Text>

        <Text className="w-20 text-sm text-gray-700">
          {Math.floor(vendor.total_earnings / 10000)} {/* Rough estimate of orders */}
        </Text>

        <Pressable
          className="w-16 items-center justify-center"
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={18} color="#6B7280" />
        </Pressable>
      </View>
    );
  }
);

TableRow.displayName = "TableRow";

/* ================= COMMISSION STRUCTURE ================= */

const CommissionStructure = memo(() => {
  const { t } = useLanguage();
  
  return (
    <View className="px-5 mt-4 mb-16">
      <Text className="text-sm font-semibold text-gray-900 mb-4">
        {t('commission_structure') || 'Commission Structure'}
      </Text>

      <View className="flex-row gap-4">
        <View className="flex-1 bg-white rounded-xl border border-red-200 p-4">
          <Text className="text-xs font-semibold text-red-600">
            {t('standard_rate') || 'Standard Rate'}
          </Text>
          <Text className="text-lg font-bold text-red-600 mt-1">15-20%</Text>
          <Text className="text-xs text-gray-500 mt-2">
            {t('default_commission_new_vendors') || 'Default for new vendors'}
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-xl border border-purple-200 p-4">
          <Text className="text-xs font-semibold text-purple-600">
            {t('volume_discount') || 'Volume Discount'}
          </Text>
          <Text className="text-lg font-bold text-purple-600 mt-1">7-10%</Text>
          <Text className="text-xs text-gray-500 mt-2">
            €100k+ {t('monthly_sales') || 'monthly sales'}
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-xl border border-red-200 p-4">
          <Text className="text-xs font-semibold text-red-600">
            {t('premium_partners') || 'Premium Partners'}
          </Text>
          <Text className="text-lg font-bold text-red-600 mt-1">5%</Text>
          <Text className="text-xs text-gray-500 mt-2">
            {t('enterprise_vendors') || 'Enterprise vendors'}
          </Text>
        </View>
      </View>
    </View>
  );
});

CommissionStructure.displayName = "CommissionStructure";

/* ================= SCREEN ================= */

const CommissionManagement = () => {
  const [vendors, setVendors] = useState<VendorEarning[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<VendorEarning[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorEarning | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();

  // Fetch vendors earnings data from API
  const fetchVendorsEarnings = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = await AsyncStorage.getItem('accessToken');
      
      const response = await api.get<ApiResponse>(endpoints.getVendorEarning, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });

      console.log('Vendors earnings response:', response.data);
      
      if (response.data.success && response.data.data) {
        setVendors(response.data.data);
        setFilteredVendors(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching vendors earnings:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load vendors earnings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVendorsEarnings();
  }, [fetchVendorsEarnings]);

  // Filter vendors based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVendors(vendors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = vendors.filter(v => 
        v.vendor_name.toLowerCase().includes(query) ||
        v.business_slug.toLowerCase().includes(query)
      );
      setFilteredVendors(filtered);
    }
  }, [searchQuery, vendors]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (vendors.length === 0) {
      return {
        totalPlatformEarnings: "€0.00",
        totalVendorEarnings: "€0.00",
        avgCommissionRate: "0%",
        activeVendors: "0",
        totalEarnings: "€0.00",
      };
    }

    // Calculate total earnings across all vendors
    const totalEarnings = vendors.reduce((sum, v) => sum + v.total_earnings, 0);
    
    // Calculate platform earnings (commission)
    const totalPlatformEarnings = vendors.reduce((sum, v) => {
      return sum + (v.total_earnings * v.commission_rate / 100);
    }, 0);
    
    // Calculate vendor earnings (after commission)
    const totalVendorEarnings = totalEarnings - totalPlatformEarnings;
    
    // Calculate average commission rate
    const avgCommission = vendors.reduce((sum, v) => sum + v.commission_rate, 0) / vendors.length;

    return {
      totalPlatformEarnings: formatPrice(totalPlatformEarnings),
      totalVendorEarnings: formatPrice(totalVendorEarnings),
      totalEarnings: formatPrice(totalEarnings),
      avgCommissionRate: `${avgCommission.toFixed(1)}%`,
      activeVendors: vendors.length.toString(),
    };
  }, [vendors]);

  const handleSaveCommission = (newRate: number) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === selectedVendor?.id
          ? { ...v, commission_rate: newRate }
          : v
      )
    );
    setFilteredVendors((prev) =>
      prev.map((v) =>
        v.id === selectedVendor?.id
          ? { ...v, commission_rate: newRate }
          : v
      )
    );
    setSelectedVendor(null);
    
    Alert.alert(
      t('success') || 'Success',
      t('commission_updated') || 'Commission rate updated successfully'
    );
  };

  const handleRefresh = useCallback(() => {
    fetchVendorsEarnings(true);
  }, [fetchVendorsEarnings]);

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="mt-4 text-gray-600">Loading earnings data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
        <Text className="text-red-600 text-center mt-4">{error}</Text>
        <Pressable 
          onPress={() => fetchVendorsEarnings()}
          className="mt-4 bg-red-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white -mt-6">
      {/* HEADER */}
      <View className="px-5 pt-6">
        <Text className="text-lg font-semibold text-gray-900">
          {t('commission_management') || 'Commission & Earnings'}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t('manage_vendor_commissions') || 'Track vendor earnings and manage commission rates'}
        </Text>

        <View className="mt-4 flex-row items-center rounded-xl bg-gray-100 px-4 h-11">
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            placeholder={t('search_vendors') || 'Search vendors...'}
            placeholderTextColor="#6b7280"
            className="flex-1 ml-2 text-sm text-gray-700"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
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
          <View className="absolute bottom-[-24px] right-[-24px] w-32 h-40 rounded-full bg-emerald-300" />
          <Text className="text-xs text-gray-500 mb-2">
            {t('total_earnings') || 'Total Earnings'}
          </Text>
          <Text className="text-xl font-bold text-gray-900">
            {summaryStats.totalEarnings}
          </Text>
          <Text className="text-xs text-gray-500 mt-2">All vendors combined</Text>
        </View>

        <View className="w-44 h-44 bg-white rounded-2xl p-3 border border-gray-200 overflow-hidden mr-3">
          <View className="absolute bottom-[-24px] right-[-24px] w-32 h-40 rounded-full bg-green-300" />
          <Text className="text-xs text-gray-500 mb-2">
            {t('platform_earnings') || 'Platform Earnings'}
          </Text>
          <Text className="text-xl font-bold text-gray-900">
            {summaryStats.totalPlatformEarnings}
          </Text>
          <Text className="text-xs text-gray-500 mt-2">Commission collected</Text>
        </View>

        <View className="w-44 h-44 bg-white rounded-2xl p-3 border border-gray-200 overflow-hidden mr-3">
          <View className="absolute bottom-[-24px] right-[-24px] w-32 h-40 rounded-full bg-blue-300" />
          <Text className="text-xs text-gray-500 mb-2">
            {t('vendor_earnings') || 'Vendor Earnings'}
          </Text>
          <Text className="text-xl font-bold text-gray-900">
            {summaryStats.totalVendorEarnings}
          </Text>
          <Text className="text-xs text-gray-500 mt-2">After commission</Text>
        </View>

        <View className="w-44 h-44 bg-white rounded-2xl p-3 border border-gray-200 overflow-hidden mr-3">
          <View className="absolute bottom-[-24px] right-[-24px] w-32 h-40 rounded-full bg-orange-300" />
          <Text className="text-xs text-gray-500 mb-2">
            {t('avg_commission') || 'Avg Commission'}
          </Text>
          <Text className="text-xl font-bold text-gray-900">
            {summaryStats.avgCommissionRate}
          </Text>
          <Text className="text-xs text-gray-500 mt-2">Across all vendors</Text>
        </View>

        <View className="w-44 h-44 bg-white rounded-2xl p-3 border border-gray-200 overflow-hidden mr-3">
          <View className="absolute bottom-[-24px] right-[-24px] w-32 h-40 rounded-full bg-purple-300" />
          <Text className="text-xs text-gray-500 mb-2">
            {t('total_vendors') || 'Total Vendors'}
          </Text>
          <Text className="text-xl font-bold text-gray-900">
            {summaryStats.activeVendors}
          </Text>
          <Text className="text-xs text-gray-500 mt-2">Active vendors</Text>
        </View>
      </ScrollView>

      {/* TABLE */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <FlatList
            data={filteredVendors}
            keyExtractor={(item) => item.id}
            stickyHeaderIndices={[0]}
            ListHeaderComponent={() => (
              <View className="flex-row bg-gray-100 px-5 py-3 border-y border-gray-200">
                <Text className="w-44 text-xs font-semibold text-gray-500">
                  {t('vendor') || 'Vendor'}
                </Text>
                <Text className="w-32 text-xs font-semibold text-gray-500">
                  {t('total_earnings') || 'Total Earnings'}
                </Text>
                <Text className="w-28 text-xs font-semibold text-gray-500">
                  {t('commission_rate') || 'Commission'}
                </Text>
                <Text className="w-36 text-xs font-semibold text-gray-500">
                  {t('platform_earnings') || 'Platform Earnings'}
                </Text>
                <Text className="w-36 text-xs font-semibold text-gray-500">
                  {t('vendor_net') || 'Vendor Net'}
                </Text>
                <Text className="w-20 text-xs font-semibold text-gray-500">
                  {t('orders_est') || 'Orders'}
                </Text>
                <Text className="w-16 text-xs font-semibold text-gray-500 text-center">
                  {t('action') || 'Action'}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TableRow
                vendor={item}
                onEdit={() => setSelectedVendor(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View className="py-10 items-center">
                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">No vendors found</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      <CommissionStructure />

      {selectedVendor && (
        <EditCommissionTable
          visible
          vendorName={selectedVendor.vendor_name}
          vendorEmail={selectedVendor.business_slug}
          vendorSlug={selectedVendor.business_slug}
          commissionRate={selectedVendor.commission_rate}
          totalSales={selectedVendor.total_earnings}
          onClose={() => setSelectedVendor(null)}
          onSave={handleSaveCommission}
        />
      )}
    </View>
  );
};

export default CommissionManagement;