/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
    cardBackground: '#F9FAFB',
    icon: '#4B5563',
    primary: '#B13239',
    primaryLight: '#FEE2E2',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    gradient: ['#B13239', '#4D0812'] as const,
  },
  dark: {
    background: '#111827',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    card: '#1F2937',
    cardBackground: '#2D3748',
    icon: '#9CA3AF',
    primary: '#DC2626',
    primaryLight: '#451A1A',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    gradient: ['#1F2937', '#111827'] as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Type exports for TypeScript support
export type Theme = typeof Colors.light;
export type ColorScheme = keyof typeof Colors;