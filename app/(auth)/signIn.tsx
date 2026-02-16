import images from '@/constants/images';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View, Alert } from 'react-native';
import { colors } from "@/constants/color";
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogle } from '@/utils/googleAuth';
import { loginWithGoogle } from '@/service/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BusinessLoginScreen: React.FC = () => {
    const [isCustomer, setIsCustomer] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { t } = useLanguage();

    const handleEmailSignIn = () => {
        router.push('/LoginForm/EmailSignIn');
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);

            // Step 1: Get Google access token
            const googleResult = await signInWithGoogle();
            
            if (!googleResult.success) {
                Alert.alert('Error', 'Failed to authenticate with Google');
                return;
            }

            // Step 2: Send token to your backend
            const loginResult = await loginWithGoogle(googleResult.accessToken!);

            if (loginResult.success) {
                // Step 3: Store user data and tokens
                await AsyncStorage.setItem('userToken', loginResult.data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(loginResult.data.user));
                
                // Step 4: Navigate to main app
                router.replace('/(app)/home'); // Navigate to your main screen
            } else {
                Alert.alert('Error', loginResult.error || 'Login failed');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper functions for dynamic text
    const getLoginTitle = () => {
        return `${t('login_as')} ${isCustomer ? t('customer') : t('business')}`;
    };

    const getSwitchText = () => {
        return `${t('switch_to')} ${isCustomer ? t('business') : t('customer')}`;
    };

    return (
        <View className="flex-1 bg-white">
            {/* Top Image Section */}
            <View className="bg-secondary h-1/3 min-h-[250px]">
                <View className="flex-1 items-center justify-center px-6 pt-20">
                    <View className="w-20 h-20 rounded-2xl items-center justify-center mb-4 shadow-lg">
                        <Image
                            source={images.onboarding}
                            className="w-20 h-20"
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </View>

            {/* Bottom Section */}
            <View className="flex-1 bg-white -mt-8 rounded-t-3xl">
                <View className="px-6 pt-8">
                    {/* Title & Switch */}
                    <View className="mb-8 items-center">
                        <Text className="text-lg font-semibold text-black mb-1">
                            {getLoginTitle()}
                        </Text>

                        <TouchableOpacity
                            className="flex-row"
                            onPress={() => setIsCustomer(!isCustomer)}
                        >
                            <Image source={images.switchIcon} className="w-6 h-6 mr-2" />
                            <Text className="text-lg text-gray-400 font-medium underline">
                                {getSwitchText()}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Email Sign-in */}
                    <TouchableOpacity 
                        className="flex-row items-center mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
                        onPress={handleEmailSignIn}
                        disabled={isLoading}
                    >
                        <Ionicons name="mail" color={colors.darkRed} size={24} style={{ marginRight: 16 }} />
                        <Text className="text-lg text-gray-900 flex-1 pl-14">
                            {t('email_and_password')}
                        </Text>
                    </TouchableOpacity>

                    {/* Google Sign-in */}
                    <TouchableOpacity 
                        className={`flex-row items-center mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 ${isLoading ? 'opacity-50' : ''}`}
                        onPress={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <Image source={images.googleIcon} className="w-6 h-6 mr-4" />
                        <Text className="text-lg text-gray-900 flex-1 pl-14">
                            {isLoading ? 'Processing...' : t('login_with_google')}
                        </Text>
                    </TouchableOpacity>

                    {/* Sign up link */}
                    <View className="flex-row justify-center">
                        <TouchableOpacity onPress={() => router.push('/(auth)/signUp')}>
                            <Text className="text-gray-600 text-lg">
                                {t('dont_have_account')}{' '}
                                <Text className="text-accent">{t('sign_up')}</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default BusinessLoginScreen;