import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  fontSize,
  fontWeight,
  wireframe,
  primary,
  gray,
  spacing,
} from "@shared/constants";
import { BottomSheetModalProps } from "./Modal.types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  testID,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleSave = () => {
    if (onSave && !disabled && !loading) {
      onSave();
    }
  };

  // Calculate modal height - simpler approach
  const modalHeight = fullHeight
    ? SCREEN_HEIGHT - insets.top - 20 // Leave some space from top
    : Math.min(SCREEN_HEIGHT * 0.75, SCREEN_HEIGHT - insets.top - 100);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View style={[styles.modal, { height: modalHeight }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={wireframe.text.secondary}
              />
            </TouchableOpacity>

            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            {showSaveButton && onSave ? (
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (disabled || loading) && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={disabled || loading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text
                  style={[
                    styles.saveText,
                    (disabled || loading) && styles.saveTextDisabled,
                  ]}
                >
                  {loading ? "..." : saveText}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: wireframe.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  modal: {
    backgroundColor: wireframe.background,
    width: "100%",
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: wireframe.text.primary,
    textAlign: "center",
    flex: 1,
    marginHorizontal: 16,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: primary[500],
    minWidth: 60,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: gray[300],
  },
  saveText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: wireframe.text.inverse,
  },
  saveTextDisabled: {
    color: wireframe.text.disabled,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
  content: {
    flex: 1,
  },
});

export default BottomSheetModal;
