/**
 * Card Component
 * Base card component built using base components
 * All other cards should extend from this
 */

// React
import React from "react";

// React Native
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from "react-native";

// Context
import { useTheme } from "@shared/context";

// Constants
import { radius, spacing } from "@shared/constants";

// Base components
import { Container } from "../../base/Container";
import { Text } from "../../base/Text";
import { Icon } from "../../base/Icon";

// Types
import { BaseCardProps } from "./Card.types";

const Card: React.FC<BaseCardProps> = ({
  title,
  icon,
  isLoading = false,
  onPress,
  children,
  variant = "default",
  disabled = false,
  padding = "medium",
  style,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const getCardVariantStyle = () => {
    switch (variant) {
      case "elevated":
        return [styles.elevated];
      case "outlined":
        return [
          styles.outlined,
          {
            borderColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[200],
          },
        ];
      case "plain":
        return [styles.plain];
      default:
        return [styles.default];
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case "none":
        return { padding: 0 };
      case "small":
        return { padding: spacing.sm };
      case "large":
        return { padding: spacing.lg };
      default:
        return { padding: spacing.md };
    }
  };

  const renderHeader = () => {
    if (!title && !icon) return null;

    return (
      <View
        style={[
          styles.header,
          {
            borderBottomColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[200],
          },
        ]}
      >
        <View style={styles.headerContent}>
          {icon && (
            <Icon
              name="chevron-forward" // Using a valid icon name since icon prop might be arbitrary string
              size={16}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600]
              }
              style={styles.headerIcon}
            />
          )}
          {title && (
            <Text variant="h4" weight="semibold">
              {title}
            </Text>
          )}
        </View>
        {onPress && (
          <Icon
            name="chevron-forward"
            size={16}
            color={
              isDark
                ? theme.colors.grayPalette[400]
                : theme.colors.grayPalette[500]
            }
          />
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text
            variant="body"
            color={
              isDark
                ? theme.colors.grayPalette[400]
                : theme.colors.grayPalette[500]
            }
            style={styles.loadingText}
          >
            Loading...
          </Text>
        </View>
      );
    }

    return children;
  };

  const cardContent = (
    <>
      {renderHeader()}
      <Container style={getPaddingStyle()}>{renderContent()}</Container>
    </>
  );
  const combinedStyles = [
    styles.container,
    ...getCardVariantStyle(),
    { backgroundColor: isDark ? theme.colors.grayPalette[800] : theme.white },
  ];

  if (style) {
    combinedStyles.push(style as any);
  }

  return (
    <Container style={combinedStyles}>
      {onPress ? (
        <TouchableOpacity
          style={styles.touchable}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.7}
          testID={testID}
        >
          {cardContent}
        </TouchableOpacity>
      ) : (
        <View testID={testID}>{cardContent}</View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  default: {
    backgroundColor: "transparent",
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outlined: {
    borderWidth: 1,
  },
  plain: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  touchable: {
    borderRadius: radius.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: spacing.xs,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  loadingText: {
    marginTop: spacing.xs,
  },
});

export default Card;
