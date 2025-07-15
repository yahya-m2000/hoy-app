/**
 * i18n configuration for the Hoy application
 * Supports multiple languages and locale switching
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { LanguageDetectorAsyncModule } from "i18next";
import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import translations
import en from "./en";
import fr from "./fr/translation.json";
import ar from "./ar/translation.json";
import so from "./so";
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
      const deviceLocale = getLocales()[0]?.languageCode || "en";
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
const initI18n = async () => {
  try {
    await i18n
      .use(languageDetector)
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          fr: { translation: fr },
          ar: { translation: ar },
          so: { translation: so },
        },
        fallbackLng: "en",
        debug: false,
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
        keySeparator: ".",
        nsSeparator: ":",
      });
    
    logger.info("i18n initialized successfully");
    logger.info("Available languages:", Object.keys(i18n.options.resources || {}));
    logger.info("Current language:", i18n.language);
    
    // Test a translation to ensure it's working
    const testTranslation = i18n.t("common.save");
    logger.info("Test translation (common.save):", testTranslation);
    
  } catch (error) {
    logger.error("Error initializing i18n:", error);
  }
};

// Initialize i18n immediately
initI18n();

export default i18n;

// Custom hook for handling language
export const useLanguage = () => {
  const changeLanguage = async (language: string) => {
    try {
      // Change the language
      await i18n.changeLanguage(language);
      
      // Cache the language selection
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      
      logger.info(`Language changed to: ${language}`);
    } catch (error) {
      logger.error("Error changing language:", error);
      throw error;
    }
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    supportedLanguages: [
      { code: "en", name: "English", nativeName: "English", isRTL: false },
      { code: "fr", name: "French", nativeName: "Français", isRTL: false },
      { code: "ar", name: "Arabic", nativeName: "العربية", isRTL: true },
      { code: "so", name: "Somali", nativeName: "Soomaali", isRTL: false },
    ],
  };
};
