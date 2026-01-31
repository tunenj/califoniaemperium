// components/CustomToast.tsx
import React from 'react';
import { Dimensions, Platform } from 'react-native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const TOAST_MARGIN_TOP = Platform.OS === 'ios' ? 60 : 80;

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#4CAF50', 
        backgroundColor: '#E8F5E9',
        marginTop: TOAST_MARGIN_TOP,
        marginHorizontal: 20,
        borderRadius: 10,
        width: width - 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 12 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#2E7D32'
      }}
      text2Style={{
        fontSize: 13,
        color: '#388E3C',
        marginTop: 2,
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ 
        borderLeftColor: '#F44336', 
        backgroundColor: '#FFEBEE',
        marginTop: TOAST_MARGIN_TOP,
        marginHorizontal: 20,
        borderRadius: 10,
        width: width - 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 12 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#C62828'
      }}
      text2Style={{
        fontSize: 13,
        color: '#D32F2F',
        marginTop: 2,
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#2196F3', 
        backgroundColor: '#E3F2FD',
        marginTop: TOAST_MARGIN_TOP,
        marginHorizontal: 20,
        borderRadius: 10,
        width: width - 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 12 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#1565C0'
      }}
      text2Style={{
        fontSize: 13,
        color: '#1976D2',
        marginTop: 2,
      }}
    />
  ),
};

export const CustomToast = () => (
  <Toast 
    config={toastConfig}
    topOffset={TOAST_MARGIN_TOP}
    visibilityTime={3000}
    autoHide={true}
  />
);