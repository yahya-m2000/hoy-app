import type { AccountAction } from "@core/types";

// Unified settings actions for both host and traveler modes
export const ACCOUNT_ACTIONS: Record<AccountAction, AccountAction> = {
  // Common actions
  "edit-profile": "edit-profile",
  "personal-info": "personal-info",
  notifications: "notifications",
  "payment-methods": "payment-methods",
  privacy: "privacy",
  security: "security",
  language: "language",
  currency: "currency",
  support: "support",
  about: "about",
  terms: "terms",
  "privacy-policy": "privacy-policy",
  logout: "logout",
  "delete-account": "delete-account",
  
  // Host-specific actions
  "switch-to-traveler": "switch-to-traveler",
  "host-profile": "host-profile",
  policies: "policies",
  properties: "properties",
  calendar: "calendar",
  pricing: "pricing",
  payouts: "payouts",
  taxes: "taxes",
  "host-resources": "host-resources",
  "show-qr-code": "show-qr-code",
  
  // Traveler-specific actions
  "switch-to-host": "switch-to-host",
  "booking-history": "booking-history",
  wishlist: "wishlist",
  reviews: "reviews",
  "travel-preferences": "travel-preferences",
} as const;

// Section keys for organizing settings
export const SECTION_KEYS = {
  PROFILE: "profile",
  HOST_MANAGEMENT: "host_management",
  HOST_TOOLS: "host_tools",
  TRAVELER_ACTIVITY: "traveler_activity",
  PREFERENCES: "preferences",
  ACCOUNT_SETTINGS: "account_settings",
  SUPPORT: "support",
  ROLE_SWITCH: "role_switch",
} as const; 