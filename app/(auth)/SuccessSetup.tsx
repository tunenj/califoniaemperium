// app/(auth)/SuccessSetup.tsx - UPDATED VERSION
import images from '@/constants/images';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useSetup } from '@/context/VendorApplicationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserRole = 'vendor' | 'customer';

const SuccessSetup: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { t } = useLanguage();
    const { clearData } = useSetup();

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
    const userRole: UserRole = role === 'customer' || isCustomerParam === 'true' ? 'customer' : 'vendor';
    const isBusiness = userRole === 'vendor';

    // State to check if user has existing vendor application
    const [hasExistingApplication, setHasExistingApplication] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<string>('');
    const [isCheckingApplication, setIsCheckingApplication] = useState(true);

    // ✅ NEW: Verify token exists on mount and clear previous data
    useEffect(() => {
        const verifySession = async () => {
            try {
                console.log('🔐 SuccessSetup: Verifying session...');
                
                const storedToken = await AsyncStorage.getItem('authToken');
                
                if (!storedToken) {
                    console.error('❌ No token found in AsyncStorage on SuccessSetup mount');
                    Alert.alert(
                        t('session_expired') || 'Session Expired',
                        t('please_login_again') || 'Please login again to continue.',
                        [
                            {
                                text: t('login') || 'Login',
                                onPress: () => router.replace('/signIn'),
                            },
                        ]
                    );
                    return;
                }
                
                console.log('Session verified on SuccessSetup mount');
                
                // CRITICAL FIX: Since this is a NEW registration flow,
                // we should clear any previous vendor application data
                // This prevents showing "view_application_status" for new users
                await AsyncStorage.removeItem('vendorApplicationId');
                await AsyncStorage.removeItem('vendorApplicationStatus');
                await AsyncStorage.removeItem('hasCompletedVendorSetup');
                
                console.log('Cleared any previous vendor application data');
                
            } catch (error) {
                console.error('Error verifying session:', error);
            }
        };

        verifySession();
    }, []);

    // FIXED: Check for existing vendor application with improved logic
    useEffect(() => {
        const checkExistingApplication = async () => {
            if (isBusiness) {
                try {
                    setIsCheckingApplication(true);
                    console.log('🔍 Checking for existing vendor application...');
                    
                    const savedAppId = await AsyncStorage.getItem('vendorApplicationId');
                    const savedStatus = await AsyncStorage.getItem('vendorApplicationStatus');
                    
                    console.log('Saved App ID:', savedAppId);
                    console.log('Saved Status:', savedStatus);
                    
                    // ✅ FIX: Only set existing application if we have VALID data
                    // and the user has completed the setup process
                    const hasCompletedSetup = await AsyncStorage.getItem('hasCompletedVendorSetup');
                    
                    if (savedAppId && savedStatus && hasCompletedSetup === 'true') {
                        // Verify this is for the current user by checking email
                        const savedUserEmail = await AsyncStorage.getItem('userEmail');
                        
                        if (savedUserEmail === email) {
                            setHasExistingApplication(true);
                            setApplicationStatus(savedStatus);
                            console.log('✅ Found valid existing application for current user');
                        } else {
                            console.log('⚠️ Existing application belongs to different user');
                            console.log('Current email:', email);
                            console.log('Saved email:', savedUserEmail);
                            
                            // Clear old data
                            await AsyncStorage.removeItem('vendorApplicationId');
                            await AsyncStorage.removeItem('vendorApplicationStatus');
                            await AsyncStorage.removeItem('hasCompletedVendorSetup');
                            setHasExistingApplication(false);
                        }
                    } else {
                        console.log('❌ No valid existing application found');
                        console.log('Reason:', {
                            hasAppId: !!savedAppId,
                            hasStatus: !!savedStatus,
                            hasCompletedSetup: hasCompletedSetup === 'true',
                            isFreshRegistration: !savedAppId && !savedStatus
                        });
                        setHasExistingApplication(false);
                    }
                } catch (error) {
                    console.error('Error checking existing application:', error);
                    setHasExistingApplication(false);
                } finally {
                    setIsCheckingApplication(false);
                }
            } else {
                setIsCheckingApplication(false);
            }
        };

        checkExistingApplication();
    }, [isBusiness, email]);

    const handleBack = () => {
        router.back();
    };

    // ✅ FIXED: Always navigate to Step1 for NEW business registrations
    const handleSetupStore = async () => {
        if (isBusiness) {
            // ✅ FIX: Since this is a NEW registration flow, always go to Step1
            // Even if there's old application data, we want fresh setup
            
            // Clear any previous setup data
            clearData();

            // Verify token exists in AsyncStorage before navigation
            console.log('🔍 Verifying token before navigation to Step1...');
            
            const storedToken = await AsyncStorage.getItem('authToken');
            const storedRefresh = await AsyncStorage.getItem('refreshToken');
            
            if (!storedToken) {
                console.error('❌ No token found in AsyncStorage before Step1 navigation');
                Alert.alert(
                    t('session_expired') || 'Session Expired',
                    t('please_login_again') || 'Please login again to continue.',
                    [
                        {
                            text: t('login') || 'Login',
                            onPress: () => router.replace('/signIn'),
                        },
                    ]
                );
                return;
            }

            console.log('✅ Token verified in AsyncStorage before navigation');
            console.log('==========================================');
            console.log('NAVIGATING TO STEP 1 FOR FRESH SETUP');
            console.log('Token in AsyncStorage: EXISTS');
            console.log('Refresh token:', storedRefresh ? 'EXISTS' : 'MISSING');
            console.log('User email:', email);
            console.log('User role:', userRole);
            console.log('Is business user:', isBusiness);
            console.log('Has existing application (should be false):', hasExistingApplication);
            console.log('==========================================');

            // Save user email for future reference
            await AsyncStorage.setItem('userEmail', email);
            
            // Navigate WITHOUT tokens in params (they're in AsyncStorage)
            router.push({
                pathname: '/Setup/business-setup/step-1',
                params: {
                    email,
                    phoneNumber,
                    firstName,
                    lastName,
                    role: userRole,
                    // ✅ IMPORTANT: Mark as fresh registration
                    isFreshRegistration: 'true',
                    // ✅ NO TOKEN PARAMS - They're in AsyncStorage
                },
            });
        } else {
            // ✅ FIX: Verify token for customer profile setup too
            console.log('🔍 Verifying token before customer profile setup...');
            
            const storedToken = await AsyncStorage.getItem('authToken');
            
            if (!storedToken) {
                console.error('❌ No token found for customer profile setup');
                Alert.alert(
                    t('session_expired') || 'Session Expired',
                    t('please_login_again') || 'Please login again to continue.',
                    [
                        {
                            text: t('login') || 'Login',
                            onPress: () => router.replace('/signIn'),
                        },
                    ]
                );
                return;
            }

            console.log('✅ Token verified for customer profile setup');

            // Save user email
            await AsyncStorage.setItem('userEmail', email);

            // Navigate to customer profile setup (no tokens in params)
            router.push({
                pathname: '/Setup/profile-setup',
                params: {
                    email,
                    phoneNumber,
                    firstName,
                    lastName,
                    role: userRole,
                    // ✅ NO TOKEN PARAMS
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

    // ✅ FIXED: Always show "Set Up Store" for NEW registrations
    const getSetupButtonText = () => {
        if (!isBusiness) return t('set_up_profile');

        // ✅ CRITICAL FIX: Always show "Set Up Store" for fresh registration flow
        // This screen appears right after registration, so user is NEW
        // Even if there's old application data in AsyncStorage, ignore it
        
        if (isCheckingApplication) {
            return t('checking_status') || 'Checking...';
        }
        
        return t('set_up_store');
    };

    // ✅ FIXED: Show appropriate later button text
    const getLaterButtonText = () => {
        if (isBusiness && hasExistingApplication && applicationStatus === 'approved') {
            return t('skip_to_dashboard');
        }
        return isBusiness ? t('skip_store_setup') : t('skip_profile_setup');
    };

    // FIXED: Show appropriate role text
    const getRoleText = () => {
        const baseText = isBusiness ? t('business_account') : t('customer_account');

        if (isBusiness && hasExistingApplication && !isCheckingApplication) {
            switch (applicationStatus) {
                case 'approved':
                    return `${baseText} • ${t('approved')}`;
                case 'under_review':
                    return `${baseText} • ${t('under_review')}`;
                case 'submitted':
                    return `${baseText} • ${t('pending')}`;
                case 'rejected':
                    return `${baseText} • ${t('needs_updates')}`;
                default:
                    return baseText;
            }
        }

        return baseText;
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
                            {t('successful')}
                        </Text>
                        <Text className="text-gray-600 text-lg text-center px-4">
                            {t('account_created_successfully')}
                        </Text>
                    </View>

                    {/* Role indicator */}
                    <View className="items-center mb-8">
                        <View className="bg-gray-100 px-4 py-2 rounded-full">
                            <Text className="text-gray-700 text-sm font-medium">
                                {getRoleText()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Setup Button - Primary Button */}
                <TouchableOpacity
                    className="bg-secondary rounded-xl py-5 items-center shadow-md active:opacity-90 mb-4"
                    activeOpacity={0.8}
                    onPress={handleSetupStore}
                    disabled={isCheckingApplication}
                >
                    {isCheckingApplication ? (
                        <Text className="text-white text-lg font-semibold">
                            {t('checking_status') || 'Checking...'}
                        </Text>
                    ) : (
                        <Text className="text-white text-lg font-semibold">
                            {getSetupButtonText()}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Skip/Later Button - Secondary Button */}
                <TouchableOpacity
                    className="border border-gray-300 bg-white rounded-xl py-5 items-center mb-8"
                    activeOpacity={0.8}
                    onPress={handleLater}
                    disabled={isCheckingApplication}
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