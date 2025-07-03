import React, { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { useTheme } from "src/core/hooks/useTheme";
import { Text } from "../Text";
import { spacing, fontSize, fontWeight, radius } from "@core/design";

interface TimeInputProps {
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value = "",
  onChangeText,
  placeholder = "12:00",
  label,
  error,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  // Format time as user types (HH:MM format)
  const formatTime = (text: string): string => {
    // Remove all non-digits
    const digits = text.replace(/\D/g, "");

    if (digits.length === 0) return "";
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }

    // Limit to 4 digits (HHMM)
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  };

  // Validate and format the time
  const handleTimeChange = (text: string) => {
    const formatted = formatTime(text);

    // Basic validation for hours (00-23) and minutes (00-59)
    if (formatted.length === 5) {
      const [hours, minutes] = formatted.split(":");
      const h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);

      if (h > 23 || m > 59) return; // Invalid time
    }

    onChangeText?.(formatted);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? theme.colors.error
              : focused
              ? theme.colors.primary
              : theme.border,
            backgroundColor: disabled ? theme.surface : theme.colors.white,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={handleTimeChange}
          placeholder={placeholder}
          placeholderTextColor={theme.text.secondary}
          style={[
            styles.input,
            {
              color: disabled ? theme.text.secondary : theme.text.primary,
            },
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={!disabled}
          keyboardType="numeric"
          maxLength={5}
        />

        <View style={styles.timeIndicator}>
          <Text variant="caption" color={theme.text.secondary}>
            24h
          </Text>
        </View>
      </View>

      {error && (
        <Text variant="caption" color={theme.colors.error} style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    padding: 0,
  },
  timeIndicator: {
    paddingLeft: spacing.xs,
  },
  error: {
    marginTop: spacing.xs,
  },
});
