// app/(auth)/OtpVerification.tsx - FIXED VERSION
import images from '@/constants/images';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type UserRole = 'business' | 'customer' | 'vendor';

const OtpVerification: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { t } = useLanguage();

    const getParamString = (param: any): string => (Array.isArray(param) ? param[0] || '' : param || '');

    const firstName = getParamString(params.firstName) || 'User';
    const lastName = getParamString(params.lastName) || '';
    const phoneNumber = getParamString(params.phoneNumber) || '';
    const email = getParamString(params.email) || '';
    const method = getParamString(params.method) || 'sms';
    const role = (getParamString(params.role) || 'business') as UserRole;
    const source = getParamString(params.source) || 'phone';

    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const otpInputRefs = useRef<(TextInput | null)[]>(Array(6).fill(null));

    const isEmailVerification = source === 'email' || !!email;
    const contactInfo = isEmailVerification ? email : phoneNumber;

    const handleBack = () => router.back();
    const handleLogin = () => router.push('/(auth)/signIn');

    const handleOtpChange = (value: string, index: number) => {
        if (/^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
            if (!value && index > 0) otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    // ─────────────── VERIFY OTP ───────────────
    const verifyOTPWithAPI = useCallback(async (otpCode: string): Promise<boolean> => {
        try {
            console.log('🔐 Verifying OTP code:', otpCode);

            const response = await api.post(endpoints.emailOtpVerification, { otp: otpCode });

            console.log('✅ OTP Verification Response:', response.data);

            return response.data?.success || response.data?.verified || response.data?.status === 'success';
        } catch (error: any) {
            console.error('❌ OTP verification API error:', error);

            let errorMessage = t('verification_failed') || 'Verification failed';
            if (error.response?.data?.message) errorMessage = error.response.data.message;
            else if (error.response?.status === 400) errorMessage = t('invalid_otp') || 'Invalid OTP code';
            else if (error.response?.status === 404) errorMessage = t('verification_expired') || 'Verification code expired';
            else if (error.message) errorMessage = error.message;

            Alert.alert(t('verification_failed') || 'Verification Failed', errorMessage);
            throw error;
        }
    }, [t]);

    // ─────────────── RESEND OTP ───────────────
    const resendOTP = useCallback(async (): Promise<boolean> => {
        try {
            setIsResending(true);

            const response = await api.post(endpoints.resendEmailOtp, { email: email.trim() });

            console.log('🔄 Resend OTP Response:', response.data);

            if (__DEV__) {
                const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
                console.log('========== DEBUG OTP ==========');
                console.log('Email:', email.trim());
                console.log('NEW OTP Code:', mockOTP);
                console.log('Valid for: 10 minutes');
                console.log('==================================');
            }

            const message = response.data?.message || t('otp_resent_successfully') || 'OTP resent successfully';
            Alert.alert(t('success') || 'Success', message);

            return true;
        } catch (error: any) {
            console.error('❌ Resend OTP error:', error);

            let errorMessage = t('failed_to_resend_otp') || 'Failed to resend OTP';
            if (error.response?.data?.message) errorMessage = error.response.data.message;
            else if (error.response?.status === 429) errorMessage = t('too_many_requests_try_later') || 'Too many requests, try later';
            else if (error.response?.status === 404) errorMessage = t('email_not_found') || 'Email not found';

            Alert.alert(t('error') || 'Error', errorMessage);
            return false;
        } finally {
            setIsResending(false);
        }
    }, [email, t]);

    // ─────────────── HANDLE VERIFY BUTTON ───────────────
    const handleVerify = useCallback(async () => {
        const enteredCode = otp.join('');
        if (enteredCode.length !== 6) {
            Alert.alert(
                t('invalid_otp') || 'Invalid OTP', 
                t('enter_full_6_digit_code') || 'Please enter the full 6-digit code'
            );
            return;
        }

        setIsVerifying(true);

        try {
            const isVerified = await verifyOTPWithAPI(enteredCode);
            if (!isVerified) {
                Alert.alert(
                    t('verification_failed') || 'Verification Failed', 
                    t('please_try_again') || 'Please try again'
                );
                return;
            }

            console.log('✅ OTP verified successfully');

            // ✅ FIX: Verify token exists in AsyncStorage before navigation
            const storedToken = await AsyncStorage.getItem('authToken');
            
            if (!storedToken) {
                console.error('❌ No token found in AsyncStorage after OTP verification');
                Alert.alert(
                    t('session_error') || 'Session Error',
                    t('authentication_failed') || 'Authentication failed. Please try registering again.',
                    [
                        {
                            text: t('register') || 'Register',
                            onPress: () => router.replace('/signUp'),
                        },
                    ]
                );
                return;
            }

            console.log('✅ Token verified in AsyncStorage');
            console.log('==========================================');
            console.log('NAVIGATING TO SUCCESS SETUP');
            console.log('Token in AsyncStorage: EXISTS');
            console.log('User role:', role);
            console.log('Email:', email);
            console.log('==========================================');
            
            const successParams: any = {
                role,
                firstName,
                lastName,
                email,
                phoneNumber: phoneNumber || '',
                isCustomer: role === 'customer' ? 'true' : 'false',
            };

            // ✅ FIX: Don't pass tokens via params - they're already in AsyncStorage
            // Tokens should ONLY live in AsyncStorage, not in navigation params

            if (source === 'reset-password') {
                router.replace({ pathname: '/CreatePassword', params: { mode: 'reset' } });
                return;
            }

            if (isEmailVerification) {
                router.replace({ 
                    pathname: '/SuccessSetup', 
                    params: successParams 
                });
                return;
            }

            router.replace({
                pathname: '/(auth)/CreatePassword',
                params: { 
                    mode: 'create', 
                    firstName, 
                    lastName, 
                    phoneNumber, 
                    method, 
                    role, 
                    isCustomer: role === 'customer' ? 'true' : 'false',
                },
            });
        } catch (error) {
            console.error('❌ Verification process error:', error);
        } finally {
            setIsVerifying(false);
        }
    }, [
        otp, source, firstName, lastName, phoneNumber, email, method, role, 
        isEmailVerification, router, t, verifyOTPWithAPI
    ]);

    useEffect(() => {
        if (otp.every(digit => digit !== '')) handleVerify();
    }, [otp, handleVerify]);

    const getDisplayContact = () => {
        if (!contactInfo) return '';
        if (isEmailVerification) {
            const [localPart, domain] = contactInfo.split('@');
            if (localPart && domain) return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
            return contactInfo;
        }
        if (contactInfo.length > 7) return `${contactInfo.slice(0, 3)}******${contactInfo.slice(-3)}`;
        return contactInfo;
    };

    const getVerificationTitle = () => {
        if (source === 'reset-password') return t('reset_your_password') || 'Reset Your Password';
        if (isEmailVerification) return t('verify_your_email') || 'Verify Your Email';
        return t('verify_your_phone_number') || 'Verify Your Phone Number';
    };

    const getVerificationMessage = () => {
        if (source === 'reset-password') {
            const displayContact = getDisplayContact();
            const message = t('enter_6_digit_code_sent_to') || 'Enter the 6-digit code sent to';
            return `${message} ${displayContact}`;
        }
        if (isEmailVerification) return t('enter_6_digit_code_sent_to_email') || 'Enter the 6-digit code sent to your email';
        if (method === 'whatsapp') return t('enter_6_digit_code_sent_via_whatsapp') || 'Enter the 6-digit code sent via WhatsApp';
        return t('enter_6_digit_code_sent_via_sms') || 'Enter the 6-digit code sent via SMS';
    };

    return (
        <View className="flex-1 bg-white">
            <View className="bg-secondary h-1/3 min-h-[250px] relative">
                <View className="flex-1 items-center justify-center">
                    <Image source={images.onboarding} className="w-16 h-16" resizeMode="contain" />
                </View>
            </View>

            <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-10">
                <View className="relative mb-8">
                    <TouchableOpacity 
                        className="absolute top-0 left-0 z-10" 
                        onPress={handleBack} 
                        disabled={isVerifying || isResending}
                    >
                        <Ionicons name="arrow-back" size={28} color="#C62828" />
                    </TouchableOpacity>

                    <Text className="text-2xl font-bold text-center text-black mb-2">
                        {getVerificationTitle()}
                    </Text>
                    <Text className="text-base text-gray-500 text-center mb-6 px-4">
                        {firstName !== 'User' ? `${t('hi') || 'Hi'} ${firstName}! ` : ''}{getVerificationMessage()}
                    </Text>
                    <Text className="text-lg font-semibold text-center text-gray-800 mb-4">
                        {getDisplayContact()}
                    </Text>
                </View>

                <View className="flex-row justify-center gap-3 mb-10">
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                otpInputRefs.current[index] = ref;
                            }}
                            className={`w-14 h-14 bg-gray-50 border rounded-lg text-center text-2xl font-bold ${
                                isVerifying ? 'border-gray-200' : 'border-gray-300'
                            }`}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            autoFocus={index === 0 && !isVerifying}
                            editable={!isVerifying}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {isVerifying && (
                    <View className="items-center mb-4">
                        <ActivityIndicator size="large" color="#C62828" />
                        <Text className="text-gray-500 mt-2">
                            {t('verifying') || 'Verifying'}...
                        </Text>
                    </View>
                )}

                <View className="items-center mb-8">
                    <Text className="text-gray-500 text-sm mb-2">
                        {t('didnt_receive_code') || "Didn't receive a code?"}
                    </Text>
                    <TouchableOpacity onPress={resendOTP} disabled={isVerifying || isResending}>
                        {isResending ? (
                            <ActivityIndicator size="small" color="#C62828" />
                        ) : (
                            <Text className={`text-secondary font-semibold text-sm ${isVerifying || isResending ? 'opacity-50' : ''}`}>
                                {t('resend_code') || 'Resend Code'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    className={`bg-secondary rounded-xl py-4 items-center shadow-lg ${isVerifying ? 'opacity-70' : ''}`} 
                    onPress={handleVerify} 
                    disabled={isVerifying || isResending}
                >
                    <Text className="text-white text-lg font-semibold">
                        {isVerifying ? t('verifying') || 'Verifying' : t('verify') || 'Verify'}
                    </Text>
                </TouchableOpacity>

                <View className="items-center mt-8">
                    <TouchableOpacity onPress={handleLogin} disabled={isVerifying || isResending}>
                        <Text className="text-gray-600 text-base text-center">
                            {t('already_have_account') || 'Already have an account?'}{' '}
                            <Text className="text-secondary font-semibold">
                                {t('log_in') || 'Log In'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default OtpVerification;