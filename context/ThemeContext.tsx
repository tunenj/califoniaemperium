// context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleDarkMode: () => void;
  allowScreenshot: boolean;
  setAllowScreenshot: (allow: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('system');
  const [allowScreenshot, setAllowScreenshot] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    if (theme === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    } else {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme, systemColorScheme]);

  const loadPreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedScreenshot = await AsyncStorage.getItem('allowScreenshot');
      
      if (savedTheme) setTheme(savedTheme as ThemeType);
      if (savedScreenshot !== null) setAllowScreenshot(savedScreenshot === 'true');
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
  };

  const handleSetTheme = async (newTheme: ThemeType) => {
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    handleSetTheme(newTheme);
  };

  const handleSetAllowScreenshot = async (allow: boolean) => {
    setAllowScreenshot(allow);
    await AsyncStorage.setItem('allowScreenshot', String(allow));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        setTheme: handleSetTheme,
        toggleDarkMode,
        allowScreenshot,
        setAllowScreenshot: handleSetAllowScreenshot,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};