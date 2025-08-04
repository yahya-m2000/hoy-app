/**
 * Navigation Bar Theme Hook
 * Manages Android system navigation bar appearance to match app theme
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useTheme } from './useTheme';

// Dynamic import to avoid issues on iOS
const getNavigationBar = async () => {
  if (Platform.OS === 'android') {
    try {
      return await import('expo-navigation-bar');
    } catch (error) {
      console.warn('expo-navigation-bar not available:', error);
      return null;
    }
  }
  return null;
};

export const useNavigationBarTheme = () => {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const updateNavigationBar = async () => {
      try {
        const NavigationBar = await getNavigationBar();
        if (!NavigationBar) return;

        // Set navigation bar background color to match app theme
        const backgroundColor = isDark ? theme.colors.gray[900] : theme.white;
        
        await NavigationBar.setBackgroundColorAsync(backgroundColor);
        
        // Set navigation bar style (light/dark) based on theme
        await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
        
      } catch (error) {
        console.warn('Failed to update navigation bar theme:', error);
      }
    };

    updateNavigationBar();
  }, [isDark, theme]);

  return {
    updateNavigationBarTheme: async (customColor?: string) => {
      if (Platform.OS !== 'android') return;
      
      try {
        const NavigationBar = await getNavigationBar();
        if (!NavigationBar) return;
        
        const color = customColor || (isDark ? theme.colors.gray[900] : theme.white);
        await NavigationBar.setBackgroundColorAsync(color);
      } catch (error) {
        console.warn('Failed to update navigation bar with custom color:', error);
      }
    }
  };
};