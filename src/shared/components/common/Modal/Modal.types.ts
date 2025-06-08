/**
 * Modal component types
 */

import { ReactNode } from "react";
import { ViewStyle } from "react-native";

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  animationType?: "none" | "slide" | "fade";
  contentStyle?: ViewStyle;
  testID?: string;
}

export interface ModalHeaderProps {
  title?: string;
  showCloseButton?: boolean;
  onClose: () => void;
}

export interface ModalContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface BottomSheetModalProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  onSave?: () => void;
  saveText?: string;
  showSaveButton?: boolean;
  fullHeight?: boolean;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}
