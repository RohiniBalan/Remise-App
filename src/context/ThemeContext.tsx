import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../utils/storage';
import { CustomerColors } from '../styles/theme';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  teal: string;
  teal600: string;
  teal700: string;
  mint: string;
  steelBorder: string;
  bg: string;
  card: string;
  white: string;
  black: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  inputBg: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  warning: string;
  warningBg: string;
}

export const LightThemeColors: ThemeColors = {
  ...CustomerColors,
  bg: '#F5F5F5',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#EAEAEA',
  inputBg: '#FFFFFF',
};

export const DarkThemeColors: ThemeColors = {
  ...CustomerColors,
  bg: '#0a0f1d',
  card: '#111827',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#1F2937',
  steelBorder: '#374151',
  mint: 'rgba(15, 163, 177, 0.15)',
  inputBg: '#1F2937',
};

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  isLight: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  isLight: true,
  colors: LightThemeColors,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    storage.getTheme().then((saved) => {
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved);
      } else if (systemScheme === 'dark') {
        setThemeState('dark');
      }
    }).catch(() => {});
  }, [systemScheme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    storage.setTheme(next).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      storage.setTheme(next).catch(() => {});
      return next;
    });
  }, []);

  const isDark = theme === 'dark';
  const isLight = !isDark;
  const colors = useMemo(() => (isDark ? DarkThemeColors : LightThemeColors), [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, isLight, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
