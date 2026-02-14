import React from 'react';
import { SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { CheckoutProvider } from '../context/CheckoutContext';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import ShippingSection from '@/components/checkout/ShippingSection';
import PaymentSection from '../components/checkout/PaymentSection';
import OrderSummarySection from '@/components/checkout/OrderSummarySection';
import CheckoutFooter from '@/components/checkout/CheckoutFooter';
import CountryPickerModal from '@/components/modals/CountryPickerModal';
import DeliveryOptionsModal from '@/components/modals/DeliveryOptionsModal';

const CheckoutScreen = () => {
  return (
    <CheckoutProvider>
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
        <CheckoutHeader />

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          <ShippingSection />
          <PaymentSection />
          <OrderSummarySection />
        </ScrollView>

        <CheckoutFooter />
        <CountryPickerModal />
        <DeliveryOptionsModal />
      </SafeAreaView>
    </CheckoutProvider>
  );
};

export default CheckoutScreen;
