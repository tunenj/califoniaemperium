// mocks/stripe-react-native.web.js

module.exports = {
  StripeProvider: ({ children }) => children,
  useStripe: () => ({
  }),
};