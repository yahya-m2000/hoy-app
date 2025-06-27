import type { HostSettingsAction } from "./types";

export const SETTINGS_ACTIONS: Record<HostSettingsAction, HostSettingsAction> =
  {
    "switch-to-traveler": "switch-to-traveler",
    "host-profile": "host-profile",
    policies: "policies",
    properties: "properties",
    calendar: "calendar",
    pricing: "pricing",
    payouts: "payouts",
    taxes: "taxes",
    notifications: "notifications",
    support: "support",
    resources: "resources",
    "show-qr-code": "show-qr-code",
  } as const;

export const SECTION_KEYS = {
  HOST_MANAGEMENT: "host_management",
  HOST_TOOLS: "host_tools",
  PREFERENCES: "preferences",
  ROLE_SWITCH: "role_switch",
} as const;
