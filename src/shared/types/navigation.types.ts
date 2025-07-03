// Navigation UI types
export interface TabConfig {
  name: string;
  label: string;
  icon: string;
  component: React.ComponentType;
}

export interface HeaderConfig {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  actions?: Array<{
    icon: string;
    onPress: () => void;
  }>;
}
