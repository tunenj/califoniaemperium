import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import AnimatedStep from "@/components/AnimatedStep";
import StepIndicator from "@/components/StepIndicator";
import { useSetup } from "@/context/SetupContext";
import { useLanguage } from "@/context/LanguageContext";

// Accepted file types
const ACCEPTED_FILE_TYPES = [
    'image/*',
    'application/pdf',
    '.jpg',
    '.jpeg',
    '.png',
    '.pdf',
    '.doc',
    '.docx'
];

// Max file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function Step3() {
    const router = useRouter();
    const { data, update } = useSetup();
    const { t } = useLanguage();

    const [idFile, setIdFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [photoFile, setPhotoFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickFile = async (type: "id" | "photo") => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: ACCEPTED_FILE_TYPES,
                copyToCacheDirectory: true,
            });

            if (!res.canceled && res.assets[0]) {
                const file = res.assets[0];
                
                // Check file size
                if (file.size && file.size > MAX_FILE_SIZE) {
                    Alert.alert(
                        t('file_too_large'),
                        t('max_file_size_exceeded', { size: '10MB' }),
                        [{ text: t('ok'), style: "default" }]
                    );
                    return;
                }

                if (type === "id") {
                    setIdFile(file);
                    update({ idDocument: file });
                } else {
                    setPhotoFile(file);
                    update({ businessPhoto: file });
                }
            }
        } catch (error) {
            console.error("Error picking file:", error);
            Alert.alert(
                t('error'),
                t('failed_to_pick_file'),
                [{ text: t('ok'), style: "cancel" }]
            );
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <Ionicons name="document-text" size={24} color="#ef4444" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
                return <Ionicons name="image" size={24} color="#3b82f6" />;
            case 'doc':
            case 'docx':
                return <Ionicons name="document" size={24} color="#2563eb" />;
            default:
                return <Ionicons name="document-attach" size={24} color="#6b7280" />;
        }
    };

    const removeFile = (type: "id" | "photo") => {
        if (type === "id") {
            setIdFile(null);
            update({ idDocument: null });
        } else {
            setPhotoFile(null);
            update({ businessPhoto: null });
        }
    };

    const validateForm = (): boolean => {
        if (!data.shopAddress?.trim()) {
            Alert.alert(t('validation_error'), t('business_address_required'));
            return false;
        }

        if (!data.businessRegNumber?.trim()) {
            Alert.alert(t('validation_error'), t('registration_number_required'));
            return false;
        }

        if (!idFile) {
            Alert.alert(t('validation_error'), t('id_document_required'));
            return false;
        }

        if (!photoFile) {
            Alert.alert(t('validation_error'), t('business_photo_required'));
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Submit data to backend here if needed
            // const response = await api.submitBusinessSetup(data);
            
            // Navigate to success screen
            router.replace("/Setup/business-setup/success");
        } catch (error) {
            console.error("Failed to submit:", error);
            Alert.alert(
                t('error'),
                t('submission_failed'),
                [{ text: t('ok'), style: "cancel" }]
            );
            setIsSubmitting(false);
        }
    };

    const isValid =
        Boolean(data.shopAddress?.trim()) &&
        Boolean(data.businessRegNumber?.trim()) &&
        Boolean(idFile) &&
        Boolean(photoFile);

    return (
        <AnimatedStep>
            <SafeAreaView className="flex-1 bg-white">
                {/* Fixed Header + Indicator */}
                <View className="px-5 pt-4">
                    {/* Header */}
                    <View className="items-center mb-4 relative">
                        <Image
                            source={require("@/assets/images/icon.png")}
                            className="w-20 h-20 mb-3"
                            resizeMode="contain"
                        />

                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="absolute left-0 top-2 p-2"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={22} color="#000" />
                        </TouchableOpacity>

                        <Text className="font-semibold text-base mt-2">
                            {t('welcome_user', { name: data.firstName || t('user') })}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">
                            {t('setup_business_profile')}
                        </Text>
                    </View>

                    {/* Step Indicator */}
                    <StepIndicator totalSteps={3} currentStep={3} />
                </View>

                {/* Scrollable Content */}
                <ScrollView
                    className="flex-1 px-5"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 30 }}
                >
                    <Text className="font-medium text-black mb-4 text-right">
                        {t('documentation')}
                    </Text>

                    {/* Shop Address */}
                    <Text className="text-xs text-gray-400 mb-1">
                        {t('business_address')} *
                    </Text>
                    <TextInput
                        placeholder={t('enter_business_address')}
                        value={data.shopAddress ?? ""}
                        onChangeText={(v) => update({ shopAddress: v })}
                        className="border border-gray-300 rounded-lg px-4 py-3 mb-5 text-sm"
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                    />

                    {/* Business Reg Number */}
                    <Text className="text-xs text-gray-400 mb-1">
                        {t('business_registration_number')} *
                    </Text>
                    <TextInput
                        placeholder={t('enter_registration_number')}
                        value={data.businessRegNumber ?? ""}
                        onChangeText={(v) => update({ businessRegNumber: v })}
                        className="border border-gray-300 rounded-lg px-4 py-3 mb-5 text-sm"
                        autoCapitalize="characters"
                    />

                    {/* Social Links */}
                    <Text className="text-xs text-gray-400 mb-2">
                        {t('social_links')}
                    </Text>
                    
                    <View className="mb-4">
                        <TextInput
                            placeholder={t('social_link_1')}
                            placeholderTextColor="#9ca3af"
                            value={data.socialLink1 ?? ""}
                            onChangeText={(v) => update({ socialLink1: v })}
                            className="border border-gray-300 rounded-lg px-4 py-3 mb-3 text-sm"
                            keyboardType="url"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        
                        <TextInput
                            placeholder={t('social_link_2_optional')}
                            placeholderTextColor="#9ca3af"
                            value={data.socialLink2 ?? ""}
                            onChangeText={(v) => update({ socialLink2: v })}
                            className="border border-gray-300 rounded-lg px-4 py-3 mb-3 text-sm"
                            keyboardType="url"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        
                        <TextInput
                            placeholder={t('social_link_3_optional')}
                            placeholderTextColor="#9ca3af"
                            value={data.socialLink3 ?? ""}
                            onChangeText={(v) => update({ socialLink3: v })}
                            className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-sm"
                            keyboardType="url"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* ID Upload */}
                    <Text className="text-xs text-gray-400 mb-2">
                        {t('means_of_identification')} *
                    </Text>
                    
                    {idFile ? (
                        <View className="border border-red-200 bg-red-50 rounded-lg p-4 mb-4">
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center flex-1">
                                    {getFileIcon(idFile.name)}
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
                                            {idFile.name}
                                        </Text>
                                        <Text className="text-xs text-gray-500">
                                            {formatFileSize(idFile.size || 0)}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => removeFile("id")}
                                    className="p-2"
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close-circle" size={20} color="#dc2626" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={() => pickFile("id")}
                                className="mt-2"
                            >
                                <Text className="text-red-600 text-sm font-medium">
                                    {t('replace_file')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => pickFile("id")}
                            className="border-2 border-dashed border-red-300 bg-red-50 py-6 rounded-lg items-center mb-4"
                            activeOpacity={0.8}
                        >
                            <View className="bg-red-100 p-3 rounded-full mb-3">
                                <Ionicons
                                    name="cloud-upload-outline"
                                    size={28}
                                    color="#dc2626"
                                />
                            </View>
                            <Text className="text-sm font-medium text-gray-700 mb-1">
                                {t('browse_files')}
                            </Text>
                            <Text className="text-xs text-gray-500 text-center">
                                {t('accepted_formats')}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1">
                                {t('max_size', { size: '10MB' })}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Photo Upload */}
                    <Text className="text-xs text-gray-400 mb-2">
                        {t('upload_photo')} *
                    </Text>
                    
                    {photoFile ? (
                        <View className="border border-red-200 bg-red-50 rounded-lg p-4 mb-8">
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center flex-1">
                                    {getFileIcon(photoFile.name)}
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
                                            {photoFile.name}
                                        </Text>
                                        <Text className="text-xs text-gray-500">
                                            {formatFileSize(photoFile.size || 0)}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => removeFile("photo")}
                                    className="p-2"
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close-circle" size={20} color="#dc2626" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={() => pickFile("photo")}
                                className="mt-2"
                            >
                                <Text className="text-red-600 text-sm font-medium">
                                    {t('replace_file')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => pickFile("photo")}
                            className="border-2 border-dashed border-red-300 bg-red-50 py-6 rounded-lg items-center mb-8"
                            activeOpacity={0.8}
                        >
                            <View className="bg-red-100 p-3 rounded-full mb-3">
                                <Ionicons
                                    name="camera-outline"
                                    size={28}
                                    color="#dc2626"
                                />
                            </View>
                            <Text className="text-sm font-medium text-gray-700 mb-1">
                                {t('browse_files')}
                            </Text>
                            <Text className="text-xs text-gray-500 text-center">
                                {t('accepted_photo_formats')}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1">
                                {t('max_size', { size: '10MB' })}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Submit */}
                    <TouchableOpacity
                        disabled={!isValid || isSubmitting}
                        onPress={handleSubmit}
                        className={`py-4 rounded-lg items-center justify-center ${
                            !isValid || isSubmitting ? "bg-gray-300" : "bg-red-600"
                        }`}
                        activeOpacity={0.8}
                    >
                        {isSubmitting ? (
                            <View className="flex-row items-center">
                                <Ionicons name="cloud-upload" size={20} color="#ffffff" />
                                <Text className="text-white font-medium ml-2">
                                    {t('submitting')}
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-white font-medium">
                                {t('complete_setup')}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Help Text */}
                    <Text className="text-xs text-gray-400 mt-4 text-center">
                        {t('all_fields_required')}
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </AnimatedStep>
    );
}