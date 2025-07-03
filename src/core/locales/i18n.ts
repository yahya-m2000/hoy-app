/**
 * i18n configuration for the Hoy application
 * Supports multiple languages and locale switching
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { LanguageDetectorAsyncModule } from "i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import translations
import en from "./en/translation.json";
import fr from "./fr/translation.json";
import ar from "./ar/translation.json";
import { logger } from "../utils/sys/log";

const LANGUAGE_STORAGE_KEY = "hoy_language";

// Create language detection plugin
const languageDetector: LanguageDetectorAsyncModule = {
  type: "languageDetector",
  async: true,
  detect: (callback) => {
    (async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLanguage) {
          return callback(storedLanguage);
        }
      } catch (error) {
        logger.error("Error reading language from storage:", error);
      }

      // If no stored language, use device locale
      const deviceLocale = Localization.locale.split("-")[0];
      callback(deviceLocale);
    })();
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      logger.error("Error storing language:", error);
    }
  },
};

// Initialize i18n
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Custom hook for handling language
export const useLanguage = () => {
  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    supportedLanguages: [
      { code: "en", name: "English", nativeName: "English", isRTL: false },
      { code: "fr", name: "French", nativeName: "Français", isRTL: false },
      { code: "ar", name: "Arabic", nativeName: "العربية", isRTL: true },
    ],
  };
};
