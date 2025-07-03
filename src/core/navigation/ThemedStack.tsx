/**
 * Themed Stack Component
 * Automatically applies CustomHeader styling to native headers
 *
 * @module @core/navigation/ThemedStack
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React from "react";
import { Stack } from "expo-router";
import { useThemedScreenOptions } from "./NavigationTheme";

interface ThemedStackProps {
  children: React.ReactNode;
  screenOptions?: any;
}

interface ThemedStackScreenProps {
  name: string;
  options?: any;
}

/**
 * Themed Stack that automatically applies CustomHeader styling
 */
export function ThemedStack({
  children,
  screenOptions = {},
  ...props
}: ThemedStackProps) {
  const themedScreenOptions = useThemedScreenOptions();

  const mergedScreenOptions = {
    ...themedScreenOptions,
    ...screenOptions,
  };

  return (
    <Stack screenOptions={mergedScreenOptions} {...props}>
      {children}
    </Stack>
  );
}

/**
 * Themed Stack Screen that applies theme when headerShown is true
 */
export function ThemedStackScreen({
  options = {},
  ...props
}: ThemedStackScreenProps) {
  const themedScreenOptions = useThemedScreenOptions();

  // Only apply theme if headerShown is true
  const finalOptions = options.headerShown
    ? { ...themedScreenOptions, ...options }
    : options;

  return <Stack.Screen options={finalOptions} {...props} />;
}

// Export both components
// Re-export removed to prevent circular dependency - import directly from NavigationTheme
