

export const endpoints = {
  // Business Account registration with email
  register: '/accounts/register/',
  phoneRegistration: '/register/phone/',
  emailOtpVerification: '/accounts/verify-email/',
  phoneOtpVerification: '/verify-phone/',
  emailLogin: '/accounts/login/',
  phoneLogin: '/accounts/login/phone/request/',
  //Otp resend
  resendEmailOtp: '/accounts/resend-verification/',
  //logout
  signOut: '/accounts/logout/',
  // Password Management
  forgotPassword: '/accounts/password/reset/',
  // refresh token
  refreshToken: '/accounts/token/refresh/',
  // categories
  categories: '/products/categories/',
  //to get category three
  getCategory: '/products/categories/tree/',
  //Vendor account creation
  createVendorAccount: '/vendors/',
  // vendor dashboard
  getVendoInfo: '/vendors/me/dashboard/',
  getVendorList: '/vendors/',
  //To get individual ventor details
  getVendorDetails: (slug: string) => `/vendors/${slug}/`,
  //get vendor details
  getMyVendorDetails: 'vendors/me/dashboard/',
  getVendorProducts: '/products/vendor-products/',
  //edit vendor details
  editVendorDetails: (slug: string) => `/vendors/${slug}/`,
  //vendor application to admin
  vendorApplication: '/vendors/applications/',
  getUserDetails: '/accounts/me/',
  updateUserDetails: '/accounts/me/',
  getVendorApplications: '/vendors/applications/',
  getVendorApplicationDetails: (id: string) => `/vendors/applications/${id}/`,
  vendorApproval: (id: string) => `/vendors/applications/${id}/review/`,
  listVendors: '/vendors/',
  // to get specific details of product on vendor
  getProductDetails: (slug: string) => `/products/${slug}/`,
  // vendor to update product
  updateProduct: (slug: string) => `/products/${slug}/`,
  // Products
  addProduct: '/products/',
  products: '/products/',
  productDetails: (id: string) => `/products/${id}/`,
  //Trending products
  trendingProducts: '/products/trending/',
  // To get product details by slug
  productDetailsBySlug: (slug: string) => `/products/${slug}/`,
  //best selling products
  bestSellingProducts: '/products/best_sellers/',
  //vendor Dashboard
  vendorDashboard: '/vendors/me/dashboard/',
  vendorCard: '/vendors/me/stats/',
  //to get dropship products
  dropshipProducts: '/products/dropship-products/',
  dropShipping: '/products/dropship-products/sync_with_cj/',
  //add to cart
  addToCart: '/orders/cart/add/',
  toGetCart: '/orders/cart/',
  // to update the cart quantity
  updateCart: '/orders/cart/:item_id/update/',
  removeCart: '/orders/cart/:item_id/remove/',
  clearCart: '/orders/cart/clear/',
  //wish list
  createWishList: '/orders/wishlist/',
  listWishList: '/orders/wishlist/',
  toRemove: '/orders/wishlist/:wishlist_id/',

  //checkout
  ShippingForm: '/orders/checkout/',
  //list order
  listOrder: '/orders/',
  // get order details
  orderDetails: (id: string) => `/orders/${id}/`,
  //cancel order
  cancelOrder: (id: string) => `/orders/${id}/cancel/`,
  // to add review on project
  review: '/vendors/reviews/',
  //admin endpoints
  payout: '/vendors/',
  //get vendor commission
  vendorCommission: '/vendors/commissions/',
  createCommission: (slug: string) =>  `/vendors/commissions/${slug}/set/`,
  //commission table to get total vendor earning
  getVendorEarning: '/vendors/earnings/',
  //list of order
  getOrder: '/orders/',
  //payment
  stripConfig: '/orders/payments/config/',
  createPaymentIntent: '/orders/payments/create-payment-intent/',
  confirmPayment: '/orders/payments/confirm-payment/',
  //support
  support: '/support-requests/',
  //search item with image
  searchItem: '/search/by-image/',
  //admin stats
  adminStat: '/vendors/admin-analytics/stats/',
  //google signup
  googleSignUp: '/accounts/login/google/',
  // shipping calculation
  calculateShip: 'orders/shipping/calculate/',
};
