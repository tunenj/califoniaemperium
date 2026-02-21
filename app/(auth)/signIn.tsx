import images from '@/constants/images';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Image, Text, TouchableOpacity, View, Alert } from 'react-native';
import { colors } from "@/constants/color";
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogle } from '@/utils/googleAuth';
import { loginWithGoogle } from '@/service/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBiometric } from '@/context/BiometricContext';
import { BiometricLoginButton } from '@/components/BiometricLoginButton';

const BusinessLoginScreen: React.FC = () => {
    const [isCustomer, setIsCustomer] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showBiometric, setShowBiometric] = useState(false);

    const router = useRouter();
    const { t } = useLanguage();

    // ✅ Add biometric hook - removed unused variables
    const { 
        checkBiometricAvailability,
        isBiometricEnabled,
    } = useBiometric();

    // ✅ Check biometric status on mount
    useEffect(() => {
        const checkBiometricStatus = async () => {
            const available = await checkBiometricAvailability();
            if (available) {
                const enabled = await isBiometricEnabled();
                setShowBiometric(enabled);
            }
        };
        checkBiometricStatus();
    }, [checkBiometricAvailability, isBiometricEnabled]);

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
                router.replace('/(customer)/main');
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

    // Handle successful biometric login
    const handleBiometricSuccess = () => {
        // This will be called after successful biometric authentication
        console.log('Biometric login successful');
        // You can add any post-login logic here
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

                    {/* ✅ Biometric Login - Show if available and enabled */}
                    {showBiometric && (
                        <View className="mb-6">
                            <BiometricLoginButton 
                                variant="full" 
                                onSuccess={handleBiometricSuccess}
                            />
                            <View className="flex-row items-center my-4">
                                <View className="flex-1 h-px bg-gray-300" />
                                <Text className="mx-4 text-gray-500">OR</Text>
                                <View className="flex-1 h-px bg-gray-300" />
                            </View>
                        </View>
                    )}

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