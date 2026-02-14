// api/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/baseUrl';
import { endpoints } from './endpoints';
import { Platform } from 'react-native';

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
    'Accept': 'application/json',
    'X-Platform': Platform.OS,
    'X-Client-Version': '1.0.0',
  },
});

// Token refresh queue system
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
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        
        if (__DEV__) {
          console.log(`🔐 Adding token to: ${config.method?.toUpperCase()} ${config.url}`);
        }
      }
    } catch (error) {
      console.error('❌ Error getting token from storage:', error);
    }
    
    // Add cache-busting timestamp for GET requests
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(), // Cache busting
      };
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean;
      _skipAuth?: boolean;
    };
    
    // Don't handle auth for endpoints that should skip it
    if (originalRequest._skipAuth) {
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const errorData = error.response?.data as any;
      
      // Check if it's a token-related error
      const isTokenError = 
        errorData?.code === 'token_not_valid' ||
        errorData?.error?.code === 'token_not_valid' ||
        errorData?.detail?.toLowerCase().includes('token') ||
        errorData?.message?.toLowerCase().includes('token') ||
        (Array.isArray(errorData?.messages) && 
         errorData.messages.some((msg: any) => 
           msg?.message?.toLowerCase().includes('token') || 
           msg?.message?.toLowerCase().includes('expired')
         ));
      
      if (!isTokenError) {
        return Promise.reject(error);
      }
      
      if (__DEV__) {
        console.log('🔐 Token expired, attempting refresh...');
      }
      
      // If already refreshing, add to queue
      if (isRefreshing) {
        if (__DEV__) {
          console.log('⏳ Token refresh in progress, queuing request...');
        }
        
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          if (__DEV__) {
            console.log('❌ No refresh token available');
          }
          
          // Clear auth data
          await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
          delete api.defaults.headers.common.Authorization;
          
          const sessionError = new Error('SESSION_EXPIRED');
          (sessionError as any).code = 'SESSION_EXPIRED';
          processQueue(sessionError, null);
          
          return Promise.reject(sessionError);
        }
        
        if (__DEV__) {
          console.log('🔄 Calling refresh token endpoint...');
        }
        
        // Use a clean axios instance without interceptors
        const refreshResponse = await axios.post(
          `${BASE_URL}${endpoints.refreshToken}`,
          { refresh: refreshToken },
          {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        const newAccessToken = refreshResponse.data.access;
        const newRefreshToken = refreshResponse.data.refresh;
        
        if (!newAccessToken) {
          throw new Error('INVALID_REFRESH_RESPONSE');
        }
        
        // Store new tokens
        await AsyncStorage.setItem('authToken', newAccessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }
        
        // Update axios default headers
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        
        // Update the original request header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        // Process queued requests
        processQueue(null, newAccessToken);
        
        if (__DEV__) {
          console.log('✅ Token refreshed successfully, retrying original request...');
        }
        
        // Retry original request
        return api(originalRequest);
        
      } catch (refreshError: any) {
        console.error('❌ Token refresh failed:', refreshError.message);
        
        // Clear auth data on failure
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
        delete api.defaults.headers.common.Authorization;
        
        // Process queued requests with error
        const sessionError = new Error('SESSION_EXPIRED');
        (sessionError as any).code = 'SESSION_EXPIRED';
        processQueue(sessionError, null);
        
        return Promise.reject(sessionError);
        
      } finally {
        isRefreshing = false;
      }
    }
    
    // For network errors, provide a better error message
    if (!error.response) {
      const networkError = new Error(
        error.code === 'ECONNABORTED' 
          ? 'Request timeout. Please check your connection.' 
          : 'Network error. Please check your internet connection.'
      );
      (networkError as any).code = error.code || 'NETWORK_ERROR';
      return Promise.reject(networkError);
    }
    
    return Promise.reject(error);
  }
);

// Helper functions
export const setAuthToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const removeAuthHeader = (): void => {
  delete api.defaults.headers.common.Authorization;
};

export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('authToken');
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('refreshToken');
};

export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
    delete api.defaults.headers.common.Authorization;
    if (__DEV__) {
      console.log('✅ Auth data cleared');
    }
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    throw error;
  }
};

// Utility to check if error is session expired
export const isSessionExpiredError = (error: any): boolean => {
  return (
    error?.code === 'SESSION_EXPIRED' ||
    error?.message === 'SESSION_EXPIRED' ||
    (error?.response?.status === 401 && 
     (error?.response?.data?.code === 'token_not_valid' ||
      error?.response?.data?.detail?.toLowerCase().includes('token')))
  );
};

// Utility to extract error message
export const extractErrorMessage = (error: any): string => {
  if (!error) return 'An error occurred';
  
  if (error.message === 'SESSION_EXPIRED') {
    return 'Your session has expired. Please login again.';
  }
  
  if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
    return 'Network error. Please check your connection.';
  }
  
  if (error.response?.data) {
    const data = error.response.data;
    
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.error) return data.error;
    
    if (Array.isArray(data)) {
      return data.map((err: any) => 
        typeof err === 'string' ? err : JSON.stringify(err)
      ).join(', ');
    }
    
    if (typeof data === 'object') {
      const errors = [];
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          errors.push(`${key}: ${value.join(', ')}`);
        } else if (typeof value === 'string') {
          errors.push(`${key}: ${value}`);
        }
      }
      if (errors.length > 0) return errors.join('; ');
    }
  }
  
  return error.message || 'An error occurred';
};

// Helper for making API calls with retry logic
export const apiCallWithRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = 1,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry for these errors
      if (
        error.code === 'SESSION_EXPIRED' ||
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.response?.status === 404
      ) {
        break;
      }
      
      // Only retry for network errors or server errors
      if (i < maxRetries && (error.code === 'NETWORK_ERROR' || error.response?.status >= 500)) {
        if (__DEV__) {
          console.log(`🔄 Retrying... (${i + 1}/${maxRetries})`);
        }
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      
      break;
    }
  }
  
  throw lastError;
};

export default api;