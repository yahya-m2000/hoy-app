/**
 * Asset Helper Utilities
 * Helper functions for safely loading assets and handling fallbacks
 */

/**
 * Safely load an image asset with fallback handling
 * This prevents the "Requiring unknown module undefined" error by wrapping the require in a try/catch
 *
 * @param getImageFn A function that returns a require statement
 * @returns The image source or null if an error occurs
 */
export function safelyLoadImage(getImageFn: () => any): any {
  try {
    return getImageFn();
  } catch (error) {
    console.warn(`Failed to load image asset: ${error}`);
    return null;
  }
}

/**
 * Get card brand logo safely
 * If the image doesn't exist, returns null and logs a warning
 *
 * @param brand The card brand (visa, mastercard, etc.)
 * @returns The image source or null if not found
 */
export function getCardLogoSource(brand: string): any {
  if (!brand) return null;

  // const brandLower = brand.toLowerCase();

  return safelyLoadImage(() => {
    // When you have the actual image files, uncomment and use this code
    /*
    switch (brandLower) {
      case "visa":
        return require("../assets/payment-logos/visa.png");
      case "mastercard":
        return require("../assets/payment-logos/mastercard.png");
      case "amex":
      case "american express":
        return require("../assets/payment-logos/amex.png");
      case "discover":
        return require("../assets/payment-logos/discover.png");
      default:
        return require("../assets/payment-logos/generic-card.png");
    }
    */

    // For now, return null to force the text fallback
    return null;
  });
}
