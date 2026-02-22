// api/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/baseUrl';
import { endpoints } from './endpoints';
import { Platform } from 'react-native';

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
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ─── Request interceptor ──────────────────────────────────────────────────────
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

    // ✅ REMOVED: cache-busting _t timestamp
    // React Native does NOT cache HTTP responses like browsers do.
    // Adding _t to every GET request was causing:
    // 1. Unnecessary unique requests that bypass any server-side caching
    // 2. Extra query params that some backends reject or log as errors
    // 3. fetchCart() being triggered repeatedly, overwriting optimistic updates

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _skipAuth?: boolean;
    };

    if (originalRequest._skipAuth) {
      return Promise.reject(error);
    }

    // Handle 401 — token expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const errorData = error.response?.data as any;

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

      if (!isTokenError) return Promise.reject(error);

      if (__DEV__) console.log('🔐 Token expired, attempting refresh...');

      if (isRefreshing) {
        if (__DEV__) console.log('⏳ Token refresh in progress, queuing request...');
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (!refreshToken) {
          if (__DEV__) console.log('❌ No refresh token available');
          await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
          delete api.defaults.headers.common.Authorization;
          const sessionError = new Error('SESSION_EXPIRED');
          (sessionError as any).code = 'SESSION_EXPIRED';
          processQueue(sessionError, null);
          return Promise.reject(sessionError);
        }

        if (__DEV__) console.log('🔄 Calling refresh token endpoint...');

        const refreshResponse = await axios.post(
          `${BASE_URL}${endpoints.refreshToken}`,
          { refresh: refreshToken },
          { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
        );

        const newAccessToken  = refreshResponse.data.access;
        const newRefreshToken = refreshResponse.data.refresh;

        if (!newAccessToken) throw new Error('INVALID_REFRESH_RESPONSE');

        await AsyncStorage.setItem('authToken', newAccessToken);
        if (newRefreshToken) await AsyncStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);

        if (__DEV__) console.log('✅ Token refreshed, retrying original request...');

        return api(originalRequest);

      } catch (refreshError: any) {
        console.error('❌ Token refresh failed:', refreshError.message);
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
        delete api.defaults.headers.common.Authorization;
        const sessionError = new Error('SESSION_EXPIRED');
        (sessionError as any).code = 'SESSION_EXPIRED';
        processQueue(sessionError, null);
        return Promise.reject(sessionError);
      } finally {
        isRefreshing = false;
      }
    }

    // Network errors
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

// ─── Helper exports ───────────────────────────────────────────────────────────

export const setAuthToken = (token: string | null): void => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

export const removeAuthHeader = (): void => {
  delete api.defaults.headers.common.Authorization;
};

export const getAuthToken = async (): Promise<string | null> =>
  AsyncStorage.getItem('authToken');

export const getRefreshToken = async (): Promise<string | null> =>
  AsyncStorage.getItem('refreshToken');

export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
    delete api.defaults.headers.common.Authorization;
    if (__DEV__) console.log('✅ Auth data cleared');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    throw error;
  }
};

export const isSessionExpiredError = (error: any): boolean =>
  error?.code === 'SESSION_EXPIRED' ||
  error?.message === 'SESSION_EXPIRED' ||
  (error?.response?.status === 401 &&
    (error?.response?.data?.code === 'token_not_valid' ||
     error?.response?.data?.detail?.toLowerCase().includes('token')));

export const extractErrorMessage = (error: any): string => {
  if (!error) return 'An error occurred';
  if (error.message === 'SESSION_EXPIRED') return 'Your session has expired. Please login again.';
  if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') return 'Network error. Please check your connection.';

  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.detail)  return data.detail;
    if (data.message) return data.message;
    if (data.error)   return data.error;
    if (Array.isArray(data)) return data.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)).join(', ');
    if (typeof data === 'object') {
      const errors = [];
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value))        errors.push(`${key}: ${value.join(', ')}`);
        else if (typeof value === 'string') errors.push(`${key}: ${value}`);
      }
      if (errors.length > 0) return errors.join('; ');
    }
  }

  return error.message || 'An error occurred';
};

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

      if (
        error.code === 'SESSION_EXPIRED' ||
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.response?.status === 404
      ) break;

      if (i < maxRetries && (error.code === 'NETWORK_ERROR' || error.response?.status >= 500)) {
        if (__DEV__) console.log(`🔄 Retrying... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }

      break;
    }
  }

  throw lastError;
};

export default api;