/**
 * Toast component and context for the Hoy application
 * Provides an app-wide notification system
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ViewStyle,
} from "react-native";
import { useTheme } from "./ThemeContext";
import spacing from "../constants/spacing";
import radius from "../constants/radius";
import typography, { fontSize, fontWeight } from "../constants/typography";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, "id">) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast item component
const ToastItem: React.FC<{
  toast: ToastProps;
  onHide: () => void;
  style?: ViewStyle;
}> = ({ toast, onHide, style }) => {
  const { theme, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Fade in and slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after duration (if specified)
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleHide();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleHide = () => {
    // Fade out and slide down
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  // Get background color based on type
  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return isDark ? theme.success[700] : theme.success[100];
      case "error":
        return isDark ? theme.error[700] : theme.error[100];
      case "warning":
        return isDark ? theme.warning[700] : theme.warning[100];
      case "info":
        return isDark ? theme.info[700] : theme.info[100];
    }
  };

  // Get border color based on type
  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return theme.success[500];
      case "error":
        return theme.error[500];
      case "warning":
        return theme.warning[500];
      case "info":
        return theme.info[500];
    }
  };

  // Get text color based on type
  const getTextColor = () => {
    if (isDark) return theme.white;

    switch (toast.type) {
      case "success":
        return theme.success[800];
      case "error":
        return theme.error[800];
      case "warning":
        return theme.warning[800];
      case "info":
        return theme.info[800];
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(),
          borderLeftColor: getBorderColor(),
          shadowColor: isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.2)",
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[styles.message, { color: getTextColor() }]}
          numberOfLines={2}
        >
          {toast.message}
        </Text>

        {toast.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              toast.action?.onPress();
              handleHide();
            }}
            accessibilityRole="button"
          >
            <Text style={[styles.actionText, { color: getBorderColor() }]}>
              {toast.action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleHide}
        accessibilityLabel="Close notification"
        accessibilityRole="button"
      >
        <Text style={[styles.closeText, { color: getTextColor() }]}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Toast provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Generate unique ID for each toast
  const generateId = () =>
    `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Show a new toast
  const showToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = generateId();
    setToasts((prev) => [
      ...prev,
      {
        ...toast,
        id,
        duration: toast.duration === undefined ? 5000 : toast.duration,
      },
    ]);
  }, []);

  // Hide a specific toast
  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Hide all toasts
  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        hideAllToasts,
      }}
    >
      {children}
      {toasts.length > 0 && (
        <SafeAreaView style={styles.container} pointerEvents="box-none">
          <View style={styles.toastsWrapper} pointerEvents="box-none">
            {toasts.map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onHide={() => hideToast(toast.id)}
                style={{
                  marginBottom:
                    toasts.indexOf(toast) < toasts.length - 1 ? spacing.sm : 0,
                }}
              />
            ))}
          </View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 10,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
  },
  toastsWrapper: {
    width: "90%",
    maxWidth: 400,
  },
  toast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  message: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.medium) as any,
    paddingRight: spacing.sm,
  },
  actionButton: {
    marginLeft: spacing.xs,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.bold) as any,
  },
  closeButton: {
    padding: spacing.xxs,
  },
  closeText: {
    fontSize: fontSize.md,
    fontWeight: String(fontWeight.thin) as any,
  },
});

export default ToastContext;
