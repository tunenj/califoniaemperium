// app/(auth)/SuccessSetup.tsx
import images from '@/constants/images';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type UserRole = 'business' | 'customer';

const SuccessSetup: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    /** Helper to normalize params */
    const getParamString = (param: any): string => {
        if (!param) return '';
        return Array.isArray(param) ? param[0] || '' : param;
    };

    // Get all parameters (only what we need)
    const firstName = getParamString(params.firstName) || 'User';
    const lastName = getParamString(params.lastName) || '';
    const email = getParamString(params.email) || '';
    const phoneNumber = getParamString(params.phoneNumber) || '';
    const role = (getParamString(params.role) || 'business') as UserRole;
    const isCustomerParam = getParamString(params.isCustomer);
    
    // Determine role
    const userRole: UserRole = role === 'customer' || isCustomerParam === 'true' ? 'customer' : 'business';

    const isBusiness = userRole === 'business';

    const handleBack = () => {
        router.back();
    };

    const handleSetupStore = () => {
        if (isBusiness) {
            // Navigate to business store setup flow
            router.push({
                pathname: '/Setup/business-setup/step-1',
                params: {
                    email,
                    phoneNumber,
                    firstName,
                    lastName,
                    role: userRole,
                },
            });
        } else {
            // Navigate to customer profile setup
            router.push({
                pathname: '/Setup/profile-setup',
                params: {
                    email,
                    phoneNumber,
                    firstName,
                    lastName,
                    role: userRole,
                },
            });
        }
    };

    const handleLater = () => {
        if (isBusiness) {
            // Navigate to vendor home/dashboard
            router.replace('/dashboard');
        } else {
            // Navigate to customer home/dashboard
            router.replace('/main');
        }
    };


    const getSetupButtonText = () => {
        return isBusiness ? 'Set Up Store' : 'Set Up Profile';
    };

    const getLaterButtonText = () => {
        return isBusiness ? 'Skip Store Setup' : 'Skip Profile Setup';
    };


    return (
        <View className="flex-1 bg-white">
            {/* Top Red Header with Bag Icon */}
            <View className="bg-secondary h-1/3 min-h-[250px] relative">
                <View className="flex-1 items-center justify-center">
                    <Image
                        source={images.onboarding}
                        className="w-16 h-16"
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Bottom Curved White Section */}
            <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-10">
                <View className="relative mb-8">
                    {/* Back Arrow */}
                    <TouchableOpacity
                        className="absolute top-0 left-0 z-10"
                        onPress={handleBack}
                    >
                        <ArrowLeft size={28} color="#C62828" />
                    </TouchableOpacity>

                    {/* Success Icon and Title */}
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                            <CheckCircle size={48} color="#10B981" />
                        </View>
                        <Text className="text-3xl font-bold text-black mb-2">
                            Successful
                        </Text>
                        <Text className="text-gray-600 text-lg text-center px-4">
                            Account created successfully
                        </Text>
                    </View>

                    {/* Role indicator - Optional, remove if not needed */}
                    <View className="items-center mb-8">
                        <View className="bg-gray-100 px-4 py-2 rounded-full">
                            <Text className="text-gray-700 text-sm font-medium">
                                {isBusiness ? 'Business Account' : 'Customer Account'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Setup Button - Primary Button */}
                <TouchableOpacity
                    className="bg-secondary rounded-xl py-5 items-center shadow-md active:opacity-90 mb-4"
                    activeOpacity={0.8}
                    onPress={handleSetupStore}
                >
                    <Text className="text-white text-lg font-semibold">
                        {getSetupButtonText()}
                    </Text>
                </TouchableOpacity>

                {/* Skip/Later Button - Secondary Button */}
                <TouchableOpacity
                    className="border border-gray-300 bg-white rounded-xl py-5 items-center mb-8"
                    activeOpacity={0.8}
                    onPress={handleLater}
                >
                    <Text className="text-gray-700 text-lg font-semibold">
                        {getLaterButtonText()}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SuccessSetup;