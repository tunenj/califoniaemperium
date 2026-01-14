// app/(auth)/ResetPasswordForm.tsx
import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ResetPasswordForm: React.FC = () => {
    const router = useRouter();
    const [input, setInput] = useState('');
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);

    useEffect(() => {
        setIsButtonEnabled(input.trim() !== '');
    }, [input]);

    const handleBack = () => {
        router.back();
    };

    const handleSendCode = () => {
        if (!input.trim()) return;

        // Navigate to OTP screen or handle reset logic
        router.push({
            pathname: '/(auth)/OtpVerification',
            params: { source: 'reset-password', input },
        });
    };

    return (
        <View className="flex-1 bg-white">
            {/* Top Red Header with Bag Icon */}
            <View className="bg-[#C62828] h-1/3 min-h-[250px] relative">
                <View className="flex-1 items-center justify-center">
                    <Image
                        source={images.onboarding} // your bag icon
                        className="w-20 h-20"
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Bottom White Section */}
            <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-8">
                <View className="relative mb-8">
                    <TouchableOpacity
                        className="absolute top-0 left-0 p-2 z-10"
                        onPress={handleBack}
                    >
                        <ArrowLeft size={28} color="#C62828" />
                    </TouchableOpacity>

                    {/* Title & Description */}
                    <View className="items-center mt-3 mb-10">
                        <Text className="text-2xl font-bold text-black mb-3">
                            Reset Password
                        </Text>
                        <Text className="text-gray-600 text-base items-center justify-center leading-6">
                            A password reset link will be sent to your email or phone number
                        </Text>
                    </View>
                </View>

                {/* Input Field */}
                <View className="mb-10">
                    <Text className="text-gray-700 text-base mb-3">
                        Email or phone number
                    </Text>
                    <View className="relative">
                        <TextInput
                            className="bg-gray-100 rounded-lg px-4 py-4 text-base border-b-2 border-secondary"
                            placeholder="Enter your email or phone number"
                            placeholderTextColor="black"
                            value={input}
                            onChangeText={setInput}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>
                </View>

                {/* Send Code Button */}
                <TouchableOpacity
                    className={`rounded-full py-4 items-center ${isButtonEnabled ? 'bg-[#C62828]' : 'bg-gray-300'
                        }`}
                    activeOpacity={0.8}
                    onPress={handleSendCode}
                    disabled={!isButtonEnabled}
                >
                    <Text
                        className={`text-lg font-medium ${isButtonEnabled ? 'text-white' : 'text-gray-500'
                            }`}
                    >
                        Send Code
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ResetPasswordForm;