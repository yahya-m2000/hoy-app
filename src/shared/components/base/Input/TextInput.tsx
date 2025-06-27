/**
 * TextInput component for the Hoy application
 * Supports icons, error states, and field validation
 */

// React
import React, { useState } from "react";

// React Native
import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { Text } from "@shared/components/base/Text";

// Context
import { useTheme } from "@shared/hooks/useTheme";

// Constants
import { radius, fontSize, fontWeight, spacing } from "@shared/constants";

// Types
import { TextInputProps } from "./Input.types";

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  required = false,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  // Handle input focus and blur
  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (props.onBlur) props.onBlur(e);
  };

  // Calculate border color based on state
  const getBorderColor = () => {
    if (error) return theme.error;
    if (isFocused) return theme.primary[500];
    return theme.colors.gray[400];
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text
            style={[styles.label, { color: theme.text.primary }, labelStyle]}
          >
            {label}
            {required && <Text style={{ color: theme.error }}> *</Text>}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: theme.background,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <RNTextInput
          {...props}
          style={[
            styles.input,
            {
              color: theme.text.primary,
              paddingLeft: leftIcon ? 0 : spacing.md,
              paddingRight: rightIcon ? 0 : spacing.md,
            },
            inputStyle,
          ]}
          placeholderTextColor={theme.text.secondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: theme.error }, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: "100%",
  },
  labelContainer: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
  },
  leftIcon: {
    paddingLeft: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIcon: {
    paddingRight: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
  },
});

export default TextInput;
