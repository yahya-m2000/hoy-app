/**
 * Toast context for the Hoy application
 * Provides an app-wide notification system using the base Toast component
 *
 * DEVELOPER NOTE:
 * This toast system is designed to appear above ALL other UI elements including modals.
 * It uses a high z-index (9999) and is rendered at the root level of the application
 * to ensure it's always visible regardless of what's on screen.
 *
 * If you're creating new modal or overlay components, ensure their z-index is lower
 * than 9999 to avoid blocking toast messages.
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { View, StyleSheet, SafeAreaView, Platform } from "react-native";
import Toast, { type ToastType } from "../components/base/Toast/Toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

// Custom hook to use toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Date.now().toString();
    const newToast: ToastProps = {
      ...toast,
      id,
      duration: toast.duration || 4000,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    hideAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      {toasts.length > 0 && (
        <View style={[styles.overlay, { pointerEvents: "box-none" }]}>
          <SafeAreaView
            style={[styles.container, { top: insets.top }]}
            pointerEvents="box-none"
          >
            {toasts.map((toast) => (
              <View key={toast.id} style={styles.toastWrapper}>
                <Toast
                  visible={true}
                  message={toast.message}
                  type={toast.type}
                  action={toast.action}
                  onHide={() => hideToast(toast.id)}
                  showCloseButton={true}
                />
              </View>
            ))}
          </SafeAreaView>
        </View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 999999,
  },
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 999999,
    elevation: 999999,
    paddingTop: Platform.OS === "ios" ? 0 : 20,
  },
  toastWrapper: {
    marginBottom: 8,
  },
});
