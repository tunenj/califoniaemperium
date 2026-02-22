// mocks/stripe-react-native.web.js

export const StripeProvider = ({ children }) => children;

export const useStripe = () => ({
  initPaymentSheet: async () => ({ error: null }),
  presentPaymentSheet: async () => ({ error: { code: 'Canceled', message: 'Not supported on web' } }),
});