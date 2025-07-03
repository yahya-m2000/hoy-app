// Shared UI component prop types
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

export interface BaseComponentProps {
  style?: ViewStyle | TextStyle | ImageStyle;
  testID?: string;
}

// ContainerProps is defined in components/layout/Container
// Remove duplicate to avoid export conflicts

export interface ButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

export interface TextProps extends BaseComponentProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  color?: string;
  numberOfLines?: number;
}
