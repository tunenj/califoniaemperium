import { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    Platform,
    BackHandler,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import AnimatedStep from "@/components/AnimatedStep";
import StepIndicator from "@/components/StepIndicator";
import { useSetup } from "@/context/VendorApplicationContext";
import { useLanguage } from "@/context/LanguageContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

type FileAsset =
    | ImagePicker.ImagePickerAsset
    | DocumentPicker.DocumentPickerAsset;

interface FileDisplayInfo {
    name: string;
    size: number;
    uri: string;
    type: string;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export default function Step3() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { data, update, clearData } = useSetup();
    const { t } = useLanguage();

    const [idFile, setIdFile] = useState<FileAsset | null>(null);
    const [photoFile, setPhotoFile] = useState<FileAsset | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPickingImage, setIsPickingImage] = useState(false);
    const [galleryPermission, setGalleryPermission] = useState<boolean | null>(null);
    const [tokenVerifying, setTokenVerifying] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string>('');

    // Function to get parameter string safely
    const getParamString = (param: any): string => (Array.isArray(param) ? param[0] || '' : param || '');

    // Check permissions on component mount
    useEffect(() => {
        checkPermissions();
        debugTokenStatus();
    }, []);

    // Debug token status
    const debugTokenStatus = async () => {
        try {
            console.log('DEBUG - Step3 Token Status');

            // Check AsyncStorage
            const authToken = await AsyncStorage.getItem('authToken');
            const refreshToken = await AsyncStorage.getItem('refreshToken');

            console.log('Auth Token in AsyncStorage:', authToken ? 'Exists' : 'Missing');
            console.log('Refresh Token in AsyncStorage:', refreshToken ? 'Exists' : 'Missing');

            // Check params
            console.log('Params received:', params);

            if (!authToken) {
                console.warn('No auth token found in AsyncStorage');
                // Try to get from params
                await verifyAndSaveToken();
            }

        } catch (error) {
            console.error('Debug error:', error);
            setDebugInfo('Debug error: ');
        }
    };

    // Verify and save token from params
    const verifyAndSaveToken = useCallback(async (): Promise<string | null> => {
        try {
            setTokenVerifying(true);
            console.log('🔄 Verifying and saving token...');

            // Get token from params
            const tokenFromParams = getParamString(params.accessToken);
            const initialTokens = getParamString(params.initialTokens);

            console.log('Token from params:', tokenFromParams ? 'Exists' : 'Missing');
            console.log('Initial tokens:', initialTokens ? 'Exists' : 'Missing');

            let tokenToSave = null;

            // Try to get token from params first
            if (tokenFromParams) {
                tokenToSave = tokenFromParams;
                console.log('✅ Using token from params');
            }
            // If we have initialTokens as JSON string, parse it
            else if (initialTokens) {
                try {
                    const parsedTokens = JSON.parse(initialTokens);
                    if (parsedTokens.access_token) {
                        tokenToSave = parsedTokens.access_token;
                        console.log('✅ Using token from initialTokens JSON');
                    }
                } catch (parseError) {
                    console.error('Error parsing initialTokens:', parseError);
                }
            }

            // Save token from params to AsyncStorage
            if (tokenToSave) {
                await AsyncStorage.setItem('authToken', tokenToSave);
                console.log('✅ Token saved to AsyncStorage from params');

                // Also save refresh token if available
                if (initialTokens) {
                    try {
                        const parsedTokens = JSON.parse(initialTokens);
                        if (parsedTokens.refresh_token) {
                            await AsyncStorage.setItem('refreshToken', parsedTokens.refresh_token);
                            console.log('✅ Refresh token saved');
                        }
                    } catch (error) {
                        console.error('Error saving refresh token:', error);
                    }
                }

                return tokenToSave;
            }

            // Check if token already exists in AsyncStorage
            const existingToken = await AsyncStorage.getItem('authToken');
            if (existingToken) {
                console.log('✅ Using existing token from AsyncStorage');
                return existingToken;
            }

            console.warn('⚠️ No token found in params or AsyncStorage');
            return null;

        } catch (error) {
            console.error('Error verifying token:', error);
            return null;
        } finally {
            setTokenVerifying(false);
        }
    }, [params]);

    const checkPermissions = async () => {
        if (Platform.OS === "web") return;

        try {
            const galleryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
            setGalleryPermission(galleryStatus.granted);
        } catch (error) {
            console.log("Permission check error:", error);
        }
    };

    const getAssetSize = (asset: FileAsset): number => {
        if ("size" in asset && typeof asset.size === "number") {
            return asset.size;
        }
        if ("fileSize" in asset && typeof asset.fileSize === "number") {
            return asset.fileSize;
        }
        return 0;
    };

    const getFileDisplayInfo = (file: FileAsset): FileDisplayInfo => {
        if ("name" in file && file.name) {
            const extension = file.name.split('.').pop()?.toLowerCase();
            const mimeType = getMimeType(extension || '', file.uri);
            return {
                name: file.name,
                size: getAssetSize(file),
                uri: file.uri,
                type: mimeType,
            };
        }
        const mimeType = getMimeType('', file.uri);
        return {
            name: t("selected_image"),
            size: getAssetSize(file),
            uri: file.uri,
            type: mimeType,
        };
    };

    const getMimeType = (extension: string, uri: string): string => {
        if (uri.includes('.jpg') || uri.includes('.jpeg')) {
            return 'image/jpeg';
        }
        if (uri.includes('.png')) {
            return 'image/png';
        }
        if (uri.includes('.pdf')) {
            return 'application/pdf';
        }

        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'pdf':
                return 'application/pdf';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            default:
                return 'application/octet-stream';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    const getFileIcon = (file: FileAsset | null): React.ReactNode => {
        if (!file) {
            return <Ionicons name="document-attach" size={24} color="#6b7280" />;
        }

        const uri = file.uri;
        const extension =
            "name" in file && file.name
                ? file.name.split(".").pop()?.toLowerCase()
                : uri.split(".").pop()?.toLowerCase();

        const isImage =
            extension === "jpg" ||
            extension === "jpeg" ||
            extension === "png" ||
            uri.includes(".jpg") ||
            uri.includes(".jpeg") ||
            uri.includes(".png");

        if (isImage) {
            return <Ionicons name="image" size={24} color="#3b82f6" />;
        }

        switch (extension) {
            case "pdf":
                return <Ionicons name="document-text" size={24} color="#ef4444" />;
            case "doc":
            case "docx":
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

    // Gallery permission request
    const requestGalleryPermission = useCallback(async (): Promise<boolean> => {
        if (Platform.OS === "web") return true;

        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setGalleryPermission(status === "granted");

            if (status !== "granted") {
                Alert.alert(
                    t("permission_required"),
                    t("gallery_permission_needed"),
                    [
                        {
                            text: t("open_settings"),
                            onPress: () => {
                                if (Platform.OS === 'ios') {
                                    Linking.openURL('app-settings:');
                                } else {
                                    Linking.openSettings();
                                }
                            }
                        },
                        { text: t("cancel"), style: "cancel" },
                    ]
                );
                return false;
            }
            return true;
        } catch (error) {
            console.log("Gallery permission error:", error);
            Alert.alert(t("error"), t("permission_request_failed"));
            return false;
        }
    }, [t]);

    // Gallery image picker
    const pickFromGallery = useCallback(async (
        type: "id" | "photo"
    ) => {
        if (isPickingImage) return;

        setIsPickingImage(true);

        try {
            if (Platform.OS === "web") {
                Alert.alert(t("error"), t("gallery_not_supported_web"));
                setIsPickingImage(false);
                return;
            }

            const granted = galleryPermission === true || await requestGalleryPermission();

            if (!granted) {
                setIsPickingImage(false);
                return;
            }

            const galleryOptions: ImagePicker.ImagePickerOptions = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.7,
                exif: false,
                base64: false,
                allowsMultipleSelection: false,
            };

            const result = await ImagePicker.launchImageLibraryAsync(galleryOptions);

            if (result.canceled || !result.assets?.[0]) {
                setIsPickingImage(false);
                return;
            }

            const file = result.assets[0];
            const fileSize = getAssetSize(file);

            if (fileSize > MAX_FILE_SIZE) {
                Alert.alert(
                    t("file_too_large"),
                    t("max_file_size_exceeded", { size: "8MB" })
                );
                setIsPickingImage(false);
                return;
            }

            if (!file.uri || file.uri === '') {
                throw new Error('Invalid file URI');
            }

            if (type === "id") {
                setIdFile(file);
                update({ idDocument: file });
            } else {
                setPhotoFile(file);
                update({ businessPhoto: file });
            }

        } catch (error: any) {
            console.log("Gallery picker error:", error);

            if (type === "id") {
                setIdFile(null);
                update({ idDocument: null });
            } else {
                setPhotoFile(null);
                update({ businessPhoto: null });
            }

            let errorMessage = t("failed_to_pick_image");

            if (error.code === "E_PICKER_CANCELLED") {
                // User cancelled
            } else if (error.message?.includes('memory') || error.message?.includes('Memory')) {
                errorMessage = t("out_of_memory_error");
                Alert.alert(
                    t("error"),
                    t("out_of_memory_error")
                );
            } else {
                errorMessage = `${t("failed_to_pick_image")}: ${error.message || ''}`;
                Alert.alert(t("error"), errorMessage);
            }
        } finally {
            setIsPickingImage(false);
        }
    }, [isPickingImage, t, galleryPermission, requestGalleryPermission, update]);

    const pickDocument = async () => {
        if (isPickingImage) {
            Alert.alert(t("please_wait"), t("operation_in_progress"));
            return;
        }

        setIsPickingImage(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
                type: ["application/pdf", "image/*"],
                multiple: false,
            });

            if (result.canceled || !result.assets?.[0]) {
                setIsPickingImage(false);
                return;
            }

            const file = result.assets[0];
            const fileSize = getAssetSize(file);

            if (fileSize > MAX_FILE_SIZE) {
                Alert.alert(
                    t("file_too_large"),
                    t("max_file_size_exceeded", { size: "8MB" })
                );
                setIsPickingImage(false);
                return;
            }

            setIdFile(file);
            update({ idDocument: file });
        } catch (error: any) {
            console.log("Document picker error:", error);
            Alert.alert(t("error"), t("failed_to_pick_file"));
        } finally {
            setIsPickingImage(false);
        }
    };

    const pickFile = (type: "id" | "photo") => {
        if (isPickingImage) {
            Alert.alert(t("please_wait"), t("image_picker_busy"));
            return;
        }

        if (type === "id") {
            Alert.alert(t("choose_source"), t("select_id_source"), [
                {
                    text: t("gallery"),
                    onPress: () => pickFromGallery("id"),
                    style: galleryPermission === false ? "destructive" : "default"
                },
                { text: t("documents"), onPress: pickDocument },
                { text: t("cancel"), style: "cancel" },
            ]);
        } else {
            Alert.alert(t("choose_source"), t("select_photo_source"), [
                {
                    text: t("gallery"),
                    onPress: () => pickFromGallery("photo"),
                    style: galleryPermission === false ? "destructive" : "default"
                },
                { text: t("cancel"), style: "cancel" },
            ]);
        }
    };

    const submitVendorApplication = async () => {
        try {
            console.log('🔄 Starting vendor application submission...');

            // Get token with retry logic
            let token = await AsyncStorage.getItem('authToken');

            if (!token) {
                console.log('⚠️ No token found, trying to get from params...');
                token = await verifyAndSaveToken();

                if (!token) {
                    // Try one more time from AsyncStorage
                    token = await AsyncStorage.getItem('authToken');

                    if (!token) {
                        throw new Error('Authentication required. Please complete the registration process.');
                    }
                }
            }

            console.log('✅ Token obtained:', token ? 'Exists' : 'Missing');

            if (!token) {
                throw new Error('No authentication token available');
            }

            if (!idFile || !photoFile) {
                throw new Error('Files are required');
            }

            // Prepare form data
            const formData = new FormData();

            // Add text fields
            formData.append('business_name', data.businessName || '');
            // Use comma without space to save characters
            formData.append('business_type', (data.categories?.join(',') || 'General').substring(0, 50));
            formData.append('business_email', data.email || '');
            formData.append('business_phone', data.phone || '');
            formData.append('address', data.shopAddress || '');
            formData.append('city', data.city || 'Lagos');
            formData.append('state', data.state || 'Lagos');
            formData.append('country', 'NG');
            formData.append('description', data.businessDescription || '');
            formData.append('products_description', data.productDescription || '');
            formData.append('expected_monthly_sales', data.expectedSales || '');

            // Add files
            if (idFile) {
                const fileInfo = getFileDisplayInfo(idFile);
                formData.append('identity_document', {
                    uri: idFile.uri,
                    type: fileInfo.type,
                    name: fileInfo.name || `id_document_${Date.now()}.${fileInfo.type.split('/')[1] || 'jpg'}`,
                } as any);
            }

            if (photoFile) {
                const fileInfo = getFileDisplayInfo(photoFile);
                formData.append('business_certificate', {
                    uri: photoFile.uri,
                    type: fileInfo.type,
                    name: fileInfo.name || `business_certificate_${Date.now()}.${fileInfo.type.split('/')[1] || 'jpg'}`,
                } as any);
            }

            console.log('SUBMITTING VENDOR APPLICATION');
            console.log('Token available:', !!token);
            console.log('Business name:', data.businessName);
            console.log('Business email:', data.email);
            console.log('Business phone:', data.phone);
            console.log('Address:', data.shopAddress);
            console.log('ID File:', idFile ? 'Selected' : 'Not selected');
            console.log('Certificate File:', photoFile ? 'Selected' : 'Not selected');
            console.log('==========================================');

            // Make API request
            const response = await api.post(endpoints.vendorApplication, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('==========================================');
            console.log('APPLICATION RESPONSE RECEIVED');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(response.data, null, 2));
            console.log('==========================================');

            if (response.data?.success) {
                // Store application ID in AsyncStorage
                await AsyncStorage.setItem('vendorApplicationId', response.data.data.id);
                await AsyncStorage.setItem('vendorApplicationStatus', response.data.data.status);

                return response.data;
            } else {
                throw new Error(response.data?.message || 'Application submission failed');
            }
        } catch (error: any) {
            console.error('==========================================');
            console.error('ERROR SUBMITTING APPLICATION');
            console.error('Error:', error);
            console.error('Status:', error.response?.status);
            console.error('Message:', error.response?.data?.message || error.message);
            console.error('Data:', error.response?.data);
            console.error('==========================================');

            if (error.response?.status === 401) {
                // Token expired or invalid
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('refreshToken');

                // Try to get token one more time
                const newToken = await verifyAndSaveToken();

                if (newToken) {
                    // Retry with new token
                    Alert.alert(
                        t("session_refreshed") || "Session Refreshed",
                        t("please_try_again") || "Please try submitting again.",
                        [{ text: t("try_again") || "Try Again", onPress: () => handleSubmit() }]
                    );
                    return;
                } else {
                    Alert.alert(
                        t("session_expired") || "Session Expired",
                        t("session_expired_message") || "Your session has expired. Please login again.",
                        [
                            {
                                text: t("login") || "Login",
                                onPress: () => {
                                    router.replace('/signIn');
                                }
                            }
                        ]
                    );
                }
                throw new Error('Session expired');
            }

            throw error;
        }
    };

    // Prevent back button during file picking
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (isPickingImage) {
                    return true;
                }
                return false;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription?.remove();
        }, [isPickingImage])
    );

    const validateForm = (): boolean => {
        if (!data.shopAddress?.trim()) {
            Alert.alert(t("validation_error"), t("business_address_required"));
            return false;
        }

        if (!data.businessRegNumber?.trim()) {
            Alert.alert(
                t("validation_error"),
                t("registration_number_required")
            );
            return false;
        }

        if (!idFile) {
            Alert.alert(t("validation_error"), t("id_document_required"));
            return false;
        }

        if (!photoFile) {
            Alert.alert(
                t("validation_error"),
                t("business_photo_required")
            );
            return false;
        }

        // Add additional validations for vendor application
        if (!data.businessName?.trim()) {
            Alert.alert(t("validation_error"), t("business_name_required"));
            return false;
        }

        if (!data.email?.trim()) {
            Alert.alert(t("validation_error"), t("email_required"));
            return false;
        }

        if (!data.phone?.trim()) {
            Alert.alert(t("validation_error"), t("phone_required"));
            return false;
        }

        if (!data.city?.trim()) {
            Alert.alert(t("validation_error"), t("city_required"));
            return false;
        }

        if (!data.state?.trim()) {
            Alert.alert(t("validation_error"), t("state_required"));
            return false;
        }

        if (!data.businessDescription?.trim()) {
            Alert.alert(t("validation_error"), t("business_description_required"));
            return false;
        }

        if (!data.productDescription?.trim()) {
            Alert.alert(t("validation_error"), t("product_description_required"));
            return false;
        }

        if (!data.expectedSales?.trim()) {
            Alert.alert(t("validation_error"), t("expected_sales_required"));
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (isPickingImage) {
            Alert.alert(t("please_wait"), t("image_picker_in_progress"));
            return;
        }

        if (tokenVerifying) {
            Alert.alert(t("please_wait"), t("verifying_session"));
            return;
        }

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            console.log('Starting vendor application submission...');

            // Submit the vendor application
            const result = await submitVendorApplication();

            console.log('Application submitted successfully:', result);

            // Clear setup data after successful submission
            clearData();

            // Navigate to success screen with application data
            router.replace({
                pathname: "/Setup/business-setup/success",
                params: {
                    applicationId: result.id,
                    status: result.data?.status || 'submitted'
                }
            });

        } catch (error: any) {
            console.log("Submit error:", error);

            let errorMessage = t("submission_failed");
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            // Don't show alert for session expired (already handled)
            if (!error.message?.includes('Session expired')) {
                Alert.alert(
                    t("error"),
                    errorMessage,
                    [
                        { text: t("try_again"), onPress: () => { } },
                        { text: t("cancel"), style: "cancel" }
                    ]
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid =
        Boolean(data.shopAddress?.trim()) &&
        Boolean(data.businessRegNumber?.trim()) &&
        Boolean(idFile) &&
        Boolean(photoFile) &&
        Boolean(data.businessName?.trim()) &&
        Boolean(data.email?.trim()) &&
        Boolean(data.phone?.trim()) &&
        Boolean(data.city?.trim()) &&
        Boolean(data.state?.trim()) &&
        Boolean(data.businessDescription?.trim()) &&
        Boolean(data.productDescription?.trim()) &&
        Boolean(data.expectedSales?.trim());

    return (
        <AnimatedStep>
            <SafeAreaView className="flex-1 bg-white">
                <View className="px-5 pt-4">
                    <View className="items-center mb-4 relative">
                        <Image
                            source={require("@/assets/icons/setupIcon.png")}
                            className="w-20 h-20 mb-3"
                            resizeMode="contain"
                        />

                        <TouchableOpacity
                            onPress={() => {
                                if (!isPickingImage && !tokenVerifying) {
                                    router.back();
                                }
                            }}
                            className="absolute left-0 top-2 p-2"
                            disabled={isPickingImage || tokenVerifying}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={22}
                                color={isPickingImage || tokenVerifying ? "#9ca3af" : "#000"}
                            />
                        </TouchableOpacity>

                        <Text className="font-semibold text-base mt-2">
                            {t("welcome_user", {
                                name: data.firstName || t("user"),
                            })}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">
                            {t("setup_business_profile")}
                        </Text>
                    </View>

                    <StepIndicator totalSteps={3} currentStep={3} />
                </View>

                <ScrollView
                    className="flex-1 px-5"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 30 }}
                >
                    {/* Debug Info */}
                    {__DEV__ && debugInfo && (
                        <View className="bg-gray-100 p-3 rounded-lg mb-4">
                            <Text className="text-xs text-gray-700">{debugInfo}</Text>
                        </View>
                    )}

                    {tokenVerifying && (
                        <View className="bg-blue-50 p-4 rounded-lg mb-4 items-center">
                            <Ionicons name="shield-checkmark" size={24} color="#3b82f6" />
                            <Text className="text-blue-700 font-medium mt-2">
                                {t("verifying_session") || "Verifying your session..."}
                            </Text>
                        </View>
                    )}

                    <Text className="font-medium text-black mb-4 text-right">
                        {t('documentation')}
                    </Text>

                    {/* Business Description */}
                    <Text className="text-xs text-gray-400 mb-1">
                        {t('business_description')} *
                    </Text>
                    <TextInput
                        placeholder={t('describe_your_business')}
                        value={data.businessDescription || ""}
                        onChangeText={(v) => update({ businessDescription: v })}
                        className="border border-gray-300 rounded-lg px-4 py-3 mb-5 text-sm"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        editable={!isPickingImage && !tokenVerifying}
                    />

                    {/* Products Description */}
                    <Text className="text-xs text-gray-400 mb-1">
                        {t('products_services_description')} *
                    </Text>
                    <TextInput
                        placeholder={t('describe_products_services')}
                        value={data.productDescription || ""}
                        onChangeText={(v) => update({ productDescription: v })}
                        className="border border-gray-300 rounded-lg px-4 py-3 mb-5 text-sm"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        editable={!isPickingImage && !tokenVerifying}
                    />

                    {/* Expected Monthly Sales */}
                    <Text className="text-xs text-gray-400 mb-1">
                        {t('expected_monthly_sales')} *
                    </Text>
                    <TextInput
                        placeholder={t('enter_expected_sales')}
                        value={data.expectedSales || ""}
                        onChangeText={(v) => update({ expectedSales: v })}
                        className="border border-gray-300 rounded-lg px-4 py-3 mb-5 text-sm"
                        editable={!isPickingImage && !tokenVerifying}
                    />

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
                        editable={!isPickingImage && !tokenVerifying}
                    />

                    {/* City */}
                    <Text className="text-xs text-gray-400 mb-1">
                        {t('city')} *
                    </Text>
                    <TextInput
                        placeholder={t('enter_city')}
                        value={data.city || ""}
                        onChangeText={(v) => update({ city: v })}
                        className="border border-gray-300 rounded-lg px-4 py-3 mb-5 text-sm"
                        editable={!isPickingImage && !tokenVerifying}
                    />

                    {/* State */}
                    <Text className="text-xs text-gray-400 mb-1">
                        {t('state')} *
                    </Text>
                    <TextInput
                        placeholder={t('enter_state')}
                        value={data.state || ""}
                        onChangeText={(v) => update({ state: v })}
                        className="border border-gray-300 rounded-lg px-4 py-3 mb-5 text-sm"
                        editable={!isPickingImage && !tokenVerifying}
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
                        editable={!isPickingImage && !tokenVerifying}
                    />

                    {/* ID Upload */}
                    <Text className="text-xs text-gray-400 mb-2">
                        {t('means_of_identification')} *
                    </Text>

                    {idFile ? (
                        <View className="border border-red-200 bg-red-50 rounded-lg p-4 mb-4">
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center flex-1">
                                    {getFileIcon(idFile)}
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
                                            {getFileDisplayInfo(idFile).name}
                                        </Text>
                                        <Text className="text-xs text-gray-500">
                                            {formatFileSize(getFileDisplayInfo(idFile).size)}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => !isPickingImage && !tokenVerifying && removeFile("id")}
                                    className="p-2"
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    disabled={isPickingImage || tokenVerifying}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={20}
                                        color={isPickingImage || tokenVerifying ? "#9ca3af" : "#dc2626"}
                                    />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={() => pickFile("id")}
                                className="mt-2"
                                disabled={isPickingImage || tokenVerifying}
                            >
                                <Text className={`text-sm font-medium ${isPickingImage || tokenVerifying ? 'text-gray-400' : 'text-red-600'}`}>
                                    {isPickingImage ? t('processing') : t('replace_file')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => pickFile("id")}
                            className="border-2 border-dashed border-red-300 bg-red-50 py-6 rounded-lg items-center mb-4"
                            activeOpacity={0.8}
                            disabled={isPickingImage || tokenVerifying}
                            style={{ opacity: (isPickingImage || tokenVerifying) ? 0.7 : 1 }}
                        >
                            <View className="bg-red-100 p-3 rounded-full mb-3">
                                <Ionicons
                                    name="cloud-upload-outline"
                                    size={28}
                                    color={isPickingImage || tokenVerifying ? "#9ca3af" : "#dc2626"}
                                />
                            </View>
                            <Text className={`text-sm font-medium mb-1 ${isPickingImage || tokenVerifying ? 'text-gray-400' : 'text-gray-700'}`}>
                                {t('select_id_document')}
                            </Text>
                            <Text className="text-xs text-gray-500 text-center">
                                {t('gallery_documents')}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1">
                                {t('max_size', { size: '8MB' })}
                            </Text>
                            {isPickingImage && (
                                <Text className="text-xs text-red-500 mt-2">
                                    {t('processing_image')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Business Certificate Upload */}
                    <Text className="text-xs text-gray-400 mb-2">
                        {t('business_certificate')} *
                    </Text>

                    {photoFile ? (
                        <View className="border border-red-200 bg-red-50 rounded-lg p-4 mb-8">
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center flex-1">
                                    {getFileIcon(photoFile)}
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
                                            {getFileDisplayInfo(photoFile).name}
                                        </Text>
                                        <Text className="text-xs text-gray-500">
                                            {formatFileSize(getFileDisplayInfo(photoFile).size)}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => !isPickingImage && !tokenVerifying && removeFile("photo")}
                                    className="p-2"
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    disabled={isPickingImage || tokenVerifying}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={20}
                                        color={isPickingImage || tokenVerifying ? "#9ca3af" : "#dc2626"}
                                    />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={() => pickFile("photo")}
                                className="mt-2"
                                disabled={isPickingImage || tokenVerifying}
                            >
                                <Text className={`text-sm font-medium ${isPickingImage || tokenVerifying ? 'text-gray-400' : 'text-red-600'}`}>
                                    {isPickingImage ? t('processing') : t('replace_file')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => pickFile("photo")}
                            className="border-2 border-dashed border-red-300 bg-red-50 py-6 rounded-lg items-center mb-8"
                            activeOpacity={0.8}
                            disabled={isPickingImage || tokenVerifying}
                            style={{ opacity: (isPickingImage || tokenVerifying) ? 0.7 : 1 }}
                        >
                            <View className="bg-red-100 p-3 rounded-full mb-3">
                                <Ionicons
                                    name="image-outline"
                                    size={28}
                                    color={isPickingImage || tokenVerifying ? "#9ca3af" : "#dc2626"}
                                />
                            </View>
                            <Text className={`text-sm font-medium mb-1 ${isPickingImage || tokenVerifying ? 'text-gray-400' : 'text-gray-700'}`}>
                                {t('select_business_certificate')}
                            </Text>
                            <Text className="text-xs text-gray-500 text-center">
                                {t('jpg_png_jpeg_pdf')}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1">
                                {t('max_size', { size: '8MB' })}
                            </Text>
                            {isPickingImage && (
                                <Text className="text-xs text-red-500 mt-2">
                                    {t('processing_image')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Submit */}
                    <TouchableOpacity
                        disabled={!isValid || isSubmitting || isPickingImage || tokenVerifying}
                        onPress={handleSubmit}
                        className={`py-4 rounded-lg items-center justify-center ${!isValid || isSubmitting || isPickingImage || tokenVerifying
                            ? "bg-gray-300"
                            : "bg-red-600"
                            }`}
                        activeOpacity={0.8}
                    >
                        {isSubmitting ? (
                            <View className="flex-row items-center">
                                <Ionicons name="cloud-upload" size={20} color="#ffffff" />
                                <Text className="text-white font-medium ml-2">
                                    {t('submitting_application')}
                                </Text>
                            </View>
                        ) : isPickingImage ? (
                            <View className="flex-row items-center">
                                <Ionicons name="images" size={20} color="#ffffff" />
                                <Text className="text-white font-medium ml-2">
                                    {t('processing_image')}
                                </Text>
                            </View>
                        ) : tokenVerifying ? (
                            <View className="flex-row items-center">
                                <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
                                <Text className="text-white font-medium ml-2">
                                    {t('verifying_session') || "Verifying Session..."}
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-white font-medium">
                                {t('submit_application')}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Help Text */}
                    <Text className="text-xs text-gray-400 mt-4 text-center">
                        {t('all_fields_required_vendor')}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-2 text-center">
                        {t('application_review_time')}
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </AnimatedStep>
    );
}