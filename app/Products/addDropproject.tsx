import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

/* ================= COMPONENT ================= */

export default function SyncDropshipProduct() {
    const router = useRouter();
    const { t } = useLanguage();
    const [isSyncing, setIsSyncing] = useState(false);

    /* ---------------- SYNC WITH CJ ---------------- */

    const handleSyncWithCJ = async () => {
        try {
            setIsSyncing(true);
            
            const token = await AsyncStorage.getItem('accessToken');
            
            console.log('🔄 Triggering CJ Dropshipping sync...');
            
            const response = await api.post(
                endpoints.dropShipping, // '/products/dropship-products/sync_with_cj/'
                {}, // Empty body as required
                {
                    headers: {
                        'Authorization': `Bearer ${token || ''}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('✅ Sync response:', response.data);

            if (response.data && response.data.success) {
                Toast.show({
                    type: 'success',
                    text1: t('success') || 'Success',
                    text2: response.data.message || 'Products sync triggered successfully',
                });
                
                Alert.alert(
                    t('success') || 'Success',
                    response.data.message || 'Products sync has been triggered successfully',
                    [
                        { 
                            text: 'OK', 
                            onPress: () => {
                                // Navigate back to dropshipping list after user acknowledges
                                router.push('/(admin)/dropShipping');
                            }
                        }
                    ]
                );
            } else {
                throw new Error(response.data?.message || 'Sync failed');
            }
        } catch (error: any) {
            console.error('❌ Sync error:', error);
            
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                'Failed to trigger product sync';
            
            Toast.show({
                type: 'error',
                text1: t('error') || 'Error',
                text2: errorMessage,
            });
            
            Alert.alert(
                t('error') || 'Error',
                errorMessage,
                [{ text: 'OK' }]
            );
        } finally {
            setIsSyncing(false);
        }
    };

    /* ================= UI ================= */

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-5 pt-4">
                {/* Header */}
                <View className="mb-8">
                    <TouchableOpacity onPress={() => router.back()} className="mb-4">
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>

                    <Text className="text-2xl font-bold text-gray-900">
                        {t('sync_cj_products') || 'Sync CJ Products'}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-2">
                        {t('sync_cj_description') || 'Trigger a sync with CJ Dropshipping to import the latest products'}
                    </Text>
                </View>

                {/* Sync Button */}
                <View className="flex-1 justify-center items-center -mt-20">
                    <TouchableOpacity
                        onPress={handleSyncWithCJ}
                        disabled={isSyncing}
                        className="bg-blue-600 py-4 px-8 rounded-xl flex-row items-center justify-center"
                        style={{ minWidth: 200 }}
                    >
                        {isSyncing ? (
                            <>
                                <ActivityIndicator color="#ffffff" size="small" />
                                <Text className="text-white font-semibold ml-2">
                                    {t('syncing') || 'Syncing...'}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="sync-outline" size={24} color="#ffffff" />
                                <Text className="text-white font-semibold ml-2 text-lg">
                                    {t('sync_now') || 'Sync Now'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <Text className="text-xs text-gray-400 mt-4 text-center">
                        {t('sync_note') || 'This will fetch the latest products from CJ Dropshipping'}
                    </Text>
                </View>
            </View>

            {/* Toast component */}
            <Toast />
        </SafeAreaView>
    );
}