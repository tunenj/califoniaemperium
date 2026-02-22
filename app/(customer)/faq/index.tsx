// app/(customer)/faq/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping typically takes 3-7 business days. Express shipping takes 1-3 business days.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days of delivery. Items must be unused and in original packaging.',
  },
  {
    question: 'How can I track my order?',
    answer: 'You can track your order in the "Orders" section of your account. A tracking link will be provided once shipped.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers.',
  },
  {
    question: 'How do I cancel my order?',
    answer: 'Orders can be cancelled within 1 hour of placement from your Orders page.',
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(customer)/messages');
    }
  };

  const handleContactSupport = () => {
    if (isAuthenticated) {
      router.push('/(customer)/messages');
    } else {
      router.push('/(auth)/signIn');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: 'FAQ',
          headerBackVisible: false,
          // ✅ inline styles — NativeWind doesn't work inside Stack.Screen options
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={26} color="#111827" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View className="items-center mt-6 mb-8">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center">
            <Ionicons name="help-circle" size={40} color="#7B2A2A" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mt-4">
            Frequently Asked Questions
          </Text>
          <Text className="text-gray-500 text-sm mt-1 text-center">
            Find quick answers to common questions
          </Text>
        </View>

        {/* FAQ Items */}
        {faqs.map((faq, index) => (
          <View
            key={index}
            className="mb-3 border border-gray-200 rounded-xl overflow-hidden"
          >
            <TouchableOpacity
              onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="p-4 bg-gray-50 flex-row justify-between items-center"
            >
              <Text className="text-gray-900 font-medium flex-1 mr-2">
                {faq.question}
              </Text>
              <Ionicons
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {expandedIndex === index && (
              <View className="p-4 bg-white">
                <Text className="text-gray-600 leading-6">{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Still need help section */}
        <View className="mt-6 mb-4 bg-purple-50 p-5 rounded-xl border border-purple-100">
          <Text className="text-gray-900 font-bold text-base mb-1">
            Still need help?
          </Text>
          <Text className="text-gray-500 text-sm mb-4">
            {isAuthenticated
              ? "Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours."
              : "Log in to contact our support team directly."}
          </Text>
          <TouchableOpacity
            onPress={handleContactSupport}
            className="bg-[#7B2A2A] py-3 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-base">
              {isAuthenticated ? 'Contact Support' : 'Log In to Contact Support'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auth nudge for logged out users */}
        {!isAuthenticated && (
          <View className="mb-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex-row items-center">
            <Ionicons name="information-circle-outline" size={20} color="#d97706" />
            <Text className="text-yellow-700 text-sm ml-2 flex-1">
              Log in to track orders, manage returns, and contact support.
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
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