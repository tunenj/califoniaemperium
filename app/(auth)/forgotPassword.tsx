// app/(auth)/ResetPasswordForm.tsx
import images from '@/constants/images';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { showToast } from '@/utils/toastHelper';

const ResetPasswordForm: React.FC = () => {
    const router = useRouter();
    const { t } = useLanguage();

    const [email, setEmail] = useState('');
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(true);

    useEffect(() => {
        const trimmedEmail = email.trim();
        setIsButtonEnabled(trimmedEmail !== '');

        // Validate email format if input is not empty
        if (trimmedEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setIsEmailValid(emailRegex.test(trimmedEmail));
        } else {
            setIsEmailValid(true); // Reset validation when empty
        }
    }, [email]);

    const handleBack = () => {
        if (isLoading) return;
        router.back();
    };

    const validateEmail = (): boolean => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            showToast(t('email_required') || 'Email is required', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            showToast(t('invalid_email_format') || 'Please enter a valid email address', 'error');
            return false;
        }

        return true;
    };

    const handleSendResetCode = async () => {
        if (!validateEmail() || isLoading) return;

        setIsLoading(true);

        try {
            console.log('Sending password reset request for:', email.trim().toLowerCase());

            const response = await api.post(endpoints.forgotPassword, {
                email: email.trim().toLowerCase(),
            });

            console.log('Reset password response:', response.data);

            if (response.data?.success === true) {
                // Success - navigate to OTP verification
                showToast(
                    response.data.message ||
                    t('reset_email_sent') ||
                    'Password reset instructions sent to your email',
                    'success'
                );

                // Navigate to OTP screen
                router.push({
                    pathname: '/OtpVerification',
                    params: {
                        source: 'reset-password',
                        email: email.trim().toLowerCase(),
                        message: response.data.message
                    },
                });
            } else {
                // Handle unsuccessful response
                showToast(
                    response.data?.message ||
                    t('reset_password_failed') ||
                    'Failed to send reset instructions',
                    'error'
                );
            }

        } catch (error: any) {
            console.error('Reset password error:', error);

            let errorMessage = t('reset_password_failed') ||
                'Failed to send reset instructions. Please try again.';

            if (error.response?.data?.message) {
                // Use backend error message if available
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = t('invalid_request') || 'Invalid request. Please check your email.';
            } else if (error.response?.status === 404) {
                // Even if email doesn't exist, we show generic message for security
                errorMessage = t('reset_email_sent_generic') ||
                    'If the email exists, reset instructions have been sent.';
            } else if (error.response?.status === 429) {
                errorMessage = t('too_many_attempts') ||
                    'Too many attempts. Please try again later.';
            } else if (error.response?.status === 500) {
                errorMessage = t('server_error') || 'Server error. Please try again later.';
            } else if (error.message?.includes('Network Error')) {
                errorMessage = t('network_error') || 'Network error. Please check your connection.';
            }

            // Show the error message
            showToast(errorMessage, 'error');

            // Even on error, we might want to navigate to OTP screen for security
            // (Prevents email enumeration attacks by always showing "success")
            if (error.response?.status === 404) {
                // For 404 (email not found), still navigate but show generic message
                setTimeout(() => {
                    router.push({
                        pathname: '/OtpVerification',
                        params: {
                            source: 'reset-password',
                            email: email.trim().toLowerCase(),
                            isGenericFlow: 'true' // Flag for generic flow
                        },
                    });
                }, 1500);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (text: string) => {
        setEmail(text);
    };

    const handleKeyPress = (e: any) => {
        if (e.nativeEvent.key === 'Enter' && isButtonEnabled && !isLoading) {
            handleSendResetCode();
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Top Red Header with Bag Icon */}
            <View className="bg-[#C62828] h-1/3 min-h-[250px] relative">
                <View className="flex-1 items-center justify-center">
                    <Image
                        source={images.onboarding}
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
                        disabled={isLoading}
                    >
                        <ArrowLeft size={28} color="#C62828" />
                    </TouchableOpacity>

                    {/* Title & Description */}
                    <View className="items-center mt-3 mb-10">
                        <Text className="text-2xl font-bold text-black mb-3">
                            {t('reset_password') || 'Reset Password'}
                        </Text>
                        <Text className="text-gray-600 text-base items-center justify-center leading-6 text-center px-4">
                            {t('reset_password_description') ||
                                'Enter your email address and we\'ll send you an OTP code to reset your password.'}
                        </Text>
                    </View>
                </View>

                {/* Input Field */}
                <View className="mb-10">
                    <Text className="text-gray-700 text-base mb-3">
                        {t('email_address') || 'Email Address'} *
                    </Text>
                    <View className="relative">
                        <TextInput
                            className={`bg-gray-100 rounded-lg px-4 py-4 text-base border-b-2 ${!isEmailValid && email.trim() ? 'border-red-500' : 'border-[#C62828]'
                                }`}
                            placeholder={t('enter_your_email') || 'Enter your email address'}
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={handleInputChange}
                            onKeyPress={handleKeyPress}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoFocus={true}
                            editable={!isLoading}
                            selectTextOnFocus={!isLoading}
                        />

                        {!isEmailValid && email.trim() && (
                            <Text className="text-red-500 text-xs mt-1 ml-1">
                                {t('invalid_email_format') || 'Please enter a valid email address'}
                            </Text>
                        )}

                        {/* Email hint for better UX */}
                        {email.trim() && isEmailValid && (
                            <Text className="text-green-600 text-xs mt-1 ml-1">
                                ✓ {t('valid_email_format') || 'Valid email format'}
                            </Text>
                        )}
                    </View>

                    {/* Additional Info */}
                    <View className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Text className="text-blue-800 text-sm">
                            💡 {t('reset_password_tip') ||
                                'Enter the email address associated with your account. We\'ll send a 6-digit OTP code for verification.'}
                        </Text>
                    </View>
                </View>

                {/* Send Code Button */}
                <TouchableOpacity
                    className={`rounded-full py-4 items-center justify-center ${isButtonEnabled && isEmailValid && !isLoading
                            ? 'bg-[#C62828]'
                            : 'bg-gray-300'
                        }`}
                    activeOpacity={0.8}
                    onPress={handleSendResetCode}
                    disabled={!isButtonEnabled || !isEmailValid || isLoading}
                >
                    {isLoading ? (
                        <View className="flex-row items-center">
                            <ActivityIndicator color="#FFFFFF" size="small" />
                            <Text className="text-white ml-2 text-lg font-medium">
                                {t('sending') || 'Sending...'}
                            </Text>
                        </View>
                    ) : (
                        <Text
                            className={`text-lg font-medium ${isButtonEnabled && isEmailValid
                                    ? 'text-white'
                                    : 'text-gray-500'
                                }`}
                        >
                            {t('send_otp_code') || 'Send OTP Code'}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Alternative Options */}
                <View className="mt-8 pt-6 border-t border-gray-200">
                    <Text className="text-gray-600 text-center mb-4">
                        {t('remember_password') || 'Remembered your password?'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (!isLoading) {
                                router.push('/signIn');
                            }
                        }}
                        disabled={isLoading}
                    >
                        <Text className="text-[#C62828] text-center font-semibold text-base">
                            {t('back_to_login') || 'Back to Login'}
                        </Text>
                    </TouchableOpacity>

                    {/* Support Contact Info */}
                    <View className="mt-8 p-3 bg-gray-50 rounded-lg">
                        <Text className="text-gray-600 text-center text-sm">
                            {t('need_help') || 'Need help?'}{' '}
                            <Text className="text-[#C62828] font-medium">
                                {t('contact_support') || 'Contact Support'}
                            </Text>
                        </Text>
                    </View>
                </View>
            </View>

            {/* Debug/Test Button (Remove in production) */}
            {__DEV__ && (
                <TouchableOpacity
                    onPress={() => {
                        // Test with a sample email
                        setEmail('test@example.com');
                    }}
                    className="absolute bottom-4 right-4 bg-gray-800 p-2 rounded-full opacity-50"
                >
                    <Text className="text-white text-xs">Test</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default ResetPasswordForm;