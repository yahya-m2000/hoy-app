/**
 * Font loading utilities for the Hoy application
 * Handles loading static Satoshi font family
 */

import * as Font from "expo-font";

// Font family mappings for static fonts
export const FontFamily = {
  "Satoshi-Black": "Satoshi-Black",
  "Satoshi-BlackItalic": "Satoshi-BlackItalic",
  "Satoshi-Bold": "Satoshi-Bold",
  "Satoshi-BoldItalic": "Satoshi-BoldItalic",
  "Satoshi-Italic": "Satoshi-Italic",
  "Satoshi-Light": "Satoshi-Light",
  "Satoshi-LightItalic": "Satoshi-LightItalic",
  "Satoshi-Medium": "Satoshi-Medium",
  "Satoshi-MediumItalic": "Satoshi-MediumItalic",
  "Satoshi-Regular": "Satoshi-Regular",
} as const;

// Font loading function
export const loadFonts = async (): Promise<void> => {
  try {
    await Font.loadAsync({
      "Satoshi-Black": require("../../../assets/fonts/Satoshi-Black.ttf"),
      "Satoshi-BlackItalic": require("../../../assets/fonts/Satoshi-BlackItalic.ttf"),
      "Satoshi-Bold": require("../../../assets/fonts/Satoshi-Bold.ttf"),
      "Satoshi-BoldItalic": require("../../../assets/fonts/Satoshi-BoldItalic.ttf"),
      "Satoshi-Italic": require("../../../assets/fonts/Satoshi-Italic.ttf"),
      "Satoshi-Light": require("../../../assets/fonts/Satoshi-Light.ttf"),
      "Satoshi-LightItalic": require("../../../assets/fonts/Satoshi-LightItalic.ttf"),
      "Satoshi-Medium": require("../../../assets/fonts/Satoshi-Medium.ttf"),
      "Satoshi-MediumItalic": require("../../../assets/fonts/Satoshi-MediumItalic.ttf"),
      "Satoshi-Regular": require("../../../assets/fonts/Satoshi-Regular.ttf"),
    });
    console.log("✅ Satoshi fonts loaded successfully");
  } catch (error) {
    console.error("❌ Error loading fonts:", error);
    throw error;
  }
};

// Helper function to get correct font family based on weight and style
export const getFontFamily = (
  weight: string = "normal",
  italic: boolean = false
): string => {
  const weightMap: { [key: string]: string } = {
    // Numeric weights
    "100": "Light",
    "200": "Light",
    "300": "Light",
    "400": "Regular",
    "500": "Medium",
    "600": "Medium", // We don't have SemiBold, so use Medium
    "700": "Bold",
    "800": "Black",
    "900": "Black",
    // Named weights
    thin: "Light",
    light: "Light",
    normal: "Regular",
    regular: "Regular",
    medium: "Medium",
    semibold: "Medium", // Map semibold to Medium since we don't have SemiBold
    bold: "Bold",
    heavy: "Black",
    black: "Black",
  };

  const fontWeight = weightMap[weight] || "Regular";
  const suffix = italic ? "Italic" : "";

  const fontName = `Satoshi-${fontWeight}${suffix}`;
  console.log(
    `🎨 Font requested: weight="${weight}", italic=${italic} → ${fontName}`
  );

  return fontName;
};

export default {
  FontFamily,
  loadFonts,
  getFontFamily,
};
