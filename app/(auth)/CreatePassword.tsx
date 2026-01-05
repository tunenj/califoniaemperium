// app/(auth)/CreatePassword.tsx
import images from '@/constants/images';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CreatePassword: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Extract passed data from OTP verification
    const {
        firstName = '',
        lastName = '',
        phoneNumber = '',
        method = 'sms',
        isCustomer = 'false',
    } = params;

    const userName = params.firstName || 'User';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);

    useEffect(() => {
        // Enable button only when both password fields have at least 1 character
        const isEnabled = password.trim().length > 0 && confirmPassword.trim().length > 0;
        setIsButtonEnabled(isEnabled);
    }, [password, confirmPassword]);

    const handleBack = () => {
        router.back();
    };

    const handleCreatePassword = useCallback(() => {
        if (!isButtonEnabled) return;

        if (!password.trim() || !confirmPassword.trim()) {
            Alert.alert('Error', 'Please fill in both fields');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Password Too Short', 'Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Passwords Do Not Match', 'Your passwords don\'t match. Please re-enter them carefully.');
            return;
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
            Alert.alert(
                'Weak Password',
                'Password should contain at least:\n• One uppercase letter\n• One lowercase letter\n• One number\n• One special character'
            );
            return;
        }

        console.log('Password Created Successfully');
        console.log('User Data:', {
            firstName,
            lastName,
            phoneNumber,
            method,
            isCustomer,
            password: '***'
        });

        // Navigate to home or dashboard
        router.push('/(auth)/SuccessSetup');
    }, [isButtonEnabled, password, confirmPassword, firstName, lastName, phoneNumber, method, isCustomer, router]);

    const handleLogin = () => {
        router.push('/(auth)/signIn');
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
                    <TouchableOpacity
                        className="absolute top-0 left-0 p-2 z-10"
                        onPress={handleBack}
                    >
                        <ArrowLeft size={28} color="#C62828" />
                    </TouchableOpacity>
                    {/* Greeting & Title */}
                    <Text className="text-2xl font-bold text-center text-black mb-2">
                        Welcome, {userName}
                    </Text>
                    <Text className="text-base text-gray-500 text-center mb-8">
                        Create a password for your account
                    </Text>
                </View>
                {/* Password Input */}
                <View className="mb-4">
                    <Text className="text-gray-600 text-sm mb-2">Create Password</Text>
                    <View className="relative">
                        <TextInput
                            className="bg-gray-100 rounded-lg px-4 py-4 text-base pr-12"
                            placeholder="Enter Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff size={22} color="#666" />
                            ) : (
                                <Eye size={22} color="#666" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Confirm Password Input */}
                <View className="mb-8">
                    <Text className="text-gray-600 text-sm mb-2">Confirm Password</Text>
                    <View className="relative">
                        <TextInput
                            className="bg-gray-100 rounded-lg px-4 py-4 text-base pr-12"
                            placeholder="Re-enter Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={22} color="#666" />
                            ) : (
                                <Eye size={22} color="#666" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Create Password Button */}
                <TouchableOpacity
                    className={`rounded-xl py-4 items-center ${isButtonEnabled ? 'bg-secondary' : 'bg-gray-300'}`}
                    activeOpacity={0.8}
                    onPress={handleCreatePassword}
                >
                    <Text className={`text-lg font-semibold ${isButtonEnabled ? 'text-white' : 'text-gray-500'}`}>
                        Create Password
                    </Text>
                </TouchableOpacity>

                {/* Login Link */}
                <View className="items-center mt-8">
                    <TouchableOpacity onPress={handleLogin}>
                        <Text className="text-gray-600 text-base text-center">
                            Already have an account?{' '}
                            <Text className="text-secondary font-semibold">Log in</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default CreatePassword;