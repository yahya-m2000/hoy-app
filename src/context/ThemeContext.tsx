/**
 * Theme Context for the Hoy application
 * Provides theme access and toggling capabilities throughout the app
 */

import { createContext, useState, useContext, ReactNode } from "react";
import { useColorScheme } from "react-native";
import { theme } from "../constants/colors";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  theme: typeof theme.light;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  // Determine if dark mode is active based on system or user preference
  const isDark =
    mode === "system" ? systemColorScheme === "dark" : mode === "dark";

  // Get the theme based on dark mode status
  const currentTheme = isDark ? theme.dark : theme.light;

  // Toggle between light and dark
  const toggleTheme = () => {
    setMode((prev) => {
      if (prev === "system") return "light";
      if (prev === "light") return "dark";
      return "system";
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme: currentTheme,
        isDark,
        setMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
