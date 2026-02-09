// api/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/baseUrl';
import { endpoints } from './endpoints';

// Define queue item type
interface QueueItem {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're already refreshing to prevent multiple calls
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add token to all requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        
        // Log request in development
        if (__DEV__) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
            hasToken: true,
          });
        }
      } else if (__DEV__) {
        console.log('🚀 API Request (No Token):', {
          method: config.method?.toUpperCase(),
          url: config.url,
        });
      }
    } catch (error) {
      console.error('Error adding auth token to request:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log all errors in development
    if (__DEV__) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: originalRequest?.url,
        method: originalRequest?.method,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔐 401 Unauthorized - Attempting token refresh...');
      
      // Debug: Log current auth state
      try {
        const authState = {
          hasAuthToken: !!(await AsyncStorage.getItem('authToken')),
          hasRefreshToken: !!(await AsyncStorage.getItem('refreshToken')),
          hasUserData: !!(await AsyncStorage.getItem('userData')),
        };
        console.log('📊 Current Auth State:', authState);
      } catch (storageError) {
        console.error('Error reading auth state:', storageError);
      }
      
      if (isRefreshing) {
        console.log('⏳ Token refresh already in progress - Queueing request');
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            console.log('🔄 Retrying queued request with new token');
            return api(originalRequest);
          })
          .catch((err) => {
            console.error('❌ Failed queued request:', err);
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.log('🔴 No refresh token available in storage');
          
          // Clear all auth data
          try {
            await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
            console.log('🧹 Cleared auth data from storage');
          } catch (storageError) {
            console.error('Error clearing storage:', storageError);
          }
          
          delete api.defaults.headers.common['Authorization'];
          
          // Create a meaningful error
          const authError = new Error('Your session has expired. Please login again.');
          authError.name = 'SessionExpiredError';
          
          // Process queued requests with this error
          processQueue(authError, null);
          
          // Reject with the custom error
          return Promise.reject(authError);
        }
        
        console.log('🔄 Attempting to refresh access token...');
        
        // Use a separate axios instance without interceptors to avoid infinite loop
        const refreshAxios = axios.create({
          baseURL: BASE_URL,
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Remove any existing Authorization header for refresh request
        delete refreshAxios.defaults.headers.common['Authorization'];
        
        const response = await refreshAxios.post(endpoints.refreshToken, {
          refresh: refreshToken
        });
        
        console.log('🔄 Token refresh response:', {
          success: !!response.data.access,
          hasNewToken: !!response.data.access,
        });
        
        if (response.data.access) {
          const newAccessToken = response.data.access;
          
          // Store new access token
          await AsyncStorage.setItem('authToken', newAccessToken);
          
          // Update API headers for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          console.log('✅ Token refreshed successfully');
          
          // Process queued requests
          processQueue(null, newAccessToken);
          
          // Retry the original request
          console.log('🔄 Retrying original request...');
          return api(originalRequest);
        } else {
          console.error('❌ No access token in refresh response');
          throw new Error('Unable to refresh session. Please login again.');
        }
      } catch (refreshError: any) {
        console.error('❌ Token refresh failed:', {
          message: refreshError.message,
          status: refreshError.response?.status,
          data: refreshError.response?.data,
        });
        
        // Clear all auth data on refresh failure
        try {
          await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
          console.log('🧹 Cleared auth data after refresh failure');
        } catch (storageError) {
          console.error('Error clearing storage:', storageError);
        }
        
        delete api.defaults.headers.common['Authorization'];
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Create user-friendly error
        const userError = new Error('Session expired. Please login again.');
        userError.name = 'AuthRequiredError';
        
        return Promise.reject(userError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle other specific error statuses
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('❌ Bad Request:', data?.message || data?.detail || 'Invalid request');
          break;
        case 403:
          console.error('⛔ Forbidden: You do not have permission to access this resource');
          // You might want to clear auth for 403 as well
          if (data?.code === 'token_not_valid' || data?.detail?.includes('token')) {
            console.log('🛑 Invalid token detected, clearing auth...');
            await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
            delete api.defaults.headers.common['Authorization'];
          }
          break;
        case 404:
          console.error('🔍 Not Found: The requested resource was not found');
          break;
        case 429:
          console.error('🚦 Too Many Requests: Please slow down');
          break;
        case 500:
          console.error('💥 Server Error: Something went wrong on our end');
          break;
        case 502:
        case 503:
        case 504:
          console.error('🌐 Server Unavailable: Please try again later');
          break;
        default:
          console.error(`⚠️ Unhandled error status: ${status}`);
      }
      
      // Enhance error with server message if available
      if (data?.message || data?.detail) {
        error.serverMessage = data.message || data.detail;
      }
      
    } else if (error.request) {
      // Request was made but no response received
      console.error('📡 Network Error: No response received from server');
      error.message = 'Network error. Please check your connection.';
    } else {
      // Something happened in setting up the request
      console.error('⚙️ Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Optional: Add response logging for debugging (only in dev)
if (__DEV__) {
  // We already added logging in the interceptors above
  // This is just for additional debugging if needed
  
  api.interceptors.response.use(
    (response) => {
      // We already log successful responses above
      return response;
    },
    (error) => {
      // We already log errors above
      return Promise.reject(error);
    }
  );
}

// Export a helper function to manually clear auth
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
    delete api.defaults.headers.common['Authorization'];
    console.log('🧹 Auth data cleared manually');
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

// Export a helper function to check auth status
export const getAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
}> => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    return {
      isAuthenticated: !!(authToken && refreshToken),
      hasAccessToken: !!authToken,
      hasRefreshToken: !!refreshToken,
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return {
      isAuthenticated: false,
      hasAccessToken: false,
      hasRefreshToken: false,
    };
  }
};

// Export a helper to manually set auth header (for debugging)
export const setAuthHeader = (token: string): void => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Export a helper to remove auth header
export const removeAuthHeader = (): void => {
  delete api.defaults.headers.common['Authorization'];
};

export default api;