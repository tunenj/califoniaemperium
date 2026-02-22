// services/stripePaymentService.ts
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

export interface StripeConfig {
  publishable_key: string;
}

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  publishable_key: string;
  amount: number;
  currency: string;
}

export interface ConfirmPaymentResponse {
  status: string;
  message: string;
}

class StripePaymentService {
  private publishableKey: string | null = null;

  // Get Stripe configuration
  async getStripeConfig(): Promise<string> {
    try {
      // If we already have the key, return it
      if (this.publishableKey) {
        return this.publishableKey;
      }

      const response = await api.get<StripeConfig>(endpoints.stripConfig);
      
      if (response.data?.publishable_key) {
        this.publishableKey = response.data.publishable_key;
        return this.publishableKey;
      }
      
      throw new Error('Failed to get Stripe configuration');
    } catch (error) {
      console.error('Error fetching Stripe config:', error);
      throw error;
    }
  }

  // Create payment intent
  async createPaymentIntent(orderId: string): Promise<PaymentIntentResponse> {
    try {
      const response = await api.post<PaymentIntentResponse>(
        endpoints.createPaymentIntent,
        { order_id: orderId }
      );

      if (response.data?.client_secret) {
        return response.data;
      }
      
      throw new Error('Failed to create payment intent');
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId: string): Promise<ConfirmPaymentResponse> {
    try {
      const response = await api.post<ConfirmPaymentResponse>(
        endpoints.confirmPayment,
        { payment_intent_id: paymentIntentId }
      );

      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Clear cached publishable key (useful for logout)
  clearCache() {
    this.publishableKey = null;
  }
}

export default new StripePaymentService();