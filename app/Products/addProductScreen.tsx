import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    ActivityIndicator,
    Modal,
    FlatList,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from "@/context/AuthContext";
import api from "@/api/api";
import { endpoints } from "@/api/endpoints";
import { showToast } from "@/utils/toastHelper";
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProductStatus = "active" | "inactive" | "draft";

interface ProductFormData {
    product_type: string;
    name: string;
    sku: string;
    description: string;
    short_description: string;
    category: string;
    brand: string;
    tags: string[];
    price: string;
    compare_at_price: string;
    cost_price: string;
    stock_quantity: string;
    low_stock_threshold: string;
    track_inventory: boolean;
    weight: string;
    length: string;
    width: string;
    height: string;
    condition: string;
    is_featured: boolean;
    requires_shipping: boolean;
    is_digital: boolean;
    meta_title: string;
    meta_description: string;
    status: ProductStatus;
}

interface Variant {
    sku: string;
    name: string;
    options: {
        [key: string]: string;
    };
    price_adjustment: string;
    stock_quantity: string;
}

interface Attribute {
    name: string;
    value: string;
    order: number;
}

// Category Interface
interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string | null;
    icon: string;
    parent: string | null;
    children: Category[];
    full_path: string;
    order: number;
    is_active: boolean;
    product_count: number;
    meta_title: string;
    meta_description: string;
    created_at: string;
    updated_at: string;
}

