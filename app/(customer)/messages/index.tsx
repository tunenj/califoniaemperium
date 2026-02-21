// app/(customer)/messages/index.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import supportService from '@/service/supportService';

type MessageType = 'support' | 'order' | 'product' | 'general';

interface MessageForm {
  name: string;
  email: string;
  message: string;
  order_number?: string;
  phone?: string;
  type: MessageType;
}

const messageTypes = [
  { id: 'general', label: 'General Inquiry', icon: 'help-outline' },
  { id: 'support', label: 'Technical Support', icon: 'build-outline' },
  { id: 'order', label: 'Order Issue', icon: 'cart-outline' },
  { id: 'product', label: 'Product Question', icon: 'cube-outline' },
];

export default function MessagesScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  const [formData, setFormData] = useState<MessageForm>({
    name: '',
    email: '',
    message: '',
    order_number: '',
    phone: '',
    type: 'general',
  });

  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<MessageType>('general');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Please provide more detail (minimum 10 characters)';
    }

    if (selectedType === 'order' && !formData.order_number) {
      newErrors.order_number = 'Order number is required for order issues';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // ✅ Use isAuthenticated from context — no manual AsyncStorage read needed
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to send a message',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => router.push('/(auth)/signIn') },
        ]
      );
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    setLoading(true);

    try {
      const complaint = `[${selectedType.toUpperCase()}] ${formData.message}${
        formData.order_number ? `\nOrder: ${formData.order_number}` : ''
      }`;

      const response = await supportService.submitSupportRequest({
        name: formData.name,
        email: formData.email,
        complaint,
        ...(formData.order_number && { order_number: formData.order_number }),
        ...(formData.phone && { phone: formData.phone }),
      });

      if (response.success) {
        Alert.alert(
          '✅ Message Sent',
          `Your message has been sent successfully.\nTicket #: ${response.data?.ticket_number || 'N/A'}\n\nWe'll respond within 24 hours.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Submit error:', error);

      // Handle session expiry
      if (error.message?.includes('session has expired')) {
        await logout();
        router.replace('/(auth)/signIn');
        return;
      }

      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleFAQPress = () => {
    router.push('/(customer)/faq');
  };

  // ✅ Wait for AuthContext to finish loading before rendering
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: 'Messages',
          headerBackTitle: 'Back',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 8 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={26} color="#111827" />
              <Text style={{ color: '#111827', fontSize: 16 }}>Back</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View className="items-center mt-6 mb-6">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center">
              <Ionicons name="chatbubbles" size={40} color="#7B2A2A" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mt-4">Send us a Message</Text>
            <Text className="text-gray-500 text-sm mt-1 text-center">
              Choose a topic and we&apos;ll get back to you soon
            </Text>

            {/* ✅ Only shows when truly not authenticated */}
            {!isAuthenticated && (
              <View className="mt-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                <Text className="text-yellow-700 text-xs">
                  ⚠️ Please log in to send messages
                </Text>
              </View>
            )}
          </View>

          {/* Message Type Selector */}
          <Text className="text-sm font-medium text-darkRed mb-2">Message Topic</Text>
          <View className="flex-row flex-wrap mb-4">
            {messageTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => {
                  setSelectedType(type.id as MessageType);
                  setFormData({ ...formData, type: type.id as MessageType });
                }}
                className={`w-[48%] mb-2 mr-2 p-3 rounded-xl border ${
                  selectedType === type.id
                    ? 'bg-blue-50 border-darkRed'
                    : 'bg-white border-gray-200'
                }`}
                disabled={!isAuthenticated || loading}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={selectedType === type.id ? '#7B2A2A' : '#7B2A2A'}
                  />
                  <Text
                    className={`ml-2 text-sm ${
                      selectedType === type.id
                        ? 'text-darkRed font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {type.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <View className="space-y-4">

            {/* Name */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Full Name <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 text-gray-900 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                editable={!loading && isAuthenticated}
              />
              {errors.name && (
                <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
              )}
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Email Address <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 text-gray-900 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading && isAuthenticated}
              />
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
              )}
            </View>

            {/* Phone (Optional) */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Phone Number <Text className="text-gray-400">(Optional)</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                editable={!loading && isAuthenticated}
              />
            </View>

            {/* Order Number — only for order issues */}
            {selectedType === 'order' && (
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Order Number <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className={`border rounded-xl px-4 py-3 text-gray-900 ${
                    errors.order_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g. ORD-20240218-1234"
                  value={formData.order_number}
                  onChangeText={(text) => {
                    setFormData({ ...formData, order_number: text });
                    if (errors.order_number) setErrors({ ...errors, order_number: '' });
                  }}
                  autoCapitalize="characters"
                  editable={!loading && isAuthenticated}
                />
                {errors.order_number && (
                  <Text className="text-red-500 text-xs mt-1">{errors.order_number}</Text>
                )}
              </View>
            )}

            {/* Message */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Your Message <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 text-gray-900 min-h-[120px] ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Please describe your issue or question in detail..."
                value={formData.message}
                onChangeText={(text) => {
                  setFormData({ ...formData, message: text });
                  if (errors.message) setErrors({ ...errors, message: '' });
                }}
                multiline
                textAlignVertical="top"
                editable={!loading && isAuthenticated}
              />
              {errors.message && (
                <Text className="text-red-500 text-xs mt-1">{errors.message}</Text>
              )}
              <Text className="text-gray-400 text-xs mt-1 text-right">
                {formData.message.length}/500
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !isAuthenticated}
              className={`py-4 rounded-xl mt-4 ${
                loading || !isAuthenticated ? 'bg-gray-400' : 'bg-darkRed'
              }`}
            >
              {loading ? (
                <View className="flex-row items-center justify-center border border-darkRed">
                  <ActivityIndicator size="small" color="#7B2A2A" />
                  <Text className="text-white font-semibold text-lg ml-2">
                    Sending...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-lg text-center">
                  {isAuthenticated ? 'Send Message' : 'Log in to Send Message'}
                </Text>
              )}
            </TouchableOpacity>

            {/* FAQ Link - Added here */}
            <TouchableOpacity
              onPress={handleFAQPress}
              className="py-4 flex-row items-center justify-center"
            >
              <Text className="text-gray-600 text-sm">Check our </Text>
              <Text className="text-darkRed text-sm font-medium">FAQ</Text>
              <Text className="text-gray-600 text-sm"> for quick answers</Text>
            </TouchableOpacity>

            {/* Login links — only when not authenticated */}
            {!isAuthenticated && (
              <View className="mt-4">
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/signIn')}
                  className="py-2"
                >
                  <Text className="text-darkRed text-center font-medium">
                    Already have an account? Log In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/signUp')}
                  className="py-2"
                >
                  <Text className="text-gray-600 text-center">
                    Don&apos;t have an account?{' '}
                    <Text className="text-darkRed font-medium">Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          </View>

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}