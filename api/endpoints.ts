

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
  // categories
  categories: '/products/categories/',
  //Vendor account creation
  createVendorAccount: '/vendors/',
  getVendorList: '/vendors/',
  //To get individual ventor details
  getVendorDetails: (slug: string) => `/vendors/${slug}/`,
  //vendor application to admin
  vendorApplication: '/vendors/applications/',
  getUserDetails: '/accounts/me/',
  updateUserDetails: '/accounts/me/',
  getVendorApplications: '/vendors/applications/',
  getVendorApplicationDetails: (id: string) => `/vendors/applications/${id}/`,
  vendorApproval: (id: string) => `/vendors/applications/${id}/review/`,
  listVendors: '/vendors/',
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
};
