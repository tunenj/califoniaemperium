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
  business_name?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'business' | 'customer' | null>(null);

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
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 Attempting to refresh access token...');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (!refreshToken) {
        console.log('No refresh token available');
        return false;
      }

      const response = await api.post(endpoints.refreshToken, {
        refresh: refreshToken
      });

      if (response.data.access) {
        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh || refreshToken;

        await AsyncStorage.setItem('authToken', newAccessToken);
        if (response.data.refresh) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        console.log('✅ Access token refreshed successfully');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ Failed to refresh token:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      if (error.response?.status === 401) {
        await clearAuth();
      }

      return false;
    }
  }, [clearAuth]);

  const setAuthState = useCallback(async (tokens: { access: string; refresh?: string }, userData: User): Promise<void> => {
    try {
      await AsyncStorage.setItem('authToken', tokens.access);
      if (tokens.refresh) {
        await AsyncStorage.setItem('refreshToken', tokens.refresh);
      }
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;

      setUser(userData);
      setIsAuthenticated(true);
      setUserRole(userData.role === 'vendor' ? 'business' : 'customer');

      console.log('✅ Auth state set successfully for user:', userData.email);
    } catch (error) {
      console.error('❌ Failed to set auth state:', error);
      throw error;
    }
  }, []);

  const handleSessionExpired = useCallback(() => {
    console.log('🔐 Session expired, logging out...');
    clearAuth();
  }, [clearAuth]);

  const extractErrorMessage = useCallback((errorData: any): string => {
    if (typeof errorData === 'string') return errorData;
    if (errorData.message) return errorData.message;
    if (errorData.detail) return errorData.detail;
    if (errorData.error) return errorData.error;
    if (Array.isArray(errorData)) return errorData.join(', ');

    if (typeof errorData === 'object') {
      const firstKey = Object.keys(errorData)[0];
      if (firstKey) {
        const firstError = errorData[firstKey];
        if (Array.isArray(firstError)) return firstError[0];
        return String(firstError);
      }
    }

    return 'An unknown error occurred';
  }, []);

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

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          await api.post(endpoints.signOut, { refresh: refreshToken });
        }
      } catch (apiError: any) {
        console.log('⚠️ Logout API call failed:', apiError.message || 'Unknown error');
      }

      await clearAuth();
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      await clearAuth();
    }
  }, [clearAuth]);

  const login = useCallback(async (
    credentials: string | { email: string; password: string },
    roleOrPassword?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      let userData: User | null = null;
      let successMessage = 'Login successful';

      if (typeof credentials === 'string' && roleOrPassword) {
        accessToken = credentials;
        const userRole = roleOrPassword;

        userData = {
          id: 'temp-' + Date.now().toString(),
          email: '',
          role: userRole as any,
          phone_verified: false,
          email_verified: false,
        };

        await AsyncStorage.setItem('authToken', accessToken);
        successMessage = 'Token login successful';

      } else if (typeof credentials === 'object' && credentials.email && credentials.password) {
        console.log('📧 Attempting email/password login for:', credentials.email);

        const response = await api.post(endpoints.emailLogin, {
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password
        });

        const responseData = response.data;

        if (responseData.access && responseData.user) {
          accessToken = responseData.access;
          refreshToken = responseData.refresh;
          userData = responseData.user;
          successMessage = responseData.message || 'Login successful';
        } else if (responseData.data?.tokens?.access && responseData.data?.user) {
          accessToken = responseData.data.tokens.access;
          refreshToken = responseData.data.tokens.refresh;
          userData = responseData.data.user;
          successMessage = responseData.message || 'Login successful';
        } else if (responseData.token && responseData.user) {
          accessToken = responseData.token;
          refreshToken = responseData.refresh_token || responseData.refresh;
          userData = responseData.user;
          successMessage = responseData.message || 'Login successful';
        } else if (responseData.success && responseData.data) {
          const data = responseData.data;
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
          return {
            success: false,
            message: responseData.message || 'Invalid login response from server'
          };
        }

        await AsyncStorage.setItem('authToken', accessToken);
        if (refreshToken) {
          await AsyncStorage.setItem('refreshToken', refreshToken);
        }
      } else {
        return {
          success: false,
          message: 'Invalid login parameters.'
        };
      }

      if (userData && accessToken) {
        await setAuthState({ access: accessToken, refresh: refreshToken || undefined }, userData);

        if (!userData.email || userData.id.startsWith('temp-')) {
          setTimeout(() => fetchUserProfile(), 1000);
        }

        return { success: true, message: successMessage };
      }

      return { success: false, message: 'Login failed - missing user data or token' };

    } catch (error: any) {
      console.error('❌ Login error:', error);
      let errorMessage = 'Login failed';
      if (error.response?.data) {
        errorMessage = extractErrorMessage(error.response.data);
      }
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [setAuthState, fetchUserProfile, extractErrorMessage]);

  const loginWithPhone = useCallback(async (phone: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.post(endpoints.phoneLogin, { phone });
      if (response.data.success || response.data.message) {
        return { success: true, message: response.data.message || 'OTP sent to your phone' };
      }
      return { success: false, message: 'Failed to send OTP' };
    } catch (error: any) {
      return { success: false, message: extractErrorMessage(error.response?.data) || 'Failed to send OTP' };
    } finally {
      setIsLoading(false);
    }
  }, [extractErrorMessage]);

  const verifyPhoneOtp = useCallback(async (phone: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.post(endpoints.phoneOtpVerification, { phone, otp });

      if (response.data.access || response.data.token) {
        const token = response.data.access || response.data.token;
        const user = response.data.user;
        const refreshToken = response.data.refresh || response.data.refresh_token;
        await setAuthState({ access: token, refresh: refreshToken }, user);
        return { success: true, message: 'Login successful' };
      }

      return { success: false, message: 'Invalid OTP' };
    } catch (error: any) {
      return { success: false, message: extractErrorMessage(error.response?.data) || 'Invalid OTP' };
    } finally {
      setIsLoading(false);
    }
  }, [setAuthState, extractErrorMessage]);

  const register = useCallback(async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.post(endpoints.register, userData);
      if (response.data.success || response.data.message) {
        return { success: true, message: response.data.message || 'Registration successful. Please verify your email.' };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error: any) {
      return { success: false, message: extractErrorMessage(error.response?.data) || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  }, [extractErrorMessage]);

  const verifyEmail = useCallback(async (email: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.post(endpoints.emailOtpVerification, { email, otp });

      if (response.data.success) {
        if (response.data.access) {
          const { access, refresh, user } = response.data;
          await setAuthState({ access, refresh }, user);
        }
        return { success: true, message: response.data.message || 'Email verified successfully' };
      }

      return { success: false, message: 'Verification failed' };
    } catch (error: any) {
      return { success: false, message: extractErrorMessage(error.response?.data) || 'Verification failed' };
    } finally {
      setIsLoading(false);
    }
  }, [setAuthState, extractErrorMessage]);

  const resendEmailOtp = useCallback(async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.post(endpoints.resendEmailOtp, { email });
      if (response.data.success) {
        return { success: true, message: response.data.message || 'OTP resent successfully' };
      }
      return { success: false, message: 'Failed to resend OTP' };
    } catch (error: any) {
      return { success: false, message: extractErrorMessage(error.response?.data) || 'Failed to resend OTP' };
    } finally {
      setIsLoading(false);
    }
  }, [extractErrorMessage]);

  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.post(endpoints.forgotPassword, { email });
      if (response.data.success) {
        return { success: true, message: response.data.message || 'Password reset instructions sent' };
      }
      return { success: false, message: 'Password reset failed' };
    } catch (error: any) {
      return { success: false, message: extractErrorMessage(error.response?.data) || 'Password reset failed' };
    } finally {
      setIsLoading(false);
    }
  }, [extractErrorMessage]);

  // ✅ Fixed: removed __DEV__ block that was wiping tokens on every reload
  const checkAuthOnStart = useCallback(async () => {
    try {
      console.log('🔍 Checking auth state on app start...');

      const token = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('userData');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      console.log('📊 Auth state:', {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        hasUserData: !!storedUser,
      });

      if (token && storedUser) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const userData = JSON.parse(storedUser);

        try {
          console.log('🔄 Validating token...');
          await api.get('/accounts/me/', { timeout: 5000 });

          setUser(userData);
          setIsAuthenticated(true);
          setUserRole(userData.role === 'vendor' ? 'business' : 'customer');
          console.log('✅ Token valid, user authenticated');

        } catch (error: any) {
          console.log('⚠️ Token validation failed:', error.message);

          if (refreshToken) {
            const refreshed = await refreshAccessToken();

            if (refreshed) {
              const updatedUser = await AsyncStorage.getItem('userData');
              if (updatedUser) {
                const parsedUser = JSON.parse(updatedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
                setUserRole(parsedUser.role === 'vendor' ? 'business' : 'customer');
                console.log('✅ Token refreshed on app start');
              }
            } else {
              console.log('❌ Token refresh failed');
              await clearAuth();
            }
          } else {
            console.log('❌ No refresh token');
            await clearAuth();
          }
        }
      } else {
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