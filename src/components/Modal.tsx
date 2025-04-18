/**
 * Modal component for the Hoy application
 * Used for dialogs, settings panels, and other overlay content
 */

import React from "react";
import {
  View,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  Text,
  Pressable,
  ViewStyle,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import spacing from "../constants/spacing";
import radius from "../constants/radius";
import typography, { fontSize, fontWeight } from "../constants/typography";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  animationType?: "none" | "slide" | "fade";
  contentStyle?: ViewStyle;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  animationType = "fade",
  contentStyle,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: isDark
                ? theme.colors.gray[800]
                : theme.colors.gray[50],
              shadowColor: isDark
                ? theme.colors.gray[900]
                : theme.colors.gray[900],
            },
            contentStyle,
          ]}
        >
          {(title || showCloseButton) && (
            <View
              style={[
                styles.header,
                {
                  borderBottomColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
                },
              ]}
            >
              {title && (
                <Text
                  style={[
                    styles.title,
                    {
                      color: isDark
                        ? theme.colors.gray[50]
                        : theme.colors.gray[900],
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>
              )}

              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.closeButtonText,
                      {
                        color: isDark
                          ? theme.colors.gray[400]
                          : theme.colors.gray[600],
                      },
                    ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  contentContainer: {
    width: "90%",
    maxWidth: 400,
    borderRadius: radius.lg,
    overflow: "hidden",
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: String(fontWeight.semibold) as any,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: fontSize.lg,
    fontWeight: String(fontWeight.normal) as any,
    lineHeight: 24,
    textAlign: "center",
  },
  content: {
    padding: spacing.lg,
  },
});

export default Modal;
