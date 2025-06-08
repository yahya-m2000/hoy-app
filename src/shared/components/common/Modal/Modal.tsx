/**
 * Modal component for the Hoy application
 * Used for dialogs, settings panels, and other overlay content
 */

// React
import React from "react";

// React Native
import {
  View,
  StyleSheet,
  Modal as RNModal,
  Pressable,
  TouchableOpacity,
} from "react-native";

// Context
import { useTheme } from "@shared/context";

// Constants
import { radius, spacing } from "@shared/constants";

// Base components
import { Text } from "../../base/Text";
import { Icon } from "../../base/Icon";

// Types
import { ModalProps } from "./Modal.types";

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  animationType = "fade",
  contentStyle,
  testID,
}) => {
  const { theme, isDark } = useTheme();

  const renderHeader = () => {
    if (!title && !showCloseButton) return null;

    return (
      <View
        style={[
          styles.header,
          {
            borderBottomColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[200],
          },
        ]}
      >
        {title && (
          <Text
            variant="h3"
            weight="semibold"
            color={
              isDark
                ? theme.colors.grayPalette[50]
                : theme.colors.grayPalette[900]
            }
            numberOfLines={1}
            style={styles.title}
          >
            {title}
          </Text>
        )}{" "}
        {showCloseButton && (
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close modal"
            accessibilityRole="button"
          >
            <Icon
              name="close"
              size={20}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600]
              }
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      testID={testID}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />{" "}
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[800]
                : theme.colors.grayPalette[50],
              shadowColor: isDark
                ? theme.colors.grayPalette[900]
                : theme.colors.grayPalette[900],
            },
            contentStyle,
          ]}
        >
          {renderHeader()}
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
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
});

export default Modal;
