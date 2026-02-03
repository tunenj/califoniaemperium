import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    TextInput
} from "react-native";
import { useRouter } from "expo-router";
import StoreCard from "@/components/home/StoreCard";
import images from "@/constants/images";
import { Search, X, SlidersHorizontal, ArrowLeft } from "lucide-react-native";
import { colors } from "@/constants/color";
import { useLanguage } from "@/context/LanguageContext";
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

// Define the Vendor interface (same as in FeaturedStores)
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
    verified_at: string;
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

type SortOption = 'rating' | 'sales' | 'name';
type FilterOption = 'all' | 'verified' | 'accepting_orders';

const StorePage = () => {
    const router = useRouter();
    const { t } = useLanguage();

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>('rating');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Get business type icon based on business_type
    const getBusinessIcon = useCallback((businessType: string, index: number) => {
        const type = businessType.toLowerCase();
        if (type.includes('tech') || type.includes('electronic') || type.includes('gadget') || type.includes('it')) {
            return { bg: images.electronicsBg, front: images.electronicsIcon };
        } else if (type.includes('fashion') || type.includes('apparel') || type.includes('clothing')) {
            return { bg: images.fashionBg, front: images.fashionIcon };
        } else if (type.includes('home') || type.includes('kitchen') || type.includes('essential') || type.includes('grocery')) {
            return { bg: images.groceryBg, front: images.groceryIcon };
        } else {
            // Default fallback based on position in array
            const imageMap = [
                { bg: images.electronicsBg, front: images.electronicsIcon },
                { bg: images.fashionBg, front: images.fashionIcon },
                { bg: images.groceryBg, front: images.groceryIcon },
                { bg: images.computerBg, front: images.computerIcon },
            ];
            return imageMap[index % imageMap.length];
        }
    }, []);

    // Format rating display
    const formatRating = useCallback((rating: string) => {
        const numRating = parseFloat(rating);
        return isNaN(numRating) ? "0.0" : numRating.toFixed(1);
    }, []);

    // Sort vendors based on selected option
    const sortVendors = useCallback((vendorsList: Vendor[], sortOption: SortOption) => {
        return [...vendorsList].sort((a, b) => {
            switch (sortOption) {
                case 'rating':
                    const ratingA = parseFloat(a.rating_average) || 0;
                    const ratingB = parseFloat(b.rating_average) || 0;
                    if (ratingB !== ratingA) return ratingB - ratingA;
                    return b.total_sales - a.total_sales;

                case 'sales':
                    return b.total_sales - a.total_sales;

                case 'name':
                    return a.business_name.localeCompare(b.business_name);

                default:
                    return 0;
            }
        });
    }, []);

    // Filter vendors based on search query and filter option
    const filterVendors = useCallback(() => {
        let filtered = [...vendors];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(vendor =>
                vendor.business_name.toLowerCase().includes(query) ||
                vendor.business_type.toLowerCase().includes(query) ||
                vendor.description?.toLowerCase().includes(query)
            );
        }

        // Apply filter option
        if (filterBy === 'verified') {
            filtered = filtered.filter(vendor => vendor.is_verified);
        } else if (filterBy === 'accepting_orders') {
            filtered = filtered.filter(vendor => vendor.is_accepting_orders);
        }

        // Apply sorting
        filtered = sortVendors(filtered, sortBy);

        setFilteredVendors(filtered);
    }, [vendors, searchQuery, filterBy, sortBy, sortVendors]);

    // Fetch vendors function
    const fetchVendors = useCallback(async (isRefreshing = false) => {
        try {
            if (!isRefreshing) {
                setLoading(true);
            }
            setError(null);

            const response = await api.get<VendorsResponse>(endpoints.getVendorList);

            if (response.data && response.data.results) {
                // Filter active vendors
                const activeVendors = response.data.results.filter(
                    vendor => vendor.is_active
                );

                setVendors(activeVendors);
            } else {
                setVendors([]);
            }
        } catch (error: any) {
            console.error("Error fetching vendors:", error);
            setError(error.message || t('failed_to_load_vendors') || "Failed to load vendors");
        } finally {
            setLoading(false);
            if (isRefreshing) {
                setRefreshing(false);
            }
        }
    }, [t]);

    // Apply filters whenever dependencies change
    useEffect(() => {
        filterVendors();
    }, [filterVendors]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchVendors(true);
    }, [fetchVendors]);

    const handleRetry = useCallback(() => {
        fetchVendors();
    }, [fetchVendors]);

    const handleClearSearch = useCallback(() => {
        setSearchQuery("");
    }, []);

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color={colors.darkRed} />
                <Text className="text-gray-500 text-sm mt-2">
                    {t('loading_stores') || "Loading stores..."}
                </Text>
            </View>
        );
    }

    if (error && vendors.length === 0) {
        return (
            <View className="flex-1 bg-white">
                {/* Header with Back Button */}
                <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft size={24} color={colors.darkRed} />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold ml-4">
                        {t("all_stores") || "All Stores"}
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-red-500 text-base mb-4 text-center">
                        {error}
                    </Text>
                    <TouchableOpacity
                        className="bg-darkRed px-6 py-3 rounded-lg"
                        onPress={handleRetry}
                    >
                        <Text className="text-white text-sm font-medium">
                            {t('retry') || "Try Again"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white pt-6">
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.darkRed]}
                    />
                }
                stickyHeaderIndices={[0]}
            >
                {/* Sticky Header with Search and Back Button */}
                <View className="bg-white pb-3 border-b border-gray-100">
                    <View className="px-4 pt-4">
                        {/* Back Button and Title Row */}
                        <View className="flex-row items-center mb-3">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="mr-3"
                            >
                                <ArrowLeft size={24} color={colors.darkRed} />
                            </TouchableOpacity>
                            <Text className="font-bold text-2xl text-gray-800">
                                {t("all_stores") || "All Stores"}
                            </Text>
                        </View>

                        {/* Search Bar */}
                        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-1 mb-3">
                            <Search size={20} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 ml-2 text-base text-gray-800"
                                placeholder={t("search_stores") || "Search stores..."}
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={handleClearSearch}>
                                    <X size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Filter and Sort Row */}
                        <View className="flex-row items-center justify-between">
                            <Text className="text-sm text-gray-500">
                                {filteredVendors.length} {t("stores_available") || "stores available"}
                            </Text>

                            <TouchableOpacity
                                className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
                                onPress={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal size={16} color={colors.darkRed} />
                                <Text className="text-darkRed text-sm ml-2 font-medium">
                                    {t("filters") || "Filters"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Expandable Filters */}
                        {showFilters && (
                            <View className="mt-3 bg-gray-50 rounded-xl p-4">
                                {/* Sort By */}
                                <Text className="text-sm font-semibold text-gray-800 mb-2">
                                    {t("sort_by") || "Sort By"}
                                </Text>
                                <View className="flex-row flex-wrap gap-2 mb-4">
                                    {[
                                        { key: 'rating', label: t("highest_rated") || "Highest Rated" },
                                        { key: 'sales', label: t("most_sales") || "Most Sales" },
                                        { key: 'name', label: t("name_az") || "Name (A-Z)" }
                                    ].map((option) => (
                                        <TouchableOpacity
                                            key={option.key}
                                            className={`px-4 py-2 rounded-lg ${sortBy === option.key
                                                ? 'bg-darkRed'
                                                : 'bg-white border border-gray-300'
                                                }`}
                                            onPress={() => setSortBy(option.key as SortOption)}
                                        >
                                            <Text className={`text-sm ${sortBy === option.key
                                                ? 'text-white font-medium'
                                                : 'text-gray-700'
                                                }`}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Filter By */}
                                <Text className="text-sm font-semibold text-gray-800 mb-2">
                                    {t("filter_by") || "Filter By"}
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {[
                                        { key: 'all', label: t("all_stores") || "All Stores" },
                                        { key: 'verified', label: t("verified_only") || "Verified Only" },
                                        { key: 'accepting_orders', label: t("accepting_orders") || "Accepting Orders" }
                                    ].map((option) => (
                                        <TouchableOpacity
                                            key={option.key}
                                            className={`px-4 py-2 rounded-lg ${filterBy === option.key
                                                ? 'bg-darkRed'
                                                : 'bg-white border border-gray-300'
                                                }`}
                                            onPress={() => setFilterBy(option.key as FilterOption)}
                                        >
                                            <Text className={`text-sm ${filterBy === option.key
                                                ? 'text-white font-medium'
                                                : 'text-gray-700'
                                                }`}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Error Banner */}
                {error && vendors.length > 0 && (
                    <View className="px-4 mb-4 mt-4">
                        <View className="bg-red-50 p-3 rounded-lg">
                            <Text className="text-red-500 text-sm">{error}</Text>
                        </View>
                    </View>
                )}

                {/* Stores Grid */}
                <View className="px-4 pb-6 pt-4">
                    {filteredVendors.length > 0 ? (
                        <View className="flex-row flex-wrap justify-between">
                            {filteredVendors.map((vendor, index) => {
                                const businessImages = getBusinessIcon(vendor.business_type, index);
                                const bg = vendor.banner || businessImages.bg;
                                const front = vendor.logo || businessImages.front;

                                return (
                                    <StoreCard
                                        key={vendor.id}
                                        title={vendor.business_name}
                                        bg={bg}
                                        front={front}
                                        rating={formatRating(vendor.rating_average)}
                                        sales={vendor.total_sales}
                                        isVerified={vendor.is_verified}
                                        onVisitStore={() =>
                                            router.push({
                                                pathname: "/(customer)/store/[slug]",
                                                params: {
                                                    id: vendor.id,
                                                    storeName: vendor.business_name,
                                                    slug: vendor.business_slug, // Required by the route
                                                    storeSlug: vendor.business_slug, // Additional parameter if needed elsewhere
                                                },
                                            })
                                        }
                                        onFollow={() => console.log("Follow", vendor.business_name)}
                                    />
                                );
                            })}
                        </View>
                    ) : (
                        <View className="items-center justify-center py-20">
                            <Search size={48} color="#D1D5DB" />
                            <Text className="text-gray-400 text-base mt-4">
                                {searchQuery.trim()
                                    ? (t("no_stores_match_search") || "No stores match your search")
                                    : (t("no_stores_available") || "No stores available at the moment")
                                }
                            </Text>
                            {searchQuery.trim() && (
                                <TouchableOpacity
                                    className="mt-4 bg-darkRed px-6 py-2 rounded-lg"
                                    onPress={handleClearSearch}
                                >
                                    <Text className="text-white text-sm">
                                        {t("clear_search") || "Clear Search"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default StorePage;