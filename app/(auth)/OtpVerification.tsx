// app/(auth)/OtpVerification.tsx
import images from '@/constants/images';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

type UserRole = 'business' | 'customer';

const OtpVerification: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Helper function to get string value from params
    const getParamString = (param: any): string => {
        if (!param) return '';
        return Array.isArray(param) ? param[0] || '' : param;
    };

    // Extract passed data
    const firstName = getParamString(params.firstName) || 'User';
    const lastName = getParamString(params.lastName) || '';
    const phoneNumber = getParamString(params.phoneNumber) || '';
    const email = getParamString(params.email) || '';
    const method = getParamString(params.method) || 'sms';
    const role = (getParamString(params.role) || 'business') as UserRole;
    const source = getParamString(params.source) || 'phone';
    
    // Parse isCustomer from old param or use role
    const isCustomerParam = getParamString(params.isCustomer);

    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const otpInputRefs = useRef<(TextInput | null)[]>(Array(6).fill(null));

    // Determine verification method and contact info
    const isEmailVerification = source === 'email' || !!email;
    const contactInfo = isEmailVerification ? email : phoneNumber;

    const handleBack = () => {
        router.back();
    };

    const handleLogin = () => {
        router.push('/(auth)/signIn');
    };

    const handleOtpChange = (value: string, index: number) => {
        if (/^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Auto-focus next input
            if (value && index < 5) {
                otpInputRefs.current[index + 1]?.focus();
            }

            // Auto-focus previous on delete
            if (!value && index > 0) {
                otpInputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = useCallback(async () => {
        const enteredCode = otp.join('');

        if (enteredCode.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter the full 6-digit code.');
            return;
        }

        setIsVerifying(true);

        try {
            console.log('OTP Verified:', enteredCode);
            console.log('Source:', source);
            console.log('Role:', role);
            console.log('Email verification:', isEmailVerification);

            // Simulate API verification (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // ✅ PASSWORD RESET FLOW - Navigate to CreatePassword with reset mode
            if (source === 'reset-password') {
                router.replace({
                    pathname: '/(auth)/CreatePassword',
                    params: { 
                        mode: 'reset'
                    }
                });
                return;
            }

            // EMAIL VERIFICATION FLOW - Navigate to SuccessSetup
            if (isEmailVerification) {
                router.replace({
                    pathname: '/(auth)/SuccessSetup',
                    params: {
                        role,
                        firstName,
                        lastName,
                        email,
                        phoneNumber: phoneNumber || '',
                        isCustomer: role === 'customer' ? 'true' : 'false',
                    },
                });
                return;
            }

            // ✅ PHONE VERIFICATION FLOW - Navigate to CreatePassword
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
            console.error('Verification error:', error);
            Alert.alert('Verification Failed', 'Please try again.');
        } finally {
            setIsVerifying(false);
        }
    }, [otp, source, firstName, lastName, phoneNumber, email, method, role, isEmailVerification, router]);

    // Auto-submit when all digits are filled
    useEffect(() => {
        if (otp.every(digit => digit !== '')) {
            handleVerify();
        }
    }, [otp, handleVerify]);

    // Format contact info for display (mask email/phone for privacy)
    const getDisplayContact = () => {
        if (!contactInfo) return '';
        
        if (isEmailVerification) {
            const [localPart, domain] = contactInfo.split('@');
            if (localPart && domain) {
                const firstChar = localPart[0];
                const lastChar = localPart[localPart.length - 1];
                return `${firstChar}***${lastChar}@${domain}`;
            }
            return contactInfo;
        } else {
            if (contactInfo.length > 7) {
                return `${contactInfo.slice(0, 3)}******${contactInfo.slice(-3)}`;
            }
            return contactInfo;
        }
    };

    // Get appropriate title and message
    const getVerificationTitle = () => {
        if (source === 'reset-password') {
            return 'Reset your password';
        }
        if (isEmailVerification) {
            return 'Verify your email';
        }
        return 'Verify your phone number';
    };

    const getVerificationMessage = () => {
        const displayContact = getDisplayContact();
        
        if (source === 'reset-password') {
            return `Enter the 6-digit code sent to ${displayContact}`;
        }
        
        if (isEmailVerification) {
            return `Enter the 6-digit code sent to your email`;
        }
        
        if (method === 'whatsapp') {
            return `Enter the 6-digit code sent via WhatsApp`;
        }
        
        return `Enter the 6-digit code sent via SMS`;
    };

    // Get welcome name for display
    const getWelcomeName = () => {
        if (firstName === 'User') return '';
        return `Hi ${firstName}! `;
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
                        disabled={isVerifying}
                    >
                        <ArrowLeft size={28} color="#C62828" />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text className="text-2xl font-bold text-center text-black mb-2">
                        {getVerificationTitle()}
                    </Text>
                    <Text className="text-base text-gray-500 text-center mb-6 px-4">
                        {getWelcomeName()}{getVerificationMessage()}
                    </Text>
                    
                    {/* Contact Info Display */}
                    <Text className="text-lg font-semibold text-center text-gray-800 mb-4">
                        {getDisplayContact()}
                    </Text>
                </View>

                {/* OTP Input Boxes */}
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

                {/* Resend Code Section */}
                <View className="items-center mb-8">
                    <Text className="text-gray-500 text-sm mb-2">
                        Didn&apos;t receive the code?
                    </Text>
                    <TouchableOpacity disabled={isVerifying}>
                        <Text className={`text-secondary font-semibold text-sm ${
                            isVerifying ? 'opacity-50' : ''
                        }`}>
                            Resend code
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                    className={`bg-secondary rounded-xl py-4 items-center shadow-lg ${
                        isVerifying ? 'opacity-70' : ''
                    }`}
                    onPress={handleVerify}
                    disabled={isVerifying}
                >
                    <Text className="text-white text-lg font-semibold">
                        {isVerifying ? 'Verifying...' : 'Verify'}
                    </Text>
                </TouchableOpacity>

                {/* Login Link */}
                <View className="items-center mt-8">
                    <TouchableOpacity onPress={handleLogin} disabled={isVerifying}>
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

export default OtpVerification;