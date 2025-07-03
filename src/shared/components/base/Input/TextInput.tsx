/**
 * Base Input component for the Hoy application
 * Uses React Native Paper TextInput with custom styling
 */

// React
import React, { useState, useRef, useCallback } from "react";

// React Native
import { Animated } from "react-native";

// React Native Paper
import {
  TextInput as RNEInput,
  useTheme as usePaperTheme,
} from "react-native-paper";

// Context
import { useTheme } from "src/core/hooks/useTheme";

// Constants
import { spacing, radius, fontSize, fontWeight } from "@core/design";

// Base components
import { Container } from "../../layout";

// Types
import type { BaseInputProps } from "./Input.types";

export const TextInput: React.FC<BaseInputProps> = ({
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
  const paperTheme = usePaperTheme();
  const [isFocused, setIsFocused] = useState(false);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Create custom theme for this input
  const customTheme = {
    ...paperTheme,
    colors: {
      ...paperTheme.colors,
      primary: theme.primary,
      onSurface: theme.text?.primary || theme.primary,
      onSurfaceVariant: theme.text?.secondary || theme.secondary,
      error: theme.error,
      outline: error
        ? theme.error
        : isFocused
        ? theme.primary
        : theme.text?.secondary || theme.secondary,
    },
  };

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
    <Container style={style} marginBottom={error ? "xs" : "xs"}>
      <RNEInput
        theme={customTheme}
        value={value}
        onChangeText={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        label={label && `${label}${required ? " *" : ""}`}
        error={!!error}
        disabled={disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        mode="outlined"
        // Custom styling
        style={{
          backgroundColor: theme.background,
          fontSize: fontSize.md,
          color: theme.text?.primary || theme.primary,
          fontWeight: fontWeight.light,
        }}
        outlineStyle={{
          borderRadius: radius.md,
          borderColor: error
            ? theme.error
            : isFocused
            ? theme.primary
            : theme.text?.secondary || theme.secondary,
        }}
        placeholderTextColor={theme.text?.secondary || theme.secondary}
        // Custom icon rendering
        left={
          leftIcon ? <RNEInput.Icon icon={leftIcon as string} /> : undefined
        }
        right={
          rightIcon ? (
            <RNEInput.Icon
              icon={rightIcon as string}
              onPress={onRightIconPress}
            />
          ) : undefined
        }
        {...props}
      />
      {error && (
        <Container
          marginTop="xs"
          marginLeft="xs"
          style={{
            fontSize: fontSize.xs,
            color: theme.error,
            ...errorStyle,
          }}
        >
          {error}
        </Container>
      )}
    </Container>
  );
};
