// React
import React, { useState, useRef, useCallback } from "react";

// React Native
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Components
import { Text } from "../../base/Text";
import { Button } from "../../base/Button";
import { Icon } from "../../base/Icon";
import { Header } from "../Header";

// Hooks
import { useTheme } from "src/core/hooks/useTheme";

// Constants
import { spacing } from "@core/design";

// Types
import { ScreenProps } from "./Screen.types";

const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  useSafeArea = true,
  backgroundColor,
  padding = "medium",
  header,
  scrollable = false,
  scrollProps,
  onScroll,
  loading = false,
  error = null,
  emptyState,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [scrollPosition, setScrollPosition] = useState(0);

  // Handle scroll events for transparent headers
  const handleScroll = useCallback(
    (event: any) => {
      const scrollPos = event.nativeEvent.contentOffset.y;
      scrollY.setValue(scrollPos);
      setScrollPosition(scrollPos);
      onScroll?.(scrollPos);
    },
    [scrollY, onScroll]
  );

  const paddingStyle = {
    none: 0,
    small: spacing.xs,
    medium: spacing.md,
    large: spacing.lg,
  }[padding];

  const screenBackgroundColor =
    backgroundColor ||
    (isDark
      ? theme.colors.gray?.[900] || "#1a1a1a"
      : theme.colors.gray?.[50] || "#ffffff");

  // Render header based on variant
  const renderHeader = () => {
    if (!header || header.variant === "none") return null;

    const {
      variant = "solid",
      title,
      left,
      right,
      scrollThreshold = 50,
    } = header;

    const isTransparent = variant === "transparent";
    const scrolled = scrollPosition > scrollThreshold;
    return (
      <Header
        title={title}
        variant={variant}
        left={left}
        right={right}
        backgroundColor={header.backgroundColor}
        isTransparent={isTransparent}
        useSafeArea={useSafeArea}
        safeAreaTop={useSafeArea ? insets.top : 0}
        scrolled={scrolled}
        scrollPosition={scrollPosition}
        scrollThreshold={scrollThreshold}
        showDivider={header.showDivider !== false}
      />
    );
  };

  // Render loading state
  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: screenBackgroundColor },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={
            typeof theme.colors.primary === "string"
              ? theme.colors.primary
              : "#007AFF"
          }
        />
        <Text
          style={[
            styles.stateText,
            { color: theme.text?.secondary || "#666666" },
          ]}
        >
          Loading...
        </Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: screenBackgroundColor },
        ]}
      >
        <Icon
          name="alert-circle-outline"
          size={48}
          color={theme.colors.error || "#FF3B30"}
        />
        <Text
          style={[
            styles.stateTitle,
            { color: theme.text?.primary || "#000000" },
          ]}
        >
          Something went wrong
        </Text>
        <Text
          style={[
            styles.stateText,
            { color: theme.text?.secondary || "#666666" },
          ]}
        >
          {error}
        </Text>
      </View>
    );
  }

  // Render empty state
  if (emptyState && React.Children.count(children) === 0) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: screenBackgroundColor },
        ]}
      >
        <Text
          style={[
            styles.stateTitle,
            { color: theme.text?.primary || "#000000" },
          ]}
        >
          {emptyState.title}
        </Text>
        {emptyState.subtitle && (
          <Text
            style={[
              styles.stateText,
              { color: theme.text?.secondary || "#666666" },
            ]}
          >
            {emptyState.subtitle}
          </Text>
        )}
        {emptyState.action && (
          <Button
            title={emptyState.action.label}
            onPress={emptyState.action.onPress}
            style={styles.stateButton}
          />
        )}
      </View>
    );
  }
  const WrapperComponent = View; // Always use View, no SafeAreaView
  const ContentComponent = scrollable ? ScrollView : View;

  // Only add top padding for transparent headers (since they're absolutely positioned)
  // const isTransparentHeader = header?.variant === "transparent";

  return (
    <WrapperComponent
      style={[styles.screen, { backgroundColor: screenBackgroundColor }, style]}
    >
      {renderHeader()}
      <ContentComponent
        {...(scrollable ? scrollProps : {})}
        showsVerticalScrollIndicator={false}
        style={[
          scrollable ? styles.scrollView : styles.content,
          {
            backgroundColor: screenBackgroundColor,
            // Only add padding for transparent headers that are absolutely positioned
          },
        ]}
        contentContainerStyle={
          scrollable
            ? [styles.scrollContent, { padding: paddingStyle }]
            : { padding: paddingStyle }
        }
        onScroll={
          scrollable
            ? Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false, listener: handleScroll }
              )
            : undefined
        }
        scrollEventThrottle={scrollable ? 16 : undefined}
      >
        {children}
      </ContentComponent>
    </WrapperComponent>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  headerButton: {
    padding: spacing.xs,
    borderRadius: 8,
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: spacing.md,
    textAlign: "center",
  },
  stateText: {
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  stateButton: {
    marginTop: spacing.lg,
  },
});

export default Screen;
