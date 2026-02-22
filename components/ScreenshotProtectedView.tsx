// components/ScreenshotProtectedView.tsx
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface ScreenshotProtectedViewProps extends ViewProps {
  children: React.ReactNode;
}

export const ScreenshotProtectedView = ({ children, style, ...props }: ScreenshotProtectedViewProps) => {
  const { allowScreenshot } = useTheme();

  return (
    <View
      {...props}
      style={style}
      // @ts-ignore - React Native View prop for screenshot prevention
      importantForAccessibility={allowScreenshot ? 'yes' : 'no-hide-descendants'}
      accessible={allowScreenshot}
    >
      {children}
    </View>
  );
};