/**
 * Font loading hook for the Hoy application
 * Handles loading custom fonts and provides loading state
 */

import { useState, useEffect } from 'react';
import { fontUtils } from '@shared/utils';

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await fontUtils.loadFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.error('Failed to load fonts:', error);
        setFontError(error instanceof Error ? error.message : 'Unknown font loading error');
        // Set fontsLoaded to true even on error to allow app to continue with fallback fonts
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  return {
    fontsLoaded,
    fontError,
  };
};

export default useFonts;