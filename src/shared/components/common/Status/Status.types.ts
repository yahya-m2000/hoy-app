/**
 * Status component types
 */

export interface OfflineNoticeProps {
  style?: any;
  textStyle?: any;
}

export interface ConnectionStatusProps {
  isConnected: boolean;
  showOfflineMessage?: boolean;
  customOfflineMessage?: string;
}
