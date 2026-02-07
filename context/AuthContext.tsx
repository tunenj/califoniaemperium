// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: 'business' | 'customer' | null;
  login: (credentials: string | { email: string; password: string }, roleOrPassword?: string) => Promise<{success: boolean; message?: string}>;
  loginWithPhone: (phone: string) => Promise<{success: boolean; message?: string}>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<{success: boolean; message?: string}>;
  register: (userData: RegisterData) => Promise<{success: boolean; message?: string}>;
  verifyEmail: (email: string, otp: string) => Promise<{success: boolean; message?: string}>;
  resendEmailOtp: (email: string) => Promise<{success: boolean; message?: string}>;
  forgotPassword: (email: string) => Promise<{success: boolean; message?: string}>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  setAuthState: (tokens: { access: string; refresh?: string }, user: User) => Promise<void>; // New helper
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

  // Helper function to set auth state
  const setAuthState = async (tokens: { access: string; refresh?: string }, userData: User): Promise<void> => {
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
      
      console.log('Auth state set successfully for user:', userData.email);
    } catch (error) {
      console.error('Failed to set auth state:', error);
      throw error;
    }
  };

  // Function to refresh access token
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.log('No refresh token available');
        return false;
      }
      
      const response = await api.post(endpoints.refreshToken, {
        refresh: refreshToken
      });
      
      console.log('Token refresh response:', response.data);
      
      if (response.data.access) {
        const newAccessToken = response.data.access;
        
        // Store new access token
        await AsyncStorage.setItem('authToken', newAccessToken);
        
        // Update API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        console.log('Access token refreshed successfully');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Failed to refresh token:', error);
      
      // If refresh token is invalid/expired, logout user
      if (error.response?.status === 401) {
        console.log('Refresh token expired, logging out');
        await logout();
      }
      
      return false;
    }
  };

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('userData');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (token && storedUser) {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Parse user data
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setUserRole(userData.role === 'vendor' ? 'business' : 'customer');
          
          // Optionally verify token with backend or refresh if needed
          try {
            // You might want to verify the token is still valid
            // For now, we'll just check if we have tokens
            if (!refreshToken) {
              console.log('No refresh token found, auth may be incomplete');
            }
          } catch (error) {
            console.log('Token check failed:', error);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Enhanced login function - handles both email/password and token-based login
  const login = async (
    credentials: string | { email: string; password: string },
    roleOrPassword?: string
  ): Promise<{success: boolean; message?: string}> => {
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
        console.log('Attempting email/password login for:', credentials.email);
        
        const response = await api.post(endpoints.emailLogin, {
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password
        });
        
        console.log('Login API response:', {
          status: response.status,
          data: response.data,
          success: response.data?.success,
          hasTokens: !!(response.data?.access || response.data?.token || response.data?.data?.tokens)
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
          console.warn('Login response missing expected fields:', responseData);
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
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        // Set API header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        setUserRole(userData.role === 'vendor' ? 'business' : 'customer');
        
        // If user data is incomplete (token-based login), fetch complete profile
        if (!userData.email || userData.id.startsWith('temp-')) {
          console.log('Fetching complete user profile...');
          fetchUserProfile();
        }
        
        console.log('Login successful, user role:', userData.role);
        return { success: true, message: successMessage };
      }
      
      return { success: false, message: 'Login failed - missing user data or token' };
      
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      let errorMessage = 'Login failed';
      
      // Try to extract detailed error message
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (Array.isArray(errorData)) {
          errorMessage = errorData.join(', ');
        } else if (typeof errorData === 'object') {
          // Try to get first error from object
          const firstKey = Object.keys(errorData)[0];
          if (firstKey) {
            const firstError = errorData[firstKey];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            } else {
              errorMessage = firstError;
            }
          }
        }
        
        // Add field-specific errors if available
        if (errorData.errors) {
          const fieldErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Phone login - request OTP
  const loginWithPhone = async (phone: string): Promise<{success: boolean; message?: string}> => {
    try {
      setIsLoading(true);
      
      const response = await api.post(endpoints.phoneLogin, {
        phone
      });
      
      console.log('Phone login OTP sent:', response.data);
      
      if (response.data.success || response.data.message) {
        return { 
          success: true, 
          message: response.data.message || 'OTP sent to your phone' 
        };
      }
      
      return { success: false, message: 'Failed to send OTP' };
    } catch (error: any) {
      console.error('Phone login failed:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to send OTP';
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify phone OTP
  const verifyPhoneOtp = async (phone: string, otp: string): Promise<{success: boolean; message?: string}> => {
    try {
      setIsLoading(true);
      
      const response = await api.post(endpoints.phoneOtpVerification, {
        phone,
        otp
      });
      
      console.log('Phone OTP verification:', response.data);
      
      if (response.data.access || response.data.token) {
        const token = response.data.access || response.data.token;
        const user = response.data.user;
        
        await AsyncStorage.setItem('authToken', token);
        if (response.data.refresh) {
          await AsyncStorage.setItem('refreshToken', response.data.refresh);
        } else if (response.data.refresh_token) {
          await AsyncStorage.setItem('refreshToken', response.data.refresh_token);
        }
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(user);
        setIsAuthenticated(true);
        setUserRole(user.role === 'vendor' ? 'business' : 'customer');
        
        return { success: true, message: 'Login successful' };
      }
      
      return { success: false, message: 'Invalid OTP' };
    } catch (error: any) {
      console.error('Phone OTP verification failed:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Invalid OTP';
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (userData: RegisterData): Promise<{success: boolean; message?: string}> => {
    try {
      setIsLoading(true);
      
      const response = await api.post(endpoints.register, userData);
      
      console.log('Registration response:', response.data);
      
      if (response.data.success || response.data.message) {
        return { 
          success: true, 
          message: response.data.message || 'Registration successful. Please verify your email.' 
        };
      }
      
      return { success: false, message: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Registration failed';
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify email OTP
  const verifyEmail = async (email: string, otp: string): Promise<{success: boolean; message?: string}> => {
    try {
      setIsLoading(true);
      
      const response = await api.post(endpoints.emailOtpVerification, {
        email,
        otp
      });
      
      console.log('Email verification:', response.data);
      
      if (response.data.success) {
        // Auto-login after verification if tokens are provided
        if (response.data.access) {
          const { access, refresh, user } = response.data;
          
          await AsyncStorage.setItem('authToken', access);
          await AsyncStorage.setItem('refreshToken', refresh);
          await AsyncStorage.setItem('userData', JSON.stringify(user));
          
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          
          setUser(user);
          setIsAuthenticated(true);
          setUserRole(user.role === 'vendor' ? 'business' : 'customer');
        }
        
        return { success: true, message: response.data.message || 'Email verified successfully' };
      }
      
      return { success: false, message: 'Verification failed' };
    } catch (error: any) {
      console.error('Email verification failed:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Verification failed';
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Resend email OTP
  const resendEmailOtp = async (email: string): Promise<{success: boolean; message?: string}> => {
    try {
      setIsLoading(true);
      
      const response = await api.post(endpoints.resendEmailOtp, {
        email
      });
      
      console.log('Resend OTP response:', response.data);
      
      if (response.data.success) {
        return { success: true, message: response.data.message || 'OTP resent successfully' };
      }
      
      return { success: false, message: 'Failed to resend OTP' };
    } catch (error: any) {
      console.error('Resend OTP failed:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to resend OTP';
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email: string): Promise<{success: boolean; message?: string}> => {
    try {
      setIsLoading(true);
      
      const response = await api.post(endpoints.forgotPassword, {
        email
      });
      
      console.log('Forgot password response:', response.data);
      
      if (response.data.success) {
        return { success: true, message: response.data.message || 'Password reset instructions sent' };
      }
      
      return { success: false, message: 'Password reset failed' };
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Password reset failed';
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      // You might need to add this endpoint
      const response = await api.get('/accounts/me/');
      if (response.data) {
        setUser(response.data);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API endpoint
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          // Some backends want you to blacklist the refresh token on logout
          await api.post(endpoints.signOut, { refresh: refreshToken });
        } else {
          await api.post(endpoints.signOut);
        }
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
      
      // Clear local storage
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
      
      // Clear API headers
      delete api.defaults.headers.common['Authorization'];
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
      setAuthState, // Export the helper
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