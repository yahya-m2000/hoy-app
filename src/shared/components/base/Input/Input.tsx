/**
 * Base Input component for the Hoy application
 * Uses React Native Elements Input with custom styling
 */

// React
import React, { useState, useRef, useCallback } from "react";

// React Native
import { Animated } from "react-native";

// React Native Elements
import { Input as RNEInput } from "@rneui/themed";

// Context
import { useTheme } from "@shared/hooks/useTheme";

// Constants
import { spacing, radius, fontSize, fontWeight } from "@shared/constants";

// Base components
import { Container } from "../Container";

// Types
import type { BaseInputProps } from "./Input.types";

export const Input: React.FC<BaseInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = true,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Animate label position and size
  const animateLabel = useCallback(
    (toTop: boolean) => {
      Animated.timing(labelAnimation, {
        toValue: toTop ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    },
    [labelAnimation]
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    animateLabel(true);
  }, [animateLabel]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!value) {
      animateLabel(false);
    }
  }, [value, animateLabel]);

  // Handle text change
  const handleTextChange = useCallback(
    (text: string) => {
      if (onChangeText) {
        onChangeText(text);
      }
      if (text && !isFocused) {
        animateLabel(true);
      } else if (!text && !isFocused) {
        animateLabel(false);
      }
    },
    [onChangeText, isFocused, animateLabel]
  );

  return (
    <Container style={style} marginBottom={error ? "xs" : "md"}>
      <RNEInput
        value={value}
        onChangeText={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        label={label && `${label}${required ? " *" : ""}`}
        errorMessage={error}
        disabled={disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        // Custom styling
        containerStyle={{
          paddingHorizontal: 0,
          marginBottom: 0,
        }}
        inputContainerStyle={{
          backgroundColor: theme.background,
          borderColor: theme.text?.primary || theme.primary,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          minHeight: multiline ? 100 : 59, // Increased minimum height for better pressability
          borderBottomWidth: 1, // Override RNE default
        }}
        inputStyle={{
          fontSize: fontSize.md, // Changed to body/md size as requested
          color: theme.text?.primary || theme.primary,
          fontWeight: fontWeight.medium,
          paddingVertical: spacing.sm,
          paddingLeft: leftIcon ? spacing.sm : 0, // Better spacing for placeholder alignment
          ...inputStyle,
        }}
        labelStyle={{
          fontSize: fontSize.sm,
          color: theme.text?.secondary || theme.secondary,
          fontWeight: fontWeight.medium,
          marginBottom: spacing.xs,
          ...labelStyle,
        }}
        errorStyle={{
          fontSize: fontSize.xs,
          color: theme.error,
          marginTop: spacing.xs,
          marginLeft: spacing.xs,
          ...errorStyle,
        }}
        placeholderTextColor={theme.text?.secondary || theme.secondary}
        renderErrorMessage={!!error}
        // Custom icon rendering
        leftIconContainerStyle={{
          marginRight: spacing.xs,
        }}
        rightIconContainerStyle={{
          marginLeft: spacing.xs,
        }}
        {...(leftIcon && {
          leftIcon: leftIcon as any,
        })}
        {...(rightIcon && {
          rightIcon: rightIcon as any,
        })}
        {...props}
      />
    </Container>
  );
};
