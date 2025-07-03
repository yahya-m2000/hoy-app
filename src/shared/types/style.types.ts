// Style-related types
export type ThemeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ThemeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ThemeVariant = 'filled' | 'outline' | 'ghost' | 'text';

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeShadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}
