import type { User } from "@shared/types";

export interface HostSettingsItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  action: () => void;
}

export interface HostSettingsSection {
  title: string;
  items: HostSettingsItem[];
}

export type HostSettingsAction =
  | "switch-to-traveler"
  | "host-profile"
  | "policies"
  | "properties"
  | "calendar"
  | "pricing"
  | "payouts"
  | "taxes"
  | "notifications"
  | "support"
  | "resources"
  | "show-qr-code";

export interface HostProfileHeaderProps {
  user: User | null;
  loading: boolean;
  onQRCodePress: () => void;
}