export default function AddProductScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const { user, isAuthenticated, logout } = useAuth();
    const [token, setToken] = useState<string | null>(null);

    const [image, setImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);

    // Category states
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState<ProductFormData>({
        product_type: "vendor",
        name: "",
        sku: "",
        description: "",
        short_description: "",
        category: "",
        brand: "",
        tags: [],
        price: "",
        compare_at_price: "",
        cost_price: "",
        stock_quantity: "",
        low_stock_threshold: "10",
        track_inventory: true,
        weight: "",
        length: "",
        width: "",
        height: "",
        condition: "new",
        is_featured: false,
        requires_shipping: true,
        is_digital: false,
        meta_title: "",
        meta_description: "",
        status: "active",
    });

    // Load categories from API
    const loadCategories = useCallback(async () => {
        if (!isAuthenticated || !token) {
            showToast("Refresh your categories", "error");
            return;
        }

        try {
            setIsLoadingCategories(true);

            const response = await api.get(endpoints.categories, {
                headers: {
                    Authorization: `Bearer ${token || ''}`,
                },
            });

            if (response.data?.success === true) {
                const categoriesData = response.data.data || [];
                setCategories(categoriesData);
                setFilteredCategories(categoriesData);

                // If there's already a selected category ID in formData, find and set it
                if (formData.category) {
                    const foundCategory = categoriesData.find((cat: Category) => cat.id === formData.category);
                    if (foundCategory) {
                        setSelectedCategory(foundCategory);
                    }
                }

                showToast(
                    `Loaded ${categoriesData.length} categories`,
                    "success"
                );
            } else {
                showToast(
                    response.data?.message || "Failed to load categories",
                    "error"
                );
            }
        } catch (error: any) {
            console.error('Error loading categories:', error);
            let errorMessage = "Failed to load categories";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 401) {
                showToast("Session expired. Please login again.", "error");
                logout();
                router.replace("/signIn");
                return;
            } else if (error.message?.includes('Network Error')) {
                errorMessage = "Network error. Check your connection.";
            }

            showToast(errorMessage, "error");
        } finally {
            setIsLoadingCategories(false);
        }
    }, [isAuthenticated, token, formData.category, logout, router]);

    // Check authentication on component mount
    useEffect(() => {
        if (!isAuthenticated) {
            showToast("Please login to add products", "error");
            router.replace("/signIn");
        }
    }, [isAuthenticated, router]);

    // Load token from AsyncStorage
    useEffect(() => {
        const loadToken = async () => {
            if (isAuthenticated) {
                try {
                    const storedToken = await AsyncStorage.getItem('authToken');
                    setToken(storedToken);
                } catch (error) {
                    console.error('Failed to load token:', error);
                }
            }
        };
        loadToken();
    }, [isAuthenticated]);

    // Load categories on component mount
    useEffect(() => {
        if (isAuthenticated && token) {
            loadCategories();
        }
    }, [isAuthenticated, token, loadCategories]);

    // Filter categories based on search query
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredCategories(categories);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = categories.filter((category: Category) =>
                category.name.toLowerCase().includes(query) ||
                category.full_path.toLowerCase().includes(query) ||
                category.description.toLowerCase().includes(query)
            );
            setFilteredCategories(filtered);
        }
    }, [searchQuery, categories]);

    // Handle category selection
    const handleSelectCategory = useCallback((category: Category) => {
        setSelectedCategory(category);
        setFormData(prev => ({
            ...prev,
            category: category.id
        }));
        setShowCategoryModal(false);
        setSearchQuery("");

        showToast(`Selected: ${category.full_path}`, "success");
    }, []);

    // Clear selected category
    const handleClearCategory = useCallback(() => {
        setSelectedCategory(null);
        setFormData(prev => ({
            ...prev,
            category: ""
        }));
    }, []);

    // Handle form field changes
    const handleInputChange = useCallback((field: keyof ProductFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Handle numeric input
    const handleNumericInput = useCallback((field: keyof ProductFormData, value: string) => {
        // Allow only numbers and decimal points
        const numericValue = value.replace(/[^0-9.]/g, '');
        setFormData(prev => ({ ...prev, [field]: numericValue }));
    }, []);

    // Image picker action
    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    t('permission_required'),
                    t('allow_access_upload_product_image'),
                    [{ text: t('ok'), style: "default" }]
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.85,
            });

            if (!result.canceled && result.assets?.[0]) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert(
                t('error'),
                t('failed_to_pick_image'),
                [{ text: t('ok'), style: "cancel" }]
            );
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            showToast(t('product_name_required') || "Product name is required", "error");
            return false;
        }

        if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
            showToast(t('valid_price_required') || "Valid price is required", "error");
            return false;
        }

        if (!formData.category.trim()) {
            showToast(t('category_required') || "Category is required", "error");
            return false;
        }

        return true;
    };

    // Submit product action - UPDATED WITH IMAGE UPLOAD
    const handleSubmit = async () => {
        if (!validateForm()) return;
        if (!isAuthenticated || !token) {
            showToast("Please login to add products", "error");
            router.replace("/signIn");
            return;
        }

        setIsSubmitting(true);

        try {
            // Use FormData for image upload
            const formDataToSend = new FormData();

            // Add basic fields - Using different variable name to avoid conflict
            formDataToSend.append('product_type', 'vendor');
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('sku', formData.sku.trim());
            formDataToSend.append('description', formData.description.trim());
            formDataToSend.append('short_description', formData.short_description.trim() || formData.description.substring(0, 150));
            formDataToSend.append('category', formData.category.trim());
            formDataToSend.append('price', String(parseFloat(formData.price) || 0));
            formDataToSend.append('stock_quantity', String(parseInt(formData.stock_quantity) || 0));
            formDataToSend.append('low_stock_threshold', String(parseInt(formData.low_stock_threshold) || 10));
            formDataToSend.append('condition', formData.condition);
            formDataToSend.append('track_inventory', String(formData.track_inventory));
            formDataToSend.append('is_featured', String(formData.is_featured));
            formDataToSend.append('requires_shipping', String(formData.requires_shipping));
            formDataToSend.append('is_digital', String(formData.is_digital));
            formDataToSend.append('status', formData.status);

            // Add optional fields
            if (formData.brand.trim()) {
                formDataToSend.append('brand', formData.brand.trim());
            }
            if (formData.compare_at_price) {
                formDataToSend.append('compare_at_price', String(parseFloat(formData.compare_at_price)));
            }
            if (formData.cost_price) {
                formDataToSend.append('cost_price', String(parseFloat(formData.cost_price)));
            }
            if (formData.weight) {
                formDataToSend.append('weight', String(parseFloat(formData.weight)));
            }
            if (formData.length) {
                formDataToSend.append('length', String(parseFloat(formData.length)));
            }
            if (formData.width) {
                formDataToSend.append('width', String(parseFloat(formData.width)));
            }
            if (formData.height) {
                formDataToSend.append('height', String(parseFloat(formData.height)));
            }
            if (formData.meta_title.trim()) {
                formDataToSend.append('meta_title', formData.meta_title.trim());
            }
            if (formData.meta_description.trim()) {
                formDataToSend.append('meta_description', formData.meta_description.trim());
            }
            if (user?.id) {
                formDataToSend.append('vendor_id', user.id);
            }

            // Add tags
            if (formData.tags.length > 0) {
                formData.tags.forEach((tag, index) => {
                    formDataToSend.append(`tags[${index}]`, tag);
                });
            }

            // Add variants
            if (variants.length > 0) {
                formDataToSend.append('variants', JSON.stringify(variants.map(variant => ({
                    sku: variant.sku.trim(),
                    name: variant.name.trim(),
                    options: variant.options,
                    price_adjustment: parseFloat(variant.price_adjustment) || 0,
                    stock_quantity: parseInt(variant.stock_quantity) || 0,
                }))));
            }

            // Add attributes
            if (attributes.length > 0) {
                formDataToSend.append('attributes', JSON.stringify(attributes));
            }

            // Add image if selected - THIS IS THE KEY FIX
            if (image) {
                const uriParts = image.split('/');
                const fileName = uriParts[uriParts.length - 1];
                const match = /\.(\w+)$/.exec(fileName);
                const fileType = match ? `image/${match[1]}` : 'image/jpeg';

                const imageFile: any = {
                    uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
                    type: fileType,
                    name: fileName,
                };

                console.log('📸 Uploading image:', imageFile);
                
                // Try multiple field names that backend might accept
                formDataToSend.append('image', imageFile);
                formDataToSend.append('main_image', imageFile);
                formDataToSend.append('images', imageFile);
                
                showToast("Uploading product with image...", "info");
            }

            console.log('📤 Submitting product with FormData');
            console.log('Product name:', formData.name);
            console.log('Category:', formData.category);
            console.log('Has image:', !!image);

            // Make API call with auth token and FormData
            const response = await api.post(endpoints.addProduct, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token || ''}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Log response for debugging
            console.log('✅ API Response:', JSON.stringify(response.data, null, 2));
            console.log('Response Status:', response.status);

            // Check for successful HTTP status codes (200-299)
            if (response.status >= 200 && response.status < 300) {
                // Success - the API call worked
                showToast(
                    response.data?.message || t('product_added_successfully') || "Product added successfully",
                    "success"
                );

                // Navigate or reset form based on user choice
                Alert.alert(
                    t('success') || "Success",
                    response.data?.message || t('product_added_successfully') || "Product added successfully",
                    [
                        {
                            text: t('view_products') || "View Products",
                            onPress: () => router.replace("/(vendor)/products"),
                        },
                        {
                            text: t('add_another') || "Add Another",
                            onPress: () => {
                                resetForm();
                            },
                        },
                    ]
                );
            } else {
                // Unexpected status code
                showToast(
                    response.data?.message || t('failed_to_add_product') || "Failed to add product",
                    "error"
                );
            }

        } catch (error: any) {
            console.error('❌ Submit Error:', error);
            console.error('Error response:', error.response?.data);
            
            let errorMessage = t('failed_to_add_product') || "Failed to add product";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.status === 401) {
                errorMessage = "Unauthorized. Please login again.";
                logout();
                router.replace("/signIn");
                return;
            } else if (error.response?.status === 403) {
                errorMessage = "You don't have permission to add products.";
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || "Invalid data. Please check all fields.";
            } else if (error.response?.status === 422) {
                errorMessage = error.response.data?.message || "Validation error. Please check your inputs.";
            } else if (error.message) {
                errorMessage = error.message;
            }

            showToast(String(errorMessage), "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({
            product_type: "vendor",
            name: "",
            sku: "",
            description: "",
            short_description: "",
            category: "",
            brand: "",
            tags: [],
            price: "",
            compare_at_price: "",
            cost_price: "",
            stock_quantity: "",
            low_stock_threshold: "10",
            track_inventory: true,
            weight: "",
            length: "",
            width: "",
            height: "",
            condition: "new",
            is_featured: false,
            requires_shipping: true,
            is_digital: false,
            meta_title: "",
            meta_description: "",
            status: "active",
        });
        setImage(null);
        setVariants([]);
        setAttributes([]);
        setSelectedCategory(null);
    }, []);

    // Cancel action
    const handleCancel = useCallback(() => {
        const hasUnsavedChanges =
            formData.name.trim() !== "" ||
            formData.description.trim() !== "" ||
            image !== null;

        if (hasUnsavedChanges) {
            Alert.alert(
                t('discard_changes') || "Discard Changes",
                t('unsaved_changes_discard_confirmation') || "You have unsaved changes. Are you sure you want to discard them?",
                [
                    { text: t('keep_editing') || "Keep Editing", style: "cancel" },
                    {
                        text: t('discard') || "Discard",
                        style: "destructive",
                        onPress: () => router.back()
                    },
                ]
            );
        } else {
            router.back();
        }
    }, [formData.name, formData.description, image, router, t]);

    const getTranslatedStatus = useCallback((status: ProductStatus) => {
        switch (status) {
            case 'active': return t('active') || "Active";
            case 'inactive': return t('inactive') || "Inactive";
            case 'draft': return t('draft') || "Draft";
            default: return status;
        }
    }, [t]);

    // Render category modal
    const renderCategoryModal = () => {
        return (
            <Modal
                visible={showCategoryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl max-h-3/4">
                        {/* Modal Header */}
                        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                            <Text className="text-lg font-semibold text-gray-900">
                                {t('select_category') || "Select Category"}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowCategoryModal(false)}
                                className="p-2"
                            >
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View className="p-4 border-b border-gray-200">
                            <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-2">
                                <Ionicons name="search" size={20} color="#6b7280" />
                                <TextInput
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder={t('search_categories') || "Search categories..."}
                                    className="flex-1 ml-2 text-sm"
                                    autoFocus={true}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                                        <Ionicons name="close-circle" size={20} color="#6b7280" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Categories List */}
                        {isLoadingCategories ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator size="large" color="#C62828" />
                                <Text className="mt-2 text-gray-600">
                                    {t('loading_categories') || "Loading categories..."}
                                </Text>
                            </View>
                        ) : filteredCategories.length === 0 ? (
                            <View className="py-8 items-center">
                                <Ionicons name="folder-outline" size={48} color="#9ca3af" />
                                <Text className="mt-2 text-gray-600">
                                    {t('no_categories_found') || "No categories found"}
                                </Text>
                                <TouchableOpacity
                                    onPress={loadCategories}
                                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg"
                                >
                                    <Text className="text-gray-700">
                                        {t('retry') || "Retry"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredCategories}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleSelectCategory(item)}
                                        className={`px-4 py-3 border-b border-gray-100 ${selectedCategory?.id === item.id ? 'bg-red-50' : 'bg-white'
                                            }`}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1">
                                                <Text className="font-medium text-gray-900">
                                                    {item.name}
                                                </Text>
                                                {item.full_path !== item.name && (
                                                    <Text className="text-xs text-gray-500 mt-1">
                                                        {item.full_path}
                                                    </Text>
                                                )}
                                                {item.description && (
                                                    <Text className="text-xs text-gray-400 mt-1">
                                                        {item.description.length > 60
                                                            ? `${item.description.substring(0, 60)}...`
                                                            : item.description
                                                        }
                                                    </Text>
                                                )}
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-xs text-gray-500">
                                                    {item.product_count} products
                                                </Text>
                                                {selectedCategory?.id === item.id && (
                                                    <Ionicons name="checkmark-circle" size={20} color="#C62828" />
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ListHeaderComponent={() => (
                                    <View className="px-4 py-2 bg-gray-50">
                                        <Text className="text-xs text-gray-500">
                                            {t('total_categories') || "Total"}: {filteredCategories.length}
                                        </Text>
                                    </View>
                                )}
                            />
                        )}

                        {/* Modal Footer */}
                        <View className="p-4 border-t border-gray-200">
                            <TouchableOpacity
                                onPress={() => setShowCategoryModal(false)}
                                className="py-3 bg-gray-100 rounded-lg items-center"
                            >
                                <Text className="text-gray-700 font-medium">
                                    {t('cancel') || "Cancel"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    // Render category selector
    const renderCategorySelector = () => {
        return (
            <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                    {t('category') || "Category"} *
                </Text>

                {selectedCategory ? (
                    <View className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium text-gray-900">
                                    {selectedCategory.name}
                                </Text>
                                <Text className="text-xs text-gray-500 mt-1">
                                    {selectedCategory.full_path}
                                </Text>
                                {selectedCategory.description && (
                                    <Text className="text-xs text-gray-400 mt-1">
                                        {selectedCategory.description}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={handleClearCategory}
                                className="ml-2 p-1"
                                disabled={isSubmitting}
                            >
                                <Ionicons name="close-circle" size={20} color="#C62828" />
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-center justify-between mt-2">
                            <Text className="text-xs text-gray-500">
                                ID: {selectedCategory.id.substring(0, 8)}...
                            </Text>
                            <Text className="text-xs text-gray-500">
                                {selectedCategory.product_count} products
                            </Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => setShowCategoryModal(true)}
                        disabled={isSubmitting || isLoadingCategories || !isAuthenticated}
                        className="flex-row justify-between items-center border border-gray-300 rounded-lg px-4 py-3"
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="folder-outline" size={20} color="#6b7280" className="mr-2" />
                            <Text className={`text-sm ${isLoadingCategories ? 'text-gray-400' : 'text-gray-500'}`}>
                                {isLoadingCategories
                                    ? (t('loading_categories') || "Loading categories...")
                                    : (t('select_category') || "Select a category")
                                }
                            </Text>
                        </View>
                        {isLoadingCategories ? (
                            <ActivityIndicator size="small" color="#C62828" />
                        ) : (
                            <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                        )}
                    </TouchableOpacity>
                )}

                {/* Reload categories button */}
                {!isLoadingCategories && isAuthenticated && (
                    <TouchableOpacity
                        onPress={loadCategories}
                        disabled={isSubmitting}
                        className="flex-row items-center justify-end mt-2"
                    >
                        <Ionicons name="refresh" size={16} color="#6b7280" />
                        <Text className="text-xs text-gray-500 ml-1">
                            {t('refresh_categories') || "Refresh categories"}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Authentication status */}
                {!isAuthenticated && (
                    <Text className="text-xs text-red-500 mt-1">
                        {t('login_required') || "Please login to load categories"}
                    </Text>
                )}
            </View>
        );
    };

    // If not authenticated, show loading or redirect
    if (!isAuthenticated) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#C62828" />
                <Text className="mt-4 text-gray-600">
                    {t('redirecting_to_login') || "Redirecting to login..."}
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white pt-4">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 140 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="px-5">
                    {/* Header */}
                    <View className="mb-4">
                        {/* Back Icon */}
                        <TouchableOpacity
                            onPress={handleCancel}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            className="mb-3"
                        >
                            <Ionicons
                                name="arrow-back"
                                size={22}
                                color="#111827"
                            />
                        </TouchableOpacity>

                        {/* Title & Subtitle */}
                        <Text className="text-lg font-semibold text-gray-900">
                            {t('add_new_product') || "Add New Product"}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">
                            {t('fill_product_information') || "Fill in product information below"}
                        </Text>

                        {/* User info */}
                        {user && (
                            <View className="mt-2 flex-row items-center">
                                <Ionicons name="person-circle-outline" size={16} color="#6b7280" />
                                <Text className="text-xs text-gray-500 ml-1">
                                    {user.name || user.email}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Image Upload */}
                    <TouchableOpacity
                        onPress={handlePickImage}
                        activeOpacity={0.8}
                        className="mt-4 h-48 rounded-lg bg-gray-100 border border-dashed border-gray-300 items-center justify-center overflow-hidden"
                        disabled={isSubmitting}
                    >
                        {image ? (
                            <View className="relative w-full h-full">
                                <Image
                                    source={{ uri: image }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                                <View className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                                    <Ionicons name="camera" size={16} color="white" />
                                </View>
                            </View>
                        ) : (
                            <View className="items-center p-4">
                                <View className="bg-gray-200 p-4 rounded-full mb-2">
                                    <Ionicons
                                        name="image-outline"
                                        size={32}
                                        color="#6b7280"
                                    />
                                </View>
                                <Text className="text-sm text-gray-600 font-medium">
                                    {t('upload_product_image') || "Upload Product Image"}
                                </Text>
                                <Text className="text-xs text-gray-400 mt-1 text-center">
                                    {t('recommended_aspect_ratio') || "Recommended: 4:3 aspect ratio"}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Basic Form */}
                    <View className="mt-8 space-y-6">
                        {/* Product Name */}
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                {t('product_name') || "Product Name"} *
                            </Text>
                            <TextInput
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                placeholder={t('enter_product_name') || "Enter product name"}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
                                editable={!isSubmitting}
                            />
                        </View>

                        {/* Category Selector */}
                        {renderCategorySelector()}

                        {/* SKU */}
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                {t('sku') || "SKU"}
                            </Text>
                            <TextInput
                                value={formData.sku}
                                onChangeText={(value) => handleInputChange('sku', value)}
                                placeholder={t('sku_placeholder') || "Product SKU (optional)"}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
                                editable={!isSubmitting}
                            />
                        </View>

                        {/* Status */}
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                {t('status') || "Status"}
                            </Text>
                            <View className="flex-row space-x-2">
                                {(['active', 'inactive', 'draft'] as ProductStatus[]).map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        onPress={() => handleInputChange('status', status)}
                                        className={`flex-1 border rounded-lg py-3 items-center ${formData.status === status
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-300'
                                            }`}
                                        disabled={isSubmitting}
                                    >
                                        <Text className={`text-sm ${formData.status === status
                                            ? 'text-red-600 font-medium'
                                            : 'text-gray-700'
                                            }`}>
                                            {getTranslatedStatus(status)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Description */}
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                {t('description') || "Description"}
                            </Text>
                            <TextInput
                                value={formData.description}
                                onChangeText={(value) => handleInputChange('description', value)}
                                multiline
                                numberOfLines={6}
                                placeholder={t('describe_product_features') || "Describe product features, specifications, etc."}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-sm min-h-[120px]"
                                textAlignVertical="top"
                                editable={!isSubmitting}
                            />
                        </View>

                        {/* Price Section */}
                        <View className="space-y-4">
                            <Text className="text-sm font-medium text-gray-700">
                                {t('pricing') || "Pricing"}
                            </Text>
                            {/* Price */}
                            <View className="mb-3">
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    {t('price') || "Price"} *
                                </Text>
                                <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
                                    <TextInput
                                        value={formData.price}
                                        onChangeText={(value) => handleNumericInput('price', value)}
                                        keyboardType="decimal-pad"
                                        placeholder="0.00"
                                        className="flex-1 py-3 text-sm"
                                        editable={!isSubmitting}
                                    />
                                </View>
                            </View>

                            {/* Compare at price */}
                            <View className="mb-2">
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    {t('compare_at_price') || "Compare at Price"}
                                </Text>
                                <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
                                    <TextInput
                                        value={formData.compare_at_price}
                                        onChangeText={(value) => handleNumericInput('compare_at_price', value)}
                                        keyboardType="decimal-pad"
                                        placeholder="0.00"
                                        className="flex-1 py-3 text-sm"
                                        editable={!isSubmitting}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Inventory Section */}
                        <View className="space-y-4">
                            <Text className="text-sm font-medium text-gray-700">
                                {t('inventory') || "Inventory"}
                            </Text>
                            {/* Stock Quantity */}
                            <View className="mb-3">
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    {t('stock_quantity') || "Stock Quantity"}
                                </Text>
                                <TextInput
                                    value={formData.stock_quantity}
                                    onChangeText={(value) => handleNumericInput('stock_quantity', value)}
                                    keyboardType="number-pad"
                                    placeholder="0"
                                    className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
                                    editable={!isSubmitting}
                                />
                            </View>

                            {/* Low Stock Alert */}
                            <View className="mb-3">
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    {t('low_stock_alert') || "Low Stock Alert"}
                                </Text>
                                <TextInput
                                    value={formData.low_stock_threshold}
                                    onChangeText={(value) => handleNumericInput('low_stock_threshold', value)}
                                    keyboardType="number-pad"
                                    placeholder="10"
                                    className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
                                    editable={!isSubmitting}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Category Modal */}
            {renderCategoryModal()}

            {/* Bottom Actions */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={handleCancel}
                        disabled={isSubmitting}
                        className="border border-gray-300 px-6 py-3 rounded-lg flex-1 mr-2"
                        activeOpacity={0.7}
                    >
                        <Text className="text-gray-700 font-medium text-center">
                            {t('cancel') || "Cancel"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting || !formData.name.trim() || !formData.price.trim() || !formData.category.trim() || !isAuthenticated}
                        className={`px-6 py-3 rounded-lg flex-1 ml-2 ${(isSubmitting || !formData.name.trim() || !formData.price.trim() || !formData.category.trim() || !isAuthenticated)
                            ? 'bg-red-400'
                            : 'bg-red-500'
                            }`}
                        activeOpacity={0.8}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <Text className="text-white font-semibold text-center">
                                {t('add_product') || "Add Product"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Authentication status */}
                {!isAuthenticated && (
                    <Text className="text-xs text-red-500 text-center mt-2">
                        {t('login_to_add_product') || "Please login to add products"}
                    </Text>
                )}
            </View>
        </SafeAreaView>
    );
}