import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BusinessLoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isBusiness, setIsBusiness] = useState(true); // true for Business, false for Customer

    // Compute form filled AFTER declaring email and password
    const isFormFilled = email.trim() !== '' && email.includes('@') && password.trim() !== '';
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    const handleSwitch = () => {
        setIsBusiness(!isBusiness);
    };

    const handleForgotPassword = () => {
        // Navigate to forgot password screen
        router.push('/(auth)/forgotPassword');
    };

    const handleLogin = () => {
        // Handle login logic here
        // For now, just navigate or log
        console.log('Logging in as', isBusiness ? 'Business' : 'Customer');
    };

    const handleSignUp = () => {
        // Navigate to sign up / register screen
        router.push('/(auth)/signUp'); // Adjust path as needed
    };

    return (
        <View className="flex-1 bg-white">
            {/* Top Red Header with Bag Icon */}
            <View className="bg-[#C62828] h-1/3 min-h-[250px] relative">
                <View className="flex-1 items-center justify-center pt-12">
                    <Image
                        source={images.onboarding} // Assuming this is your shopping bag icon
                        className="w-20 h-20"
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Bottom White Section (slightly overlapping) */}
            <View className="flex-1 bg-white -mt-12 rounded-t-3xl px-8 pt-8">
                {/* Back Arrow and Title Section */}
                <View className="relative mb-8">
                    {/* Back Arrow */}
                    <TouchableOpacity
                        className="absolute top-0 left-0 p-2 z-10"
                        onPress={handleBack}
                    >
                        <ArrowLeft size={28} color="#C62828" />
                    </TouchableOpacity>

                    {/* Title and Switch */}
                    <View className="items-center">
                        <Text className="text-2xl font-bold text-black mb-2">
                            Log in as {isBusiness ? 'Business' : 'Customer'}
                        </Text>

                        <TouchableOpacity className="flex-row items-center" onPress={handleSwitch}>
                            <Image source={images.switchIcon} className="w-5 h-5 mr-2" resizeMode="contain" />
                            <Text className="text-base text-gray-500 underline">
                                Switch to {isBusiness ? 'customer' : 'Business'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Fields */}
                <View className="mb-8">
                    {/* Email */}
                    <Text className="text-gray-700 text-base mb-2">Email</Text>
                    <TextInput
                        className="bg-gray-100 rounded-lg px-4 py-4 text-base border-b-2 border-[#C62828]"
                        placeholder="Enter your email"
                        placeholderTextColor="black"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* Password */}
                    <Text className="text-gray-700 text-base mt-6 mb-2">Password</Text>
                    <View className="relative">
                        <TextInput
                            className="bg-gray-100 rounded-lg px-4 py-4 text-base pr-12 border-b-2 border-secondary"
                            placeholder="Enter Password"
                            placeholderTextColor="black"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            className="absolute right-4 top-4"
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff size={24} color="#999" />
                            ) : (
                                <Eye size={24} color="#999" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity className="items-end mt-3" onPress={handleForgotPassword}>
                        <Text className="text-[#C62828] text-sm">Forgot password?</Text>
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    className={`rounded-full py-4 items-center mb-8 ${isFormFilled ? 'bg-red-600 opacity-100' : 'bg-gray-300 opacity-80'
                        }`}
                    onPress={handleLogin}
                    disabled={!isFormFilled}
                >
                    <Text
                        className={`text-lg font-semibold ${isFormFilled ? 'text-white' : 'text-gray-500'
                            }`}
                    >
                        Login
                    </Text>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View className="items-center">
                    <Text className="text-gray-600 text-base">
                        Don&apos;t have an account?{' '}
                        <Text className="text-[#C62828] font-semibold" onPress={handleSignUp}>
                            Sign up
                        </Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default BusinessLoginScreen;