import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

type ProductStatus = "active" | "inactive" | "draft";

interface ProductFormData {
    name: string;
    description: string;
    category: string;
    status: ProductStatus;
    price: string;
    compareAtPrice: string;
    stockQuantity: string;
    lowStockAlert: string;
    sku: string;
}

export default function AddProductScreen() {
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        category: "",
        status: "active",
        price: "",
        compareAtPrice: "",
        stockQuantity: "",
        lowStockAlert: "10",
        sku: "",
    });

    // Handle form field changes
    const handleInputChange = (field: keyof ProductFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Image picker action
    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Allow access to upload product image.",
                    [{ text: "OK", style: "default" }]
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3], // Better aspect ratio for products
                quality: 0.85,
            });

            if (!result.canceled && result.assets?.[0]) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert(
                "Error",
                "Failed to pick image. Please try again.",
                [{ text: "OK", style: "cancel" }]
            );
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            Alert.alert("Validation Error", "Product name is required");
            return false;
        }

        if (!formData.price.trim() || isNaN(Number(formData.price))) {
            Alert.alert("Validation Error", "Valid price is required");
            return false;
        }

        if (image === null) {
            Alert.alert(
                "Image Required",
                "Would you like to add a product image?",
                [
                    { text: "Add Later", style: "cancel", onPress: () => true },
                    {
                        text: "Upload Now", style: "default", onPress: () => {
                            handlePickImage();
                            return false;
                        }
                    }
                ]
            );
            return false;
        }

        return true;
    };

    // Submit product action
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success
            Alert.alert(
                "Success",
                "Product added successfully!",
                [
                    {
                        text: "View Products",
                        onPress: () => router.replace("/(vendor)/products"),
                    },
                    {
                        text: "Add Another",
                        onPress: () => {
                            // Reset form
                            setFormData({
                                name: "",
                                description: "",
                                category: "",
                                status: "active",
                                price: "",
                                compareAtPrice: "",
                                stockQuantity: "",
                                lowStockAlert: "10",
                                sku: "",
                            });
                            setImage(null);
                            setIsSubmitting(false);
                        },
                    },
                ]
            );
        } catch (error) {
            // Log the error for debugging
            console.error("Failed to add product:", error);

            // Show user-friendly message
            Alert.alert(
                "Error",
                "Failed to add product. Please try again.",
                [{ text: "OK", style: "cancel" }]
            );
            setIsSubmitting(false);
        }
    };

    // Cancel action with confirmation
    const handleCancel = () => {
        const hasUnsavedChanges =
            formData.name.trim() !== "" ||
            formData.description.trim() !== "" ||
            image !== null;

        if (hasUnsavedChanges) {
            Alert.alert(
                "Discard Changes?",
                "You have unsaved changes. Are you sure you want to discard them?",
                [
                    { text: "Keep Editing", style: "cancel" },
                    {
                        text: "Discard",
                        style: "destructive",
                        onPress: () => router.back()
                    },
                ]
            );
        } else {
            router.back();
        }
    };

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
                            Add New Product
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">
                            Fill in the product&apos;s information.
                        </Text>
                    </View>

                    {/* Image Upload */}
                    <TouchableOpacity
                        onPress={handlePickImage}
                        activeOpacity={0.8}
                        className="mt-4 h-48 rounded-lg bg-gray-100 border border-dashed border-gray-300 items-center justify-center overflow-hidden"
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
                                    Upload Product Image
                                </Text>
                                <Text className="text-xs text-gray-400 mt-1 text-center">
                                    Recommended: 4:3 aspect ratio
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Form */}
                    <View className="mt-8 space-y-6">
                        {/* Product Name */}
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Product Name *
                            </Text>
                            <TextInput
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                placeholder="Enter product name"
                                className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
                                editable={!isSubmitting}
                            />
                        </View>

                        {/* Category */}
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Category
                            </Text>
                            <TouchableOpacity
                                className="flex-row justify-between items-center border border-gray-300 rounded-lg px-4 py-3"
                                activeOpacity={0.7}
                                disabled={isSubmitting}
                            >
                                <Text className={`text-sm ${formData.category ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {formData.category || "Select category"}
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={16}
                                    color="#9ca3af"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Status */}
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Status
                            </Text>
                            <TouchableOpacity
                                className="flex-row justify-between items-center border border-gray-300 rounded-lg px-4 py-3"
                                activeOpacity={0.7}
                                disabled={isSubmitting}
                            >
                                <View className="flex-row items-center">
                                    <View className={`w-2 h-2 rounded-full mr-2 ${formData.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <Text className="text-sm capitalize">
                                        {formData.status}
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-down"
                                    size={16}
                                    color="#9ca3af"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Description */}
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Description
                            </Text>
                            <TextInput
                                value={formData.description}
                                onChangeText={(value) => handleInputChange('description', value)}
                                multiline
                                numberOfLines={4}
                                placeholder="Describe your product features, benefits, etc."
                                className="border border-gray-300 rounded-lg px-4 py-3 text-sm min-h-[100px]"
                                textAlignVertical="top"
                                editable={!isSubmitting}
                            />
                        </View>

                        {/* Price Section */}
                        <View className="space-y-4">
                            {/* Price */}
                            <View className="mb-3">
                                <Text className="text-sm font-medium text-gray-700">
                                    Price
                                </Text>
                                <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
                                    <TextInput
                                        value={formData.price}
                                        onChangeText={(value) => handleInputChange('price', value)}
                                        keyboardType="decimal-pad"
                                        placeholder="0.00"
                                        className="flex-1 py-3 text-sm"
                                        editable={!isSubmitting}
                                    />
                                </View>
                            </View>

                            {/* Compare at price */}
                            <View className="mb-2">
                                <Text className="text-sm font-medium text-gray-700">
                                    Compare at price
                                </Text>
                                <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
                                    <TextInput
                                        value={formData.compareAtPrice}
                                        onChangeText={(value) => handleInputChange('compareAtPrice', value)}
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
                            {/* Stock Quantity */}
                            <View className="mb-3">
                                <Text className="text-sm font-medium text-gray-700">
                                    Stock Quantity
                                </Text>
                                <TextInput
                                    value={formData.stockQuantity}
                                    onChangeText={(value) => handleInputChange('stockQuantity', value)}
                                    keyboardType="number-pad"
                                    placeholder="0"
                                    className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
                                    editable={!isSubmitting}
                                />
                            </View>

                            {/* Low Stock Alert */}
                            <View className="mb-3">
                                <Text className="text-sm font-medium text-gray-700">
                                    Low Stock Alert
                                </Text>
                                <TextInput
                                    value={formData.lowStockAlert}
                                    onChangeText={(value) => handleInputChange('lowStockAlert', value)}
                                    keyboardType="number-pad"
                                    className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
                                    editable={!isSubmitting}
                                />
                            </View>

                            {/* SKU */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700">
                                    SKU (Stock Keeping Unit)
                                </Text>
                                <TextInput
                                    value={formData.sku}
                                    onChangeText={(value) => handleInputChange('sku', value)}
                                    placeholder="e.g., PROD-001"
                                    className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
                                    editable={!isSubmitting}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                {/* Bottom Actions */}
                <View className="absolute bottom-2 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={handleCancel}
                            disabled={isSubmitting}
                            className="border border-gray-300 px-6 py-3 rounded-lg flex-1 mr-2"
                            activeOpacity={0.7}
                        >
                            <Text className="text-gray-700 font-medium text-center">
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-6 py-3 rounded-lg flex-1 ml-2 ${isSubmitting ? 'bg-red-400' : 'bg-red-500'}`}
                            activeOpacity={0.8}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <Text className="text-white font-semibold text-center">
                                    Add Product
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}