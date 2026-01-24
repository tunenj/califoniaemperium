import React, { useMemo, useState } from "react";
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
import { useLanguage } from '@/context/LanguageContext'; // Add import

/* ---------------- TYPES ---------------- */

type ProductStatus = "active" | "inactive";

interface ProductFormData {
    cjProductId: string;
    name: string;
    category: string;
    status: ProductStatus;
    description: string;
    supplierPrice: string;
    sellingPrice: string;
}

/* ---------------- EXISTING CATEGORIES ---------------- */

const EXISTING_CATEGORIES = [
    "Electronics",
    "Fashion",
    "Beauty & Personal Care",
    "Home & Kitchen",
    "Sports & Fitness",
    "Phones & Accessories",
    "Gaming",
];

/* ================= COMPONENT ================= */

export default function AddDropshipProduct() {
    const router = useRouter();
    const { t } = useLanguage(); // Add hook

    const [image, setImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categoryVisible, setCategoryVisible] = useState(false);

    const [formData, setFormData] = useState<ProductFormData>({
        cjProductId: "",
        name: "",
        category: "",
        status: "active",
        description: "",
        supplierPrice: "",
        sellingPrice: "",
    });

    /* ---------------- HELPERS ---------------- */

    const handleChange = (key: keyof ProductFormData, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    /* ---------------- IMAGE PICKER ---------------- */

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(t('permission_required'), t('allow_access_to_upload_image'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.9,
        });

        if (!result.canceled && result.assets?.[0]) {
            setImage(result.assets[0].uri);
        }
    };

    /* ---------------- PROFIT ---------------- */

    const profitMargin = useMemo(() => {
        const supplier = Number(formData.supplierPrice);
        const selling = Number(formData.sellingPrice);
        if (isNaN(supplier) || isNaN(selling)) return "0";
        return (selling - supplier).toFixed(2);
    }, [formData.supplierPrice, formData.sellingPrice]);

    /* ---------------- VALIDATION ---------------- */

    const validate = () => {
        if (!formData.name.trim()) {
            Alert.alert(t('error'), t('product_name_required'));
            return false;
        }
        if (!formData.category) {
            Alert.alert(t('error'), t('select_category_required'));
            return false;
        }
        if (!formData.sellingPrice.trim()) {
            Alert.alert(t('error'), t('selling_price_required'));
            return false;
        }
        return true;
    };

    /* ---------------- SUBMIT ---------------- */

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        await new Promise(res => setTimeout(res, 1200));

        Alert.alert(t('success'), t('product_added_successfully'));
        setIsSubmitting(false);
        router.back();
    };

    /* ---------------- INPUT ---------------- */

    const Input = ({
        label,
        value,
        onChange,
        placeholder,
        editable = true,
    }: {
        label: string;
        value: string;
        onChange: (v: string) => void;
        placeholder?: string;
        editable?: boolean;
    }) => (
        <View className="mb-5">
            <Text className="text-xs text-gray-400 mb-1">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                editable={editable}
                className="border-b border-gray-300 py-2 text-sm text-gray-900"
            />
        </View>
    );

    /* ================= UI ================= */

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                contentContainerStyle={{ paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-5 pt-4">
                    {/* Header */}
                    <View className="mb-6">
                        <TouchableOpacity onPress={() => router.back()} className="mb-2">
                            <Ionicons name="arrow-back" size={22} color="#111827" />
                        </TouchableOpacity>

                        <Text className="text-lg font-semibold text-gray-900">
                            {t('add_dropship_product')}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">
                            {t('fill_product_information')}
                        </Text>
                    </View>

                    {/* Image Upload */}
                    <TouchableOpacity
                        onPress={handlePickImage}
                        activeOpacity={0.85}
                        className="h-32 rounded-xl bg-gray-700 items-center justify-center mb-6 overflow-hidden"
                    >
                        {image ? (
                            <Image source={{ uri: image }} className="w-full h-full" />
                        ) : (
                            <>
                                <Ionicons
                                    name="cloud-upload-outline"
                                    size={26}
                                    color="#fff"
                                />
                                <Text className="text-xs text-white mt-2">
                                    {t('click_to_upload')}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Form */}
                    <Input
                        label={t('cj_product_id')}
                        value={formData.cjProductId}
                        onChange={v => handleChange("cjProductId", v)}
                    />

                    <Input
                        label={t('product_name')}
                        value={formData.name}
                        onChange={v => handleChange("name", v)}
                    />

                    {/* Category */}
                    <View className="mb-5">
                        <Text className="text-xs text-gray-400 mb-1">{t('category')}</Text>
                        <TouchableOpacity
                            onPress={() => setCategoryVisible(true)}
                            className="flex-row justify-between items-center border-b border-gray-300 py-2"
                        >
                            <Text
                                className={`text-sm ${formData.category ? "text-gray-900" : "text-gray-400"
                                    }`}
                            >
                                {formData.category || t('select')}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* Status */}
                    <View className="mb-5">
                        <Text className="text-xs text-gray-400 mb-1">{t('status')}</Text>
                        <TouchableOpacity className="flex-row justify-between items-center border-b border-gray-300 py-2">
                            <Text className="text-sm capitalize text-gray-900">
                                {formData.status === 'active' ? t('active') : t('inactive')}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <View className="mb-5">
                        <Text className="text-xs text-gray-400 mb-1">{t('description')}</Text>
                        <TextInput
                            value={formData.description}
                            onChangeText={v => handleChange("description", v)}
                            placeholder={t('describe_product')}
                            multiline
                            className="border-b border-gray-300 py-2 text-sm min-h-[60px]"
                        />
                    </View>

                    <Input
                        label={t('supplier_price')}
                        value={formData.supplierPrice}
                        onChange={v => handleChange("supplierPrice", v)}
                        placeholder="0"
                    />

                    <Input
                        label={t('selling_price')}
                        value={formData.sellingPrice}
                        onChange={v => handleChange("sellingPrice", v)}
                        placeholder="0"
                    />

                    <Input
                        label={t('profit_margin')}
                        value={profitMargin}
                        onChange={() => { }}
                        editable={false}
                    />
                </View>
                {/* Bottom Buttons */}
                <View className="absolute bottom-20 left-0 right-0 px-5">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="flex-1 border border-red-400 rounded-full py-2"
                        >
                            <Text className="text-secondary text-center text-sm">
                                {t('cancel')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-secondary rounded-full py-2"
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white text-center text-sm font-medium">
                                    {t('add_product')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Category Modal */}
            {categoryVisible && (
                <View className="absolute inset-0 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-2xl px-5 pt-4 pb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-sm font-semibold">{t('select_category')}</Text>
                            <TouchableOpacity onPress={() => setCategoryVisible(false)}>
                                <Ionicons name="close" size={20} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {EXISTING_CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => {
                                    handleChange("category", cat);
                                    setCategoryVisible(false);
                                }}
                                className="py-3 border-b border-gray-100"
                            >
                                <Text
                                    className={`text-sm ${formData.category === cat
                                            ? "text-secondary font-medium"
                                            : "text-gray-800"
                                        }`}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}