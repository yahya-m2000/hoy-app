export interface CustomHeaderProps {
  title: string;
  onBackPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  showBackButton?: boolean;
  style?: any;
}

export interface CollectionHeaderProps {
  title: string;
  propertyCount?: number;
}
