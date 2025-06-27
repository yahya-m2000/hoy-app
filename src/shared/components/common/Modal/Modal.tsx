/**
 * Enhanced Modal Component
 * Full-screen modal with keyboard awareness, auto-scroll, and modern styling
 * Perfect for forms, collections, and content that requires keyboard interaction
 */

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@shared/hooks/useTheme";
import { Text } from "@shared/components/base";
import { spacing } from "@shared/constants";
import { ModalProps, ModalRef } from "./Modal.types";

const ModalComponent = forwardRef<ModalRef, ModalProps>(
  (
    {
      visible,
      onClose,
      title,
      children,
      showCloseButton = true,
      animationType = "slide",
      presentationStyle = "pageSheet",
      contentStyle,
      enableKeyboardAware = true,
      enableAutoScroll = true,
      testID,
    },
    ref
  ) => {
    const { theme, isDark } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);

    // Expose scroll methods through ref
    useImperativeHandle(ref, () => ({
      scrollToEnd: (animated = true) => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated });
        }, 100);
      },
      scrollTo: (options) => {
        scrollViewRef.current?.scrollTo(options);
      },
    }));

    const renderHeader = () => {
      if (!title && !showCloseButton) return null;

      return (
        <View
          style={[
            styles.header,
            {
              borderBottomColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
              backgroundColor: isDark ? theme.colors.gray[900] : "white",
            },
          ]}
        >
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? theme.colors.gray[50] : theme.colors.gray[900]}
              />
            </TouchableOpacity>
          )}

          {title && (
            <Text
              variant="h3"
              weight="semibold"
              style={[
                styles.title,
                {
                  color: isDark
                    ? theme.colors.gray[50]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {title}
            </Text>
          )}

          {showCloseButton && <View style={styles.placeholder} />}
        </View>
      );
    };

    const renderContent = () => {
      if (enableAutoScroll) {
        return (
          <ScrollView
            ref={scrollViewRef}
            style={[
              styles.scrollContent,
              {
                backgroundColor: isDark ? theme.colors.gray[900] : "white",
              },
              contentStyle,
            ]}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            {children}
          </ScrollView>
        );
      }

      return (
        <View
          style={[
            styles.content,
            {
              backgroundColor: isDark ? theme.colors.gray[900] : "white",
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      );
    };

    const modalContent = (
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: isDark ? theme.colors.gray[900] : "white",
          },
        ]}
      >
        {renderHeader()}
        {renderContent()}
      </View>
    );

    return (
      <Modal
        visible={visible}
        animationType={animationType}
        presentationStyle={presentationStyle}
        onRequestClose={onClose}
        testID={testID}
      >
        {enableKeyboardAware ? (
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            {modalContent}
          </KeyboardAvoidingView>
        ) : (
          modalContent
        )}
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "transparent",
    // Ensure z-index is below the toast's z-index (9999)
    zIndex: 9000,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    backgroundColor: "white",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.md,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: "white",
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xl * 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: "white",
  },
});

ModalComponent.displayName = "Modal";

export default ModalComponent;
