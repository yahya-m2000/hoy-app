/**
 * SearchBar component for the Hoy application
 * Used on the home screen and search screen
 */

import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ViewStyle,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import radius from "../constants/radius";
import spacing from "../constants/spacing";
import typography, { fontSize } from "../constants/typography";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
  editable?: boolean;
  onSubmit?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search",
  value,
  onChangeText,
  onFocus,
  onBlur,
  onPress,
  style,
  editable = true,
  onSubmit,
}) => {
  const { theme, isDark } = useTheme();

  const Container = onPress ? Pressable : View;

  return (
    <Container
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[200],
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
        },
        style,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name="search"
        size={18}
        color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
        style={styles.icon}
      />

      <TextInput
        style={[
          styles.input,
          {
            color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={
          isDark ? theme.colors.gray[500] : theme.colors.gray[500]
        }
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        editable={editable}
        onSubmitEditing={onSubmit}
      />

      {value ? (
        <TouchableOpacity
          onPress={() => onChangeText && onChangeText("")}
          style={styles.clearButton}
        >
          <Ionicons
            name="close-circle"
            size={16}
            color={isDark ? theme.colors.gray[500] : theme.colors.gray[600]}
          />
        </TouchableOpacity>
      ) : null}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  icon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    height: "100%",
    padding: 0, // Remove default padding for cleaner look
  },
  clearButton: {
    padding: spacing.xs,
  },
});

export default SearchBar;
