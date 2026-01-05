// app/(auth)/SetupStore.tsx
import images from '@/constants/images';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const SetupStore: React.FC = () => {
    const router = useRouter();

    const handleSetupStore = () => {
        // Navigate to store setup flow
        console.log('Navigate to store setup');
        router.push('/');
    };

    const handleLater = () => {
        // Navigate to main dashboard/home
        console.log('Skip store setup, go to main app');
        router.replace('/(tabs)/home'); // Replace so user can't go back to this screen
    };

    return (
        <View className="flex-1 bg-white">
            {/* Top Red Header */}
            <View className="bg-secondary h-1/3 min-h-[250px] relative">
                <View className="flex-1 items-center justify-center">
                    <Image
                        source={images.onboarding}
                        className="w-20 h-20"
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Bottom White Content Section */}
            <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-12">
                {/* Success Checkmark/Icon */}
                <View className="items-center">
                    <View className="flex-1 items-center justify-center mt-12 mb-20">
                        <Image
                            source={images.successIcon}
                            className="w-24 h-24"
                            resizeMode="contain"
                        />
                    </View>

                    {/* Success Message */}
                    <View className='mt-5'>
                        <Text className="text-2xl font-bold text-center mb-2 text-black">
                            Successful
                        </Text>
                        <Text className="text-base text-gray-500 text-center mb-10">
                            Account created successfully
                        </Text>
                    </View>
                </View>


                {/* Action Buttons */}
                <View className="space-y-4">
                    {/* Setup Store Button */}
                    <TouchableOpacity
                        className="bg-secondary rounded-xl py-4 items-center shadow-md active:opacity-90"
                        activeOpacity={0.8}
                        onPress={handleSetupStore}
                    >
                        <Text className="text-white text-lg font-semibold">
                            Set Up Store
                        </Text>
                    </TouchableOpacity>

                    {/* Later Button */}
                    <TouchableOpacity
                        className="border border-gray-300 rounded-xl mt-4 py-4 items-center active:bg-gray-50"
                        activeOpacity={0.8}
                        onPress={handleLater}
                    >
                        <Text className="text-gray-600 text-lg font-semibold">
                            I&apos;ll do that later
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default SetupStore;