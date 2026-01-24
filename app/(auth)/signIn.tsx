import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, Mail, PhoneCall } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { colors } from "@/constants/color";
import { useLanguage } from '@/context/LanguageContext'; // Add import

const BusinessLoginScreen: React.FC = () => {
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [isCustomer, setIsCustomer] = useState(false);

    const router = useRouter();
    const { t } = useLanguage(); // Add hook

    const handlePhoneSignIn = () => {
        router.push('/LoginForm/PhoneSignIn');
    };

    const handleEmailSignIn = () => {
        router.push('/LoginForm/EmailSignIn');
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

                    {/* Phone Sign-up */}
                    <TouchableOpacity className="flex-row items-center mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
                        onPress={handlePhoneSignIn}
                    >
                        <PhoneCall color={colors.darkRed} size={24} style={{ marginRight: 16 }} />
                        <Text className="text-lg text-gray-900 flex-1 pl-8">
                            {t('login_with_phone_number')}
                        </Text>
                    </TouchableOpacity>

                    {/* Google Sign-up */}
                    <TouchableOpacity className="flex-row items-center mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <Image source={images.googleIcon} className="w-6 h-6 mr-4" />
                        <Text className="text-lg text-gray-900 flex-1 pl-14">
                            {t('login_with_google')}
                        </Text>
                    </TouchableOpacity>

                    {/* OR Divider */}
                    {showMoreOptions && (
                        <View className="flex-row items-center my-6">
                            <View className="flex-1 h-px bg-gray-300" />
                            <Text className="px-4 text-gray-500 text-sm font-medium">{t('or')}</Text>
                            <View className="flex-1 h-px bg-gray-300" />
                        </View>
                    )}

                    {/* Email Option */}
                    {showMoreOptions && (
                        <TouchableOpacity className="flex-row items-center mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
                            onPress={handleEmailSignIn}
                        >
                            <Mail color={colors.darkRed} size={24} style={{ marginRight: 16 }} />
                            <Text className="text-lg text-gray-900 flex-1 pl-14">
                                {t('email_and_password')}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* More Options */}
                    <TouchableOpacity
                        className="flex-row items-center justify-center mb-8 py-4 border-b border-gray-200"
                        onPress={() => setShowMoreOptions(!showMoreOptions)}
                    >
                        <Text className="text-gray-400 text-sm font-medium mr-2">
                            {showMoreOptions ? t('less_options') : t('more_options')}
                        </Text>
                        {showMoreOptions ? (
                            <ChevronUp color="#9CA3AF" size={16} />
                        ) : (
                            <ChevronDown color="#9CA3AF" size={16} />
                        )}
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