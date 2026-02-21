// app/(customer)/profile/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useBiometric } from '@/context/BiometricContext'; // ✅ ADD THIS IMPORT
import { BiometricSettings } from '@/components/BiometricSettings'; // ✅ ADD THIS IMPORT
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

interface UserDetails {
  id: string;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_image: string | null;
  role: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  auth_provider: string;
  has_password: boolean;
  date_joined: string;
  last_login: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { 
    isBiometricAvailable, 
    biometricEnabled,
    toggleBiometricSetting,
    loading: biometricLoading 
  } = useBiometric(); // ✅ ADD BIOMETRIC HOOK

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ No manual token read — api instance already has authToken in headers
  const fetchUserDetails = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponse<UserDetails>>(
        endpoints.getUserDetails
      );

      if (response.data.success) {
        const userData = response.data.data;
        setUserDetails(userData);
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
      } else {
        setError(response.data.message || 'Failed to load user details');
      }
    } catch (error: any) {
      console.error('❌ Error fetching user details:', error);

      if (error.response?.status === 401) {
        await logout();
        router.replace('/(auth)/signIn');
        return;
      }

      setError(error.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, logout, router]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchUserDetails();
      }
    }, [isAuthenticated, fetchUserDetails])
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDetails();
    }
  }, [isAuthenticated, fetchUserDetails]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ No manual token read — api instance handles auth
  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setUpdating(true);

    try {
      const response = await api.patch<ApiResponse<UserDetails>>(
        endpoints.updateUserDetails,
        {
          first_name: firstName,
          last_name: lastName,
        }
      );

      if (response.data.success) {
        setUserDetails(response.data.data);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);

      if (error.response?.status === 401) {
        await logout();
        router.replace('/(auth)/signIn');
        return;
      }

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    if (userDetails) {
      setFirstName(userDetails.first_name || '');
      setLastName(userDetails.last_name || '');
    }
    setIsEditing(false);
    setErrors({});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = () => {
    if (userDetails?.full_name) {
      const names = userDetails.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return 'U';
  };

  const formatRole = (role: string | undefined): string => {
    if (!role) return 'Customer';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Handle biometric toggle with confirmation
  const handleBiometricToggle = async () => {
    if (biometricLoading) return;
    
    Alert.alert(
      biometricEnabled ? 'Disable Biometric?' : 'Enable Biometric?',
      biometricEnabled 
        ? 'Are you sure you want to disable biometric login? You will need to use your password to login.'
        : 'Enable biometric login to quickly sign in with your fingerprint or face.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: biometricEnabled ? 'Disable' : 'Enable',
          style: biometricEnabled ? 'destructive' : 'default',
          onPress: toggleBiometricSetting
        }
      ]
    );
  };

  // ✅ Wait for auth context to finish before rendering
  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
        <MaterialIcons name="lock" size={60} color="#9ca3af" />
        <Text className="text-xl font-bold text-gray-900 mt-4">Not Logged In</Text>
        <Text className="text-gray-500 text-center mt-2">
          Please log in to view your profile
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signIn')}
          className="mt-6 bg-red-600 px-8 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading && !userDetails) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error && !userDetails) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-6 pt-7">
        <MaterialIcons name="error-outline" size={60} color="#ef4444" />
        <Text className="text-xl font-bold text-gray-900 mt-4">Error</Text>
        <Text className="text-gray-500 text-center mt-2">{error}</Text>
        <TouchableOpacity
          onPress={fetchUserDetails}
          className="mt-6 bg-red-600 px-8 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'My Profile',
          headerBackVisible: false,
          // ✅ inline styles — NativeWind doesn't work inside Stack.Screen options
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push('/(customer)');
                }
              }}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={26} color="#111827" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () =>
            !isEditing ? (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={{ marginRight: 16 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="edit-2" size={20} color="#2563eb" />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

          {/* Profile Header */}
          <View className="items-center mt-6 mb-8">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
              {userDetails?.profile_image ? (
                <Image
                  source={{ uri: userDetails.profile_image }}
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-3xl font-bold text-blue-600">
                  {getInitials()}
                </Text>
              )}
            </View>

            {!isEditing && (
              <>
                <Text className="text-2xl font-bold text-gray-900">
                  {userDetails?.full_name || 'User'}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {formatRole(userDetails?.role)}
                </Text>
              </>
            )}
          </View>

          {/* Personal Information */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </Text>

            {/* First Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                First Name <Text className="text-red-500">*</Text>
              </Text>
              {isEditing ? (
                <>
                  <TextInput
                    className={`border rounded-xl px-4 py-3 text-gray-900 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your first name"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (errors.firstName) setErrors({ ...errors, firstName: '' });
                    }}
                    editable={!updating}
                  />
                  {errors.firstName && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </Text>
                  )}
                </>
              ) : (
                <Text className="text-gray-900 text-base px-2 py-3">
                  {userDetails?.first_name || 'Not set'}
                </Text>
              )}
            </View>

            {/* Last Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Last Name <Text className="text-red-500">*</Text>
              </Text>
              {isEditing ? (
                <>
                  <TextInput
                    className={`border rounded-xl px-4 py-3 text-gray-900 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your last name"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (errors.lastName) setErrors({ ...errors, lastName: '' });
                    }}
                    editable={!updating}
                  />
                  {errors.lastName && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </Text>
                  )}
                </>
              ) : (
                <Text className="text-gray-900 text-base px-2 py-3">
                  {userDetails?.last_name || 'Not set'}
                </Text>
              )}
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Email Address
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-900 text-base px-2 py-3 flex-1">
                  {userDetails?.email}
                </Text>
                {userDetails?.is_email_verified ? (
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-green-700 text-xs font-medium">Verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity className="bg-yellow-100 px-2 py-1 rounded-full">
                    <Text className="text-yellow-700 text-xs font-medium">Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-900 text-base px-2 py-3 flex-1">
                  {userDetails?.phone || 'Not provided'}
                </Text>
                {userDetails?.is_phone_verified ? (
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-green-700 text-xs font-medium">Verified</Text>
                  </View>
                ) : userDetails?.phone ? (
                  <TouchableOpacity className="bg-yellow-100 px-2 py-1 rounded-full">
                    <Text className="text-yellow-700 text-xs font-medium">Verify</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Auth Provider */}
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Account Type
              </Text>
              <View className="flex-row items-center">
                <View className="bg-gray-100 px-3 py-2 rounded-full">
                  <Text className="text-gray-700 text-xs font-medium capitalize">
                    {userDetails?.auth_provider}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ✅ Biometric Settings - Add this section */}
          {isBiometricAvailable && (
            <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <Ionicons 
                  name={Platform.OS === 'ios' ? 'ios-finger-print' : 'md-finger-print'} 
                  size={24} 
                  color="#3B82F6" 
                />
                <Text className="text-lg font-semibold text-gray-900 ml-3">
                  Security & Login
                </Text>
              </View>

              {/* Biometric toggle */}
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">
                    {Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Fingerprint Login'}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Use biometrics to quickly sign in to your account
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleBiometricToggle}
                  disabled={biometricLoading}
                  className={`px-4 py-2 rounded-full ${
                    biometricEnabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  {biometricLoading ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <Text className={`font-semibold ${
                      biometricEnabled ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {biometricEnabled ? 'On' : 'Off'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Test button - only shown when enabled */}
              {biometricEnabled && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Test Biometric',
                      'This would trigger biometric authentication. In production, this would log you in.',
                      [{ text: 'OK' }]
                    );
                  }}
                  className="mt-4 bg-blue-50 py-3 rounded-lg flex-row items-center justify-center"
                >
                  <Ionicons 
                    name={Platform.OS === 'ios' ? 'ios-finger-print' : 'md-finger-print'} 
                    size={18} 
                    color="#3B82F6" 
                  />
                  <Text className="ml-2 text-blue-600 font-medium">
                    Test Biometric Login
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Account Information */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </Text>

            <View className="mb-3">
              <Text className="text-sm text-gray-500">Member Since</Text>
              <Text className="text-gray-900 text-base">
                {userDetails ? formatDate(userDetails.date_joined) : 'N/A'}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-sm text-gray-500">Last Login</Text>
              <Text className="text-gray-900 text-base">
                {userDetails ? formatDate(userDetails.last_login) : 'N/A'}
              </Text>
            </View>

            <View>
              <Text className="text-sm text-gray-500">User ID</Text>
              <Text className="text-gray-600 text-xs font-mono">
                {userDetails?.id}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing ? (
            <View className="flex-row space-x-3 mb-8">
              <TouchableOpacity
                onPress={handleCancelEdit}
                disabled={updating}
                className="flex-1 border border-gray-300 py-4 rounded-xl items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={updating}
                className={`flex-1 py-4 rounded-xl items-center ${
                  updating ? 'bg-gray-400' : 'bg-blue-600'
                }`}
              >
                {updating ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold ml-2">Saving...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold">Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="bg-red-600 py-4 rounded-xl items-center mb-8"
            >
              <Text className="text-white font-semibold text-lg">Edit Profile</Text>
            </TouchableOpacity>
          )}

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ✅ StyleSheet for header — NativeWind className doesn't work inside Stack.Screen options
const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 2,
  },
});