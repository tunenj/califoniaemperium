
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
//vendor application to admin
vendorApplication: '/vendors/applications/',
getUserDetails: '/accounts/me/',
updateUserDetails:'/accounts/me/',



  // Products
  addProduct: '/products/',
  products: '/products/',
  productDetails: (id: string) => `/products/${id}/`,

  // Orders
  orders: '/orders/',
};
