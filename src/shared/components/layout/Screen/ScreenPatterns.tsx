/**
 * Common Screen patterns and utilities
 * Pre-configured Screen components for common use cases
 */

import React from "react";
import Screen from "./Screen";
import { useRouter } from "expo-router";
import type { ScreenProps } from "./Screen.types";

/**
 * DetailScreen - For property details, booking details, etc.
 * Features configurable header variant (transparent by default)
 */
interface DetailScreenProps extends Omit<ScreenProps, "header"> {
  title: string;
  onFavorite?: () => void;
  onShare?: () => void;
  showFavorite?: boolean;
  showShare?: boolean;
  isFavorited?: boolean; // Add this prop to show filled/outline heart
  headerVariant?: "transparent" | "solid";
}

export const DetailScreen: React.FC<DetailScreenProps> = ({
  title,
  onFavorite,
  onShare,
  showFavorite = false,
  showShare = false,
  isFavorited = false,
  headerVariant = "transparent",
  children,
  ...props
}) => {
  const router = useRouter();

  return (
    <Screen
      scrollable
      padding="none"
      header={{
        variant: headerVariant,
        title,
        left: {
          icon: "arrow-back",
          onPress: () => router.back(),
        },
        right:
          showFavorite && onFavorite
            ? {
                icon: isFavorited ? "heart" : "heart-outline",
                onPress: onFavorite,
              }
            : showShare && onShare
            ? {
                icon: "share-outline",
                onPress: onShare,
              }
            : undefined,
        scrollThreshold: 200,
      }}
      {...props}
    >
      {children}
    </Screen>
  );
};

/**
 * ListScreen - For search results, property lists, etc.
 * Features solid header with search/filter options
 */
interface ListScreenProps extends Omit<ScreenProps, "header"> {
  title: string;
  onSearch?: () => void;
  onFilter?: () => void;
  showSearch?: boolean;
  showFilter?: boolean;
}

export const ListScreen: React.FC<ListScreenProps> = ({
  title,
  onSearch,
  onFilter,
  showSearch = false,
  showFilter = false,
  children,
  ...props
}) => {
  const router = useRouter();

  return (
    <Screen
      scrollable={props.scrollable !== false}
      padding={props.padding || "medium"}
      header={{
        variant: "solid",
        title,
        left: {
          icon: "arrow-back",
          onPress: () => router.back(),
        },
        right:
          showSearch && onSearch
            ? {
                icon: "search",
                onPress: onSearch,
              }
            : showFilter && onFilter
            ? {
                icon: "options",
                onPress: onFilter,
              }
            : undefined,
      }}
      {...props}
    >
      {children}
    </Screen>
  );
};

/**
 * FormScreen - For settings, profile edit, etc.
 * Features minimal header for clean form experience
 */
interface FormScreenProps extends Omit<ScreenProps, "header"> {
  title: string;
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  showSave?: boolean;
}

export const FormScreen: React.FC<FormScreenProps> = ({
  title,
  onSave,
  onCancel,
  saveLabel = "Save",
  showSave = false,
  children,
  ...props
}) => {
  const router = useRouter();

  return (
    <Screen
      scrollable={props.scrollable !== false}
      padding={props.padding || "medium"}
      header={{
        variant: "minimal",
        title,
        left: {
          text: "Cancel",
          onPress: onCancel || (() => router.back()),
        },
        right:
          showSave && onSave
            ? {
                text: saveLabel,
                onPress: onSave,
              }
            : undefined,
        showDivider: false,
      }}
      {...props}
    >
      {children}
    </Screen>
  );
};

/**
 * ModalScreen - For full-screen modals
 * Features modal-style header with close button
 */
interface ModalScreenProps extends Omit<ScreenProps, "header"> {
  title: string;
  onClose?: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export const ModalScreen: React.FC<ModalScreenProps> = ({
  title,
  onClose,
  rightAction,
  children,
  ...props
}) => {
  const router = useRouter();

  return (
    <Screen
      scrollable={props.scrollable !== false}
      padding={props.padding || "medium"}
      header={{
        variant: "solid",
        title,
        left: {
          icon: "close",
          onPress: onClose || (() => router.back()),
        },
        right: rightAction
          ? {
              text: rightAction.label,
              onPress: rightAction.onPress,
            }
          : undefined,
      }}
      {...props}
    >
      {children}
    </Screen>
  );
};
