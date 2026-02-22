// mocks/stripe-react-native.web.js

module.exports = {
  StripeProvider: ({ children }) => children,
  useStripe: () => ({
    initPaymentSheet: async () => ({ error: null }),
    presentPaymentSheet: async () => ({ error: { code: 'Canceled' } }),
  }),
};