/**
 * SECURE CONFIGURATION EXAMPLE
 * Copy this file to secure.config.ts and fill in your actual values
 *
 * This example shows the structure of sensitive configuration
 * The actual secure.config.ts file should NOT be committed to the repository
 */

export const SECURE_CONFIG = {
  // API Configuration - REPLACE WITH YOUR ACTUAL API URL
  API_BASE_URL: "https://your-api-domain.com/api/v1",

  // External Service Keys - REPLACE WITH YOUR ACTUAL KEYS
  MAPBOX_API_KEY: "your_mapbox_api_key_here",

  // Other sensitive configuration
  // Add any other sensitive URLs, keys, tokens here
} as const;

export type SecureConfig = typeof SECURE_CONFIG;
