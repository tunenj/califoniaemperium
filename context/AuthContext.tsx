// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from "@/api/api"
import { endpoints } from '@/api/endpoints';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: 'business' | 'customer' | null;
  login: (credentials: string | { email: string; password: string }, roleOrPassword?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithPhone: (phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  resendEmailOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  setAuthState: (tokens: { access: string; refresh?: string }, user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
  handleSessionExpired: () => void;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  role: 'admin' | 'superadmin' | 'vendor' | 'customer';
  phone_verified?: boolean;
  email_verified?: boolean;
  avatar?: string;
  uploadImage?: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role?: 'customer' | 'vendor';
  business_name?: string; // For business registration
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'business' | 'customer' | null>(null);

  // Clear all auth data
  const clearAuth = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      console.log('✅ Auth data cleared');
    } catch (error) {
      console.error('❌ Failed to clear auth:', error);
    }
  }, []); // No dependencies needed as it only uses setState and AsyncStorage

  // Function to refresh access token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 Attempting to refresh access token...');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (!refreshToken) {
        console.log('No refresh token available');
        return false;
      }

      console.log('Calling refresh token endpoint...');
      const response = await api.post(endpoints.refreshToken, {
        refresh: refreshToken
      });

      console.log('✅ Token refresh response received');

      if (response.data.access) {
        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh || refreshToken; // Use new refresh token if provided

        // Store new tokens
        await AsyncStorage.setItem('authToken', newAccessToken);
        if (response.data.refresh) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        console.log('✅ Access token refreshed successfully');
        return true;
      }

      console.log('❌ No access token in refresh response');
      return false;
    } catch (error: any) {
      console.error('❌ Failed to refresh token:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // If refresh token is invalid/expired, clear auth
      if (error.response?.status === 401) {
        console.log('⚠️ Refresh token expired, clearing auth...');
        await clearAuth();
      }

      return false;
    }
  }, [clearAuth]); // Added clearAuth as dependency

  // Helper function to set auth state
  const setAuthState = useCallback(async (tokens: { access: string; refresh?: string }, userData: User): Promise<void> => {
    try {
      // Store tokens
      await AsyncStorage.setItem('authToken', tokens.access);
      if (tokens.refresh) {
        await AsyncStorage.setItem('refreshToken', tokens.refresh);
      }
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;

      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      setUserRole(userData.role === 'vendor' ? 'business' : 'customer');

      console.log('✅ Auth state set successfully for user:', userData.email);
    } catch (error) {
      console.error('❌ Failed to set auth state:', error);
      throw error;
    }
  }, []); // No external dependencies

  // Handle session expired
  const handleSessionExpired = useCallback(() => {
    console.log('🔐 Session expired, logging out...');
    clearAuth();
    // You can add navigation logic here or use event emitter
  }, [clearAuth]);

  // Helper function to extract error messages
  const extractErrorMessage = useCallback((errorData: any): string => {
    if (typeof errorData === 'string') return errorData;
    if (errorData.message) return errorData.message;
    if (errorData.detail) return errorData.detail;
    if (errorData.error) return errorData.error;
    if (Array.isArray(errorData)) return errorData.join(', ');

    if (typeof errorData === 'object') {
      // Try to get first error from object
      const firstKey = Object.keys(errorData)[0];
      if (firstKey) {
        const firstError = errorData[firstKey];
        if (Array.isArray(firstError)) return firstError[0];
        return String(firstError);
      }
    }

    return 'An unknown error occurred';
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      console.log('🔄 Fetching user profile...');
      const response = await api.get('/accounts/me/');
      if (response.data) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        setUser(response.data);
        console.log('✅ User profile updated');
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch user profile:', error);
      if (error.response?.status === 401) {
        handleSessionExpired();
      }
    }
  }, [handleSessionExpired]);

  // Logout function
  // Logout function
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');

      // Try to call logout API endpoint if we have a token
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          await api.post(endpoints.signOut, { refresh: refreshToken });
        }
      } catch (apiError: any) {
        // Log the error but don't fail the logout process
        console.log('⚠️ Logout API call failed (may be expected if already logged out):',
          apiError.message || 'Unknown error');

        // Optionally log more details in development
        if (__DEV__) {
          console.log('Detailed logout API error:', {
            status: apiError.response?.status,
            data: apiError.response?.data
          });
        }
      }

      // Always clear local auth state, even if API call fails
      await clearAuth();

      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      await clearAuth(); // Still clear local state even if API fails
    }
  }, [clearAuth]);

  // Enhanced login function - handles both email/password and token-based login
  const login = useCallback(async (
    credentials: string | { email: string; password: string },
    roleOrPassword?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      console.log('Login attempt with:', {
        type: typeof credentials === 'string' ? 'token' : 'email/password',
        hasRoleParam: !!roleOrPassword
      });

      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      let userData: User | null = null;
      let successMessage = 'Login successful';

      // Case 1: Token-based login (string token, string role)
      if (typeof credentials === 'string' && roleOrPassword) {
        // Token + role login
        accessToken = credentials;
        const userRole = roleOrPassword;

        // Create temporary user object
        userData = {
          id: 'temp-' + Date.now().toString(),
          email: '',
          role: userRole as any,
          phone_verified: false,
          email_verified: false,
        };

        // Store token
        await AsyncStorage.setItem('authToken', accessToken);

        successMessage = 'Token login successful';

      }
      // Case 2: Email/password login
      else if (typeof credentials === 'object' && credentials.email && credentials.password) {
        // Email/password login
        console.log('📧 Attempting email/password login for:', credentials.email);

        const response = await api.post(endpoints.emailLogin, {
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password
        });

        console.log('✅ Login API response:', {
          status: response.status,
          success: response.data?.success,
          hasTokens: !!(response.data?.access || response.data?.token)
        });

        // Extract tokens and user data from various response formats
        const responseData = response.data;

        // Format 1: Direct access/refresh tokens
        if (responseData.access && responseData.user) {
          accessToken = responseData.access;
          refreshToken = responseData.refresh;
          userData = responseData.user;
          successMessage = responseData.message || 'Login successful';
        }
        // Format 2: Nested in data object
        else if (responseData.data?.tokens?.access && responseData.data?.user) {
          accessToken = responseData.data.tokens.access;
          refreshToken = responseData.data.tokens.refresh;
          userData = responseData.data.user;
          successMessage = responseData.message || 'Login successful';
        }
        // Format 3: Simple token format
        else if (responseData.token && responseData.user) {
          accessToken = responseData.token;
          refreshToken = responseData.refresh_token || responseData.refresh;
          userData = responseData.user;
          successMessage = responseData.message || 'Login successful';
        }
        // Format 4: Success with data
        else if (responseData.success && responseData.data) {
          const data = responseData.data;

          // Try to extract from various nested structures
          if (data.access || data.token) {
            accessToken = data.access || data.token;
            refreshToken = data.refresh || data.refresh_token;
            userData = data.user;
          } else if (data.tokens?.access) {
            accessToken = data.tokens.access;
            refreshToken = data.tokens.refresh;
            userData = data.user;
          }
          successMessage = responseData.message || 'Login successful';
        }

        if (!accessToken || !userData) {
          console.warn('⚠️ Login response missing expected fields:', responseData);
          return {
            success: false,
            message: responseData.message || 'Invalid login response from server'
          };
        }

        // Store tokens
        await AsyncStorage.setItem('authToken', accessToken);
        if (refreshToken) {
          await AsyncStorage.setItem('refreshToken', refreshToken);
        }
      } else {
        return {
          success: false,
          message: 'Invalid login parameters. Provide either token+role or email+password.'
        };
      }

      // Store user data and update state
      if (userData && accessToken) {
        await setAuthState({ access: accessToken, refresh: refreshToken || undefined }, userData);

        // If user data is incomplete (token-based login), fetch complete profile
        if (!userData.email || userData.id.startsWith('temp-')) {
          console.log('🔄 Fetching complete user profile...');
          setTimeout(() => fetchUserProfile(), 1000); // Fetch after a delay
        }

        console.log('✅ Login successful, user role:', userData.role);
        return { success: true, message: successMessage };
      }

      return { success: false, message: 'Login failed - missing user data or token' };

    } catch (error: any) {
      console.error('❌ Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      let errorMessage = 'Login failed';

      // Try to extract detailed error message
      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage = extractErrorMessage(errorData);
      }

      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [setAuthState, fetchUserProfile, extractErrorMessage]);

  // Phone login - request OTP
  const loginWithPhone = useCallback(async (phone: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const response = await api.post(endpoints.phoneLogin, { phone });

      console.log('📱 Phone login OTP sent:', response.data);

      if (response.data.success || response.data.message) {
        return {
          success: true,
          message: response.data.message || 'OTP sent to your phone'
        };
      }

      return { success: false, message: 'Failed to send OTP' };
    } catch (error: any) {
      console.error('❌ Phone login failed:', error);
      return {
        success: false,
        message: extractErrorMessage(error.response?.data) || 'Failed to send OTP'
      };
    } finally {
      setIsLoading(false);
    }
  }, [extractErrorMessage]);

  // Verify phone OTP
  const verifyPhoneOtp = useCallback(async (phone: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const response = await api.post(endpoints.phoneOtpVerification, {
        phone,
        otp
      });

      console.log('✅ Phone OTP verification:', response.data);

      if (response.data.access || response.data.token) {
        const token = response.data.access || response.data.token;
        const user = response.data.user;
        const refreshToken = response.data.refresh || response.data.refresh_token;

        await setAuthState({
          access: token,
          refresh: refreshToken
        }, user);

        return { success: true, message: 'Login successful' };
      }

      return { success: false, message: 'Invalid OTP' };
    } catch (error: any) {
      console.error('❌ Phone OTP verification failed:', error);
      return {
        success: false,
        message: extractErrorMessage(error.response?.data) || 'Invalid OTP'
      };
    } finally {
      setIsLoading(false);
    }
  }, [setAuthState, extractErrorMessage]);

  // Register new user
  const register = useCallback(async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const response = await api.post(endpoints.register, userData);

      console.log('✅ Registration response:', response.data);

      if (response.data.success || response.data.message) {
        return {
          success: true,
          message: response.data.message || 'Registration successful. Please verify your email.'
        };
      }

      return { success: false, message: 'Registration failed' };
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      return {
        success: false,
        message: extractErrorMessage(error.response?.data) || 'Registration failed'
      };
    } finally {
      setIsLoading(false);
    }
  }, [extractErrorMessage]);

  // Verify email OTP
  const verifyEmail = useCallback(async (email: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const response = await api.post(endpoints.emailOtpVerification, {
        email,
        otp
      });

      console.log('✅ Email verification:', response.data);

      if (response.data.success) {
        // Auto-login after verification if tokens are provided
        if (response.data.access) {
          const { access, refresh, user } = response.data;
          await setAuthState({ access, refresh }, user);
        }

        return { success: true, message: response.data.message || 'Email verified successfully' };
      }

      return { success: false, message: 'Verification failed' };
    } catch (error: any) {
      console.error('❌ Email verification failed:', error);
      return {
        success: false,
        message: extractErrorMessage(error.response?.data) || 'Verification failed'
      };
    } finally {
      setIsLoading(false);
    }
  }, [setAuthState, extractErrorMessage]);

  // Resend email OTP
  const resendEmailOtp = useCallback(async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const response = await api.post(endpoints.resendEmailOtp, { email });

      console.log('✅ Resend OTP response:', response.data);

      if (response.data.success) {
        return { success: true, message: response.data.message || 'OTP resent successfully' };
      }

      return { success: false, message: 'Failed to resend OTP' };
    } catch (error: any) {
      console.error('❌ Resend OTP failed:', error);
      return {
        success: false,
        message: extractErrorMessage(error.response?.data) || 'Failed to resend OTP'
      };
    } finally {
      setIsLoading(false);
    }
  }, [extractErrorMessage]);

  // Forgot password
  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const response = await api.post(endpoints.forgotPassword, { email });

      console.log('✅ Forgot password response:', response.data);

      if (response.data.success) {
        return { success: true, message: response.data.message || 'Password reset instructions sent' };
      }

      return { success: false, message: 'Password reset failed' };
    } catch (error: any) {
      console.error('❌ Forgot password failed:', error);
      return {
        success: false,
        message: extractErrorMessage(error.response?.data) || 'Password reset failed'
      };
    } finally {
      setIsLoading(false);
    }
  }, [extractErrorMessage]);

  // Check if user is authenticated on app start
  const checkAuthOnStart = useCallback(async () => {
    try {
      console.log('🔍 Checking auth state on app start...');

      // 🔴 DEV MODE: Clear all stored data for fresh start in development
      if (__DEV__) {
        console.log('🧹 DEV MODE: Clearing all stored auth data for fresh start...');
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        console.log('✅ Development mode clear complete');
      }

      const token = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('userData');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      console.log('📊 Auth state:', {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        hasUserData: !!storedUser
      });

      if (token && storedUser) {
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Parse user data
        const userData = JSON.parse(storedUser);

        // Verify token is still valid by making a test API call
        try {
          console.log('🔄 Validating token with test API call...');
          await api.get('/accounts/me/', { timeout: 5000 });

          // Token is valid
          setUser(userData);
          setIsAuthenticated(true);
          setUserRole(userData.role === 'vendor' ? 'business' : 'customer');
          console.log('✅ Token is valid, user authenticated');

        } catch (error: any) {
          console.log('⚠️ Token validation failed:', error.message);

          // Token might be expired, try to refresh
          if (refreshToken) {
            console.log('🔄 Token expired, attempting refresh...');
            const refreshed = await refreshAccessToken();

            if (refreshed) {
              // Get updated user data
              const updatedUser = await AsyncStorage.getItem('userData');
              if (updatedUser) {
                const userData = JSON.parse(updatedUser);
                setUser(userData);
                setIsAuthenticated(true);
                setUserRole(userData.role === 'vendor' ? 'business' : 'customer');
                console.log('✅ Token refreshed successfully on app start');
              }
            } else {
              // Refresh failed, clear auth
              console.log('❌ Token refresh failed on app start');
              await clearAuth();
            }
          } else {
            // No refresh token, clear auth
            console.log('❌ No refresh token available');
            await clearAuth();
          }
        }
      } else {
        // No token or user data, clear auth
        await clearAuth();
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, [refreshAccessToken, clearAuth]);

  useEffect(() => {
    checkAuthOnStart();
  }, [checkAuthOnStart]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      userRole,
      login,
      loginWithPhone,
      verifyPhoneOtp,
      register,
      verifyEmail,
      resendEmailOtp,
      forgotPassword,
      logout,
      fetchUserProfile,
      refreshAccessToken,
      setAuthState,
      clearAuth,
      handleSessionExpired,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};