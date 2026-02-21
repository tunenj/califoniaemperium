import images from '@/constants/images';
import React, { useState, useEffect, useRef } from 'react';
import { Image, Text, TouchableOpacity, View, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from "@/constants/color";
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import TermsModal from '@/components/TermsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

WebBrowser.maybeCompleteAuthSession();

const BusinessRegisterScreen: React.FC = () => {
  const [isCustomer, setIsCustomer] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);
  const router = useRouter();
  const { t } = useLanguage();

  // Use the scheme from app.json
  const scheme = 'califoniaemperium';

  // Create the redirect URI
  const redirectUri = makeRedirectUri({
    scheme: scheme,
    path: 'auth/google',
  });

  console.log('Platform:', Platform.OS);
  console.log('Using scheme:', scheme);
  console.log('Redirect URI:', redirectUri);
  console.log('Expo Project: @tunenj/califoniaemperium');

  // Google Sign-In configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    // For Android - use your Android client ID
    androidClientId: Platform.OS === 'android' 
      ? '984067143067-1qv8bsgpbmhqiid8oe65umo7dooanks9.apps.googleusercontent.com' 
      : undefined,
    
    // For iOS - use your iOS client ID (different from Android)
    iosClientId: Platform.OS === 'ios' 
      ? '984067143067-1qv8bsgpbmhqiid8oe65umo7dooanks9.apps.googleusercontent.com' 
      : undefined,
    
    // For Expo Go (development)
    webClientId: '984067143067-1qv8bsgpbmhqiid8oe65umo7dooanks9.apps.googleusercontent.com',
    
    scopes: ['profile', 'email'],
    redirectUri,
    responseType: 'code',
    extraParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  });

  // Rest of your component remains the same...
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === 'success') {
        const { params, authentication } = response;
        
        console.log('Google Success Response:', {
          params,
          authentication: authentication ? 'Has authentication' : 'No authentication',
        });

        if (authentication?.accessToken) {
          await handleGoogleSignInWithToken(authentication.accessToken);
        } else if (params?.code) {
          await handleGoogleSignInWithCode(params.code);
        }
      } else if (response?.type === 'error') {
        console.error('Google Sign-In error:', response.error);
        showErrorToast(
          'Google Sign-In Failed',
          response.error?.message || 'Authentication failed'
        );
      } else if (response?.type === 'cancel') {
        console.log('Google Sign-In cancelled');
        if (isMounted.current) setIsLoading(false);
      }
    };

    if (response) {
      handleResponse();
    }
  }, [response]);

  const handleSignIn = () => {
    router.push('/signIn');
  };

  const handleEmailSignUp = () => {
    if (!isCustomer) {
      setPendingAction('email');
      setTermsModalVisible(true);
    } else {
      router.push('/RegisterForm/EmailSignUp');
    }
  };

  const handleGoogleSignUp = () => {
    if (!isCustomer) {
      setPendingAction('google');
      setTermsModalVisible(true);
    } else {
      initiateGoogleSignIn();
    }
  };

  const initiateGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      if (!request) {
        console.log('Auth request not ready yet');
        showErrorToast(
          'Not Ready',
          'Authentication is initializing. Please try again.'
        );
        return;
      }

      console.log('Initiating Google Sign-In for:', Platform.OS);
      const result = await promptAsync();
      console.log('Prompt result:', result);
      
    } catch (error) {
      console.error('Google Sign-In error:', error);
      showErrorToast(
        'Google Sign-In Failed',
        'Failed to initiate Google Sign-In. Please try again.'
      );
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleGoogleSignInWithToken = async (accessToken: string) => {
    setIsLoading(true);

    try {
      console.log('Sending access token to backend:', endpoints.googleSignUp);
      
      const response = await api.post(endpoints.googleSignUp, {
        access_token: accessToken,
        role: isCustomer ? 'customer' : 'vendor',
      });

      const responseData = response.data;
      console.log('Backend response:', responseData);

      if (responseData && responseData.success) {
        const tokens =
          responseData.data?.tokens ||
          responseData.tokens ||
          responseData.data;

        const accessToken = tokens?.access || tokens?.access_token;
        const refreshToken = tokens?.refresh || tokens?.refresh_token;

        if (!accessToken) {
          showErrorToast(
            t('login_error') || 'Login Error',
            'Authentication succeeded but no token received.'
          );
          return;
        }

        const accessTokenStr = String(accessToken).trim();
        const refreshTokenStr = String(refreshToken || '').trim();

        if (!accessTokenStr || accessTokenStr.length < 10) {
          showErrorToast(
            t('login_error') || 'Login Error',
            'Invalid authentication token received.'
          );
          return;
        }

        try {
          await AsyncStorage.setItem('authToken', accessTokenStr);

          if (refreshTokenStr) {
            await AsyncStorage.setItem('refreshToken', refreshTokenStr);
          }

          showSuccessToast(
            t('login_successful') || 'Login Successful',
            responseData.message || 'Welcome!'
          );

          setTimeout(() => {
            if (isCustomer) {
              router.replace('/(customer)/main');
            } else {
              router.replace('/(vendor)/dashboard');
            }
          }, 1500);

        } catch (storageError) {
          console.error('Storage error during token save:', storageError);
          showErrorToast(
            t('storage_error') || 'Storage Error',
            'Failed to save your session. Please try again.'
          );
        }
      } else {
        showErrorToast(
          t('login_failed') || 'Login Failed',
          responseData.message || 'Google Sign-In failed'
        );
      }
    } catch (error: any) {
      console.error('Google Sign-In API error:', error);

      let errorMessage = 'Failed to authenticate with Google. Please try again.';

      if (error.response?.status === 400) {
        if (error.response.data?.error?.details) {
          errorMessage = String(error.response.data.error.details);
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      showErrorToast(
        t('login_failed') || 'Login Failed',
        errorMessage
      );
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleGoogleSignInWithCode = async (code: string) => {
    setIsLoading(true);

    try {
      console.log('Sending authorization code to backend');
      
      const response = await api.post(endpoints.googleSignUp, {
        code: code,
        role: isCustomer ? 'customer' : 'vendor',
        redirect_uri: redirectUri,
      });

      const responseData = response.data;
      console.log('Backend response:', responseData);

      if (responseData && responseData.success) {
        const tokens =
          responseData.data?.tokens ||
          responseData.tokens ||
          responseData.data;

        const accessToken = tokens?.access || tokens?.access_token;
        const refreshToken = tokens?.refresh || tokens?.refresh_token;

        if (!accessToken) {
          showErrorToast(
            t('login_error') || 'Login Error',
            'Authentication succeeded but no token received.'
          );
          return;
        }

        const accessTokenStr = String(accessToken).trim();
        const refreshTokenStr = String(refreshToken || '').trim();

        if (!accessTokenStr || accessTokenStr.length < 10) {
          showErrorToast(
            t('login_error') || 'Login Error',
            'Invalid authentication token received.'
          );
          return;
        }

        try {
          await AsyncStorage.setItem('authToken', accessTokenStr);

          if (refreshTokenStr) {
            await AsyncStorage.setItem('refreshToken', refreshTokenStr);
          }

          showSuccessToast(
            t('login_successful') || 'Login Successful',
            responseData.message || 'Welcome!'
          );

          setTimeout(() => {
            if (isCustomer) {
              router.replace('/(customer)/main');
            } else {
              router.replace('/(vendor)/dashboard');
            }
          }, 1500);

        } catch (storageError) {
          console.error('Storage error during token save:', storageError);
          showErrorToast(
            t('storage_error') || 'Storage Error',
            'Failed to save your session. Please try again.'
          );
        }
      } else {
        showErrorToast(
          t('login_failed') || 'Login Failed',
          responseData.message || 'Google Sign-In failed'
        );
      }
    } catch (error: any) {
      console.error('Google Sign-In API error:', error);
      showErrorToast(
        t('login_failed') || 'Login Failed',
        error.response?.data?.message || 'Failed to authenticate with Google'
      );
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleTermsAccept = async () => {
    try {
      await AsyncStorage.setItem('vendor_terms_accepted', 'true');
      await AsyncStorage.setItem('vendor_terms_version', '1.0');
      await AsyncStorage.setItem('vendor_terms_accepted_date', new Date().toISOString());

      setTermsModalVisible(false);

      if (pendingAction === 'email') {
        router.push('/RegisterForm/EmailSignUp');
      } else if (pendingAction === 'google') {
        initiateGoogleSignIn();
      }

      setPendingAction(null);
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
      Alert.alert('Error', 'Failed to save your acceptance. Please try again.');
    }
  };

  const handleTermsClose = () => {
    setTermsModalVisible(false);
    setPendingAction(null);
  };

  const showSuccessToast = (title: string, message: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
    });
  };

  const showErrorToast = (title: string, message: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
    });
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
              {isCustomer ? t('register_as_customer') : t('register_as_business')}
            </Text>

            <TouchableOpacity
              className="flex-row"
              onPress={() => setIsCustomer(!isCustomer)}
            >
              <Image source={images.switchIcon} className="w-6 h-6 mr-2" />
              <Text className="text-lg text-gray-400 font-medium underline">
                {isCustomer ? t('switch_to_business') : t('switch_to_customer')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Loading Overlay */}
          {isLoading && (
            <View className="absolute inset-0 bg-white/80 z-50 items-center justify-center">
              <ActivityIndicator size="large" color={colors.darkRed} />
              <Text className="mt-2 text-gray-600">Processing...</Text>
            </View>
          )}

          {/* Terms Notice for Business */}
          {!isCustomer && (
            <View className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Text className="text-xs text-blue-700 text-center">
                By proceeding, you agree to our{' '}
                <Text className="font-bold">Vendor Agreement & Policy Statement</Text>
                {' '}which includes dropshipping policies, commission rates, and payout terms.
              </Text>
            </View>
          )}

          {/* Email Sign-up */}
          <TouchableOpacity
            className="flex-row items-center mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
            onPress={handleEmailSignUp}
            disabled={isLoading}
          >
            <Ionicons name="mail" color={colors.darkRed} size={24} style={{ marginRight: 16 }} />
            <Text className="text-lg text-gray-900 flex-1 pl-14">
              {t('email_and_password')}
            </Text>
          </TouchableOpacity>

          {/* Google Sign-up */}
          <TouchableOpacity
            className="flex-row items-center mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
            onPress={handleGoogleSignUp}
            disabled={isLoading}
          >
            <Image source={images.googleIcon} className="w-6 h-6 mr-4" />
            <Text className="text-lg text-gray-900 flex-1 pl-14">
              {t('sign_up_with_google')}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center">
            <TouchableOpacity onPress={handleSignIn} disabled={isLoading}>
              <Text className="text-gray-600 text-lg">
                {t('already_have_account')}{' '}
                <Text className="text-accent">{t('log_in')}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Vendor Agreement Link */}
          {!isCustomer && (
            <View className="mt-6 items-center">
              <TouchableOpacity onPress={() => {
                setPendingAction('view');
                setTermsModalVisible(true);
              }} disabled={isLoading}>
                <Text className="text-sm text-gray-500 underline">
                  Read the full Vendor Agreement
                </Text>
              </TouchableOpacity>
              <Text className="text-xs text-gray-400 mt-2">
                Version 1.0 | Effective Date: 02/15/26
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Terms Modal */}
      <TermsModal
        visible={termsModalVisible}
        onClose={handleTermsClose}
        onAccept={handleTermsAccept}
        type={isCustomer ? 'customer' : 'vendor'}
      />

      {/* Toast component */}
      <Toast />
    </View>
  );
};

export default BusinessRegisterScreen;