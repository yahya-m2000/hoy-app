/**
 * Modern Toast Component
 * A sleek notification component optimized for layered toast systems
 */

import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "src/core/hooks/useTheme";
import { Container } from "../../layout";
import { Text } from "../../base/Text";
import { Icon } from "../../base/Icon";
import { AnimatedContainer } from "../../display";
import { spacing, radius } from "@core/design";

// Define shadows locally since it's not exported
const shadows = {
  medium: {
    // Android
    elevation: 12,
    // iOS
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
};

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  children?: React.ReactNode;
  message?: string;
  type?: ToastType;
  duration?: number;
  visible: boolean;
  onHide?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  showCloseButton?: boolean;
  disableInternalAnimation?: boolean; // New prop for layered systems
  fade?: boolean; // New prop for fade transitions
}

const Toast: React.FC<ToastProps> = ({
  children,
  message,
  type = "info",
  visible,
  onHide,
  action,
  showCloseButton = true,
  disableInternalAnimation = false, // Default to false for backward compatibility
  fade = false, // Default to false for backward compatibility
}) => {
  // We must always call hooks unconditionally
  const themeResult = useTheme();
  // Fallback values to avoid runtime crashes when ThemeProvider is unavailable
  const { theme, isDark } = themeResult || {
    theme: {
      colors: {
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
        primary: "#3b82f6",
        gray: { 400: "#9ca3af" },
      },
      text: { primary: "#000000", secondary: "#3b82f6" },
      background: "#ffffff",
    },
    isDark: false,
  };

  const [shouldRender, setShouldRender] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);

  // Handle visibility changes with proper cleanup
  React.useEffect(() => {
    let exitTimer: NodeJS.Timeout | null = null;

    if (visible) {
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender && !disableInternalAnimation) {
      // Only use internal animation if not disabled
      setIsExiting(true);
      exitTimer = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, 350);
    } else if (shouldRender && disableInternalAnimation) {
      // For layered systems, immediately hide without animation
      setShouldRender(false);
      setIsExiting(false);
    }

    return () => {
      if (exitTimer) {
        clearTimeout(exitTimer);
      }
    };
  }, [visible, shouldRender, disableInternalAnimation]);

  // Auto-hide timer with proper cleanup
  React.useEffect(() => {
    let autoHideTimer: NodeJS.Timeout | null = null;

    if (visible && onHide && !disableInternalAnimation) {
      autoHideTimer = setTimeout(() => {
        onHide();
      }, 4000); // Default 4 seconds
    }

    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [visible, onHide, disableInternalAnimation]);

  // Get colors based on toast type - only used for default message display
  const getColors = () => {
    switch (type) {
      case "success":
        return {
          iconColor: theme.colors.success,
          textColor: theme.text.primary,
          iconName: "checkmark-circle" as const,
        };
      case "error":
        return {
          iconColor: theme.colors.error,
          textColor: theme.text.primary,
          iconName: "alert-circle" as const,
        };
      case "warning":
        return {
          iconColor: theme.colors.warning,
          textColor: theme.text.primary,
          iconName: "warning" as const,
        };
      default: // info
        return {
          iconColor: theme.colors.primary,
          textColor: theme.text.primary,
          iconName: "information-circle" as const,
        };
    }
  };

  const colors = getColors();

  if (!shouldRender) return null;

  // Use AnimatedContainer only if internal animation is not disabled
  const ToastContainer = disableInternalAnimation
    ? Container
    : AnimatedContainer;
  const containerProps = disableInternalAnimation
    ? {}
    : {
        animationType: "slideUp" as const,
        animationDuration: 350,
        slideDistance: 60,
        isExiting,
      };

  return (
    <ToastContainer
      {...containerProps}
      style={[
        styles.container,
        {
          ...shadows.medium,
          shadowColor: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.15)",
          zIndex: 9999, // Ensure high z-index
          opacity: fade ? 0.5 : 1, // Apply fade effect
        },
      ]}
    >
      {/* Background container with blur effect */}
      <Container
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: theme.background,
            borderRadius: radius.lg,
            overflow: "hidden",
          },
        ]}
      >
        {isDark && (
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
        )}
      </Container>

      <Container style={styles.content}>
        {/* Render children if provided, otherwise render default message layout */}
        {children ? (
          children
        ) : (
          <Container flexDirection="row" alignItems="center">
            {/* Icon */}
            <Container marginRight="sm">
              <Icon name={colors.iconName} size={20} color={colors.iconColor} />
            </Container>

            {/* Message */}
            <Container flex={1} marginRight="sm">
              <Text
                variant="body"
                weight="medium"
                color={colors.textColor}
                numberOfLines={2}
                style={styles.message}
              >
                {message}
              </Text>
            </Container>

            {/* Action button */}
            {action && (
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.iconColor }]}
                onPress={action.onPress}
                accessibilityRole="button"
              >
                <Text
                  variant="caption"
                  weight="semibold"
                  color={colors.iconColor}
                  style={styles.actionText}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            )}
          </Container>
        )}

        {/* Close button */}
        {showCloseButton && onHide && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onHide}
            accessibilityLabel="Close notification"
            accessibilityRole="button"
          >
            <Icon name="close" size={16} color={theme.text.secondary} />
          </TouchableOpacity>
        )}
      </Container>
    </ToastContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
  },
  content: {
    position: "relative",
    zIndex: 1, // Ensure content is above background
  },
  message: {
    lineHeight: 20,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  actionText: {
    textTransform: "uppercase",
  },
  closeButton: {
    position: "absolute",
    top: -spacing.xs,
    right: -spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.sm,
    zIndex: 2, // Ensure close button is above everything
  },
});

export default Toast;
