// toastHelper.ts
import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

/**
 * Show a cross-platform toast message
 * @param message - The main toast text
 * @param type - 'success' | 'error' | 'info' (default: 'success')
 */
export const showToast = (message: string, type: ToastType = 'success'): void => {
  Toast.show({
    type,
    text1: message,
    text2: '', // Add empty text2 to avoid errors
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
  });
};

// Optional: You can also create specific helper functions
export const showSuccessToast = (message: string): void => {
  showToast(message, 'success');
};

export const showErrorToast = (message: string): void => {
  showToast(message, 'error');
};

export const showInfoToast = (message: string): void => {
  showToast(message, 'info');
};