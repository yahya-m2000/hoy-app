/**
 * BottomSheetModal component for the Hoy application
 * Reusable component for modals that slide up from the bottom
 */

import React, { ReactNode } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fontSize } from "../constants/typography";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

const { height } = Dimensions.get("window");

interface BottomSheetModalProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  onSave?: () => void;
  saveText?: string;
  showSaveButton?: boolean;
  fullHeight?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  title,
  children,
  onClose,
  onSave,
  saveText = "Save",
  showSaveButton = true,
  fullHeight = false,
  disabled = false,
  loading = false,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    Keyboard.dismiss();
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleSave = () => {
    Keyboard.dismiss();
    if (onSave) {
      onSave();
    } else {
      router.back();
    }
  };

  // Calculate modal height and keyboard offset
  const modalHeight = fullHeight ? height * 0.9 : height * 0.75;
  const keyboardOffset = Platform.OS === "ios" ? -10 : 0;
  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      />

      <KeyboardAvoidingView
        // behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardOffset}
        style={styles.keyboardView}
      >
        <View
          style={[
            styles.modal,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[800]
                : theme.colors.grayPalette[50],
              paddingBottom: insets.bottom,
              height: modalHeight,
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600]}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.title,
                {
                  color: isDark
                    ? theme.colors.grayPalette[100]
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              {title}
            </Text>
            {showSaveButton && (
              <TouchableOpacity
                onPress={handleSave}
                style={styles.saveButton}
                disabled={disabled || loading}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                ) : (
                  <Text
                    style={[
                      styles.saveText,
                      {
                        color: disabled
                          ? isDark
                            ? theme.colors.grayPalette[600]
                            : theme.colors.grayPalette[400]
                          : theme.colors.primary,
                      },
                    ]}
                  >
                    {saveText}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {/* Empty view to maintain spacing when save button is hidden */}
            {!showSaveButton && <View style={styles.saveButton} />}
          </View>{" "}
          {/* Use ScrollView with flex: 1 to ensure content scrolls properly */}
          <View style={styles.content}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  keyboardView: {
    width: "100%",
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: spacing.xs,
  },
  saveButton: {
    padding: spacing.xs,
    minWidth: 50,
  },
  saveText: {
    fontSize: fontSize.md,
    fontWeight: "500",
    textAlign: "right",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});

export default BottomSheetModal;


