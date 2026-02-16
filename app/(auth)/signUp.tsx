import images from '@/constants/images';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from "@/constants/color";
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import TermsModal from '@/components/TermsModal'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const BusinessRegisterScreen: React.FC = () => {
  const [isCustomer, setIsCustomer] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSignIn = () => {
    router.push('/signIn');
  };

  const handleEmailSignUp = () => {
    // Show terms modal for business registration
    if (!isCustomer) {
      setPendingAction('email');
      setTermsModalVisible(true);
    } else {
      // For customer, just navigate (or show customer terms)
      router.push('/RegisterForm/EmailSignUp');
    }
  };

  const handleGoogleSignUp = () => {
    if (!isCustomer) {
      setPendingAction('google');
      setTermsModalVisible(true);
    } else {
      // Handle Google sign up for customer
      Alert.alert('Info', 'Google sign up for customers');
    }
  };

  const handleTermsAccept = async () => {
    try {
      // Store that user has accepted terms
      await AsyncStorage.setItem('vendor_terms_accepted', 'true');
      await AsyncStorage.setItem('vendor_terms_version', '1.0');
      await AsyncStorage.setItem('vendor_terms_accepted_date', new Date().toISOString());
      
      // Close modal
      setTermsModalVisible(false);
      
      // Proceed with the pending action
      if (pendingAction === 'email') {
        router.push('/RegisterForm/EmailSignUp');
      } else if (pendingAction === 'google') {
        // Handle Google sign up
        Alert.alert('Info', 'Google sign up for vendors');
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
          >
            <Image source={images.googleIcon} className="w-6 h-6 mr-4" />
            <Text className="text-lg text-gray-900 flex-1 pl-14">
              {t('sign_up_with_google')}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center">
            <TouchableOpacity onPress={handleSignIn}>
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
              }}>
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
    </View>
  );
};

export default BusinessRegisterScreen;