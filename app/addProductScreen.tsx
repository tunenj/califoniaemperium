
// add product
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import TopNav from "@/components/vendor/TopNav/TopNav";

export default function AddProductScreen() {
    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "Allow access to upload product image."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 2],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0]) {
            setImage(result.assets[0].uri);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* <TopNav /> */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 140 }}
            >
                <View className="px-5">
                    {/* Header */}
                    <Text className="text-lg font-semibold text-gray-900">
                        Add New Product
                    </Text>
                    <Text className="text-xs text-gray-400 mt-1">
                        Fill in the products information.
                    </Text>

                    {/* Image Upload */}
                    <TouchableOpacity
                        onPress={pickImage}
                        className="mt-6 h-36 rounded-lg bg-gray-300 items-center justify-center overflow-hidden"
                    >
                        {image ? (
                            <Image
                                source={{ uri: image }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <>
                                <Ionicons
                                    name="cloud-upload-outline"
                                    size={28}
                                    color="#ffffff"
                                />
                                <Text className="text-sm text-white mt-2">
                                    Click to upload
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Form */}
                    <View className="mt-8 space-y-8">
                        {/* Product Name */}
                        <View>
                            <Text className="text-xs text-gray-400 mb-3">
                                Product Name
                            </Text>
                            <TextInput className="border-b border-gray-300 text-sm py-2" />
                        </View>

                        {/* Category */}
                        <View>
                            <Text className="text-xs text-gray-400 mb-3">
                                Category
                            </Text>
                            <TouchableOpacity className="flex-row justify-between items-center border-b border-gray-300 py-2">
                                <Text className="text-sm text-gray-400">
                                    Select
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={16}
                                    color="#9ca3af"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Status */}
                        <View>
                            <Text className="text-xs text-gray-400 mb-3">
                                Status
                            </Text>
                            <TouchableOpacity className="flex-row justify-between items-center border-b border-gray-300 py-2">
                                <Text className="text-sm text-gray-400">
                                    Active
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={16}
                                    color="#9ca3af"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Description */}
                        <View>
                            <Text className="text-xs text-gray-400 mb-3">
                                Description
                            </Text>
                            <TextInput
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                placeholder="Describe your product"
                                className="border-b border-gray-300 text-sm py-2"
                            />
                        </View>

                        {/* Price */}
                        <View>
                            <Text className="text-xs text-gray-400 mb-3">
                                Price
                            </Text>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="0"
                                className="border-b border-gray-300 text-sm py-2"
                            />
                        </View>

                        {/* Compare at price */}
                        <View>
                            <Text className="text-xs text-gray-400 mb-3">
                                Compare at price
                            </Text>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="0"
                                className="border-b border-gray-300 text-sm py-2"
                            />
                        </View>

                        {/* Stock Quantity */}
                        <View>
                            <Text className="text-xs text-gray-400 mb-3">
                                Stock Quantity
                            </Text>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="0"
                                className="border-b border-gray-300 text-sm py-2"
                            />
                        </View>

                        {/* Low Stock Alert */}
                        <View>
                            <Text className="text-xs text-gray-400 mb-3">
                                Low Stock Alert
                            </Text>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="10"
                                className="border-b border-gray-300 text-sm py-2"
                            />
                        </View>

                        {/* SKU */}
                        <View>
                            <Text className="text-xs text-gray-400 mb-3">
                                SKU
                            </Text>
                            <TextInput
                                placeholder="Store Keeping Unit"
                                className="border-b border-gray-300 text-sm py-2"
                            />
                        </View>
                    </View>
                </View>
                {/* Bottom Actions */}
                <View className="absolute bottom-6 right-5 flex-row items-center gap-2 space-x-4 -mt-10">
                    <TouchableOpacity className="border border-red-500 px-6 py-2 rounded-full">
                        <Text className="text-sm text-red-500">
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-red-500 px-6 py-2 rounded-full">
                        <Text className="text-sm text-white font-semibold">
                            Add Product
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
