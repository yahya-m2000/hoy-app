import React from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HeaderProps } from "./Header.types";
import { useTheme } from "@core/hooks/useTheme";
import { Icon } from "../../base/Icon";
import { Container } from "../Container";
import { Text } from "../../base/Text";
import { spacing, iconSize, radius } from "@core/design";

/**
 * Header component with multiple variants and smooth transitions
 * Supports icons, text, and custom content on both sides
 * Variants: solid, transparent, minimal, modal, none
 */
const Header: React.FC<HeaderProps> = ({
  title,
  titleStyle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  showDivider = false,
  style,
  testID,
  variant = "solid",
  left,
  right,
  backgroundColor,
  useSafeArea = true,
  safeAreaTop,
  scrollPosition = 0,
  scrollThreshold = 50,
  ...props
}) => {
  // Hooks
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Animated values for smooth transitions
  const headerOpacity = React.useRef(new Animated.Value(0)).current;
  const blurOpacity = React.useRef(new Animated.Value(1)).current;

  // Calculate smooth opacity based on scroll position for transparent variant
  React.useEffect(() => {
    if (variant !== "transparent") return;

    const progress = Math.min(Math.max(scrollPosition / scrollThreshold, 0), 1);

    // Header background: fade in as we scroll
    Animated.timing(headerOpacity, {
      toValue: progress,
      duration: 0, // Immediate for smooth following
      useNativeDriver: false,
    }).start();

    // Icon blur: fade out as we scroll
    Animated.timing(blurOpacity, {
      toValue: 1 - progress,
      duration: 0, // Immediate for smooth following
      useNativeDriver: true,
    }).start();
  }, [scrollPosition, variant, scrollThreshold, headerOpacity, blurOpacity]);

  // Get header background color based on variant and theme
  const getHeaderBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;

    if (variant === "transparent") {
      const baseColor = isDark ? "#1a1a1a" : "#ffffff";
      return headerOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: [
          isDark ? "rgba(26,26,26,0)" : "rgba(255,255,255,0)",
          baseColor,
        ],
      });
    }

    if (variant === "minimal") return theme.colors?.gray?.[200] || "#f5f5f5";
    return isDark ? theme.colors?.gray?.[900] || "#1a1a1a" : "#ffffff";
  };

  // Calculate header padding top
  const getHeaderPaddingTop = () => {
    return useSafeArea
      ? safeAreaTop !== undefined
        ? safeAreaTop
        : insets.top
      : 0;
  };

  // Render icon with consistent background container for all variants
  const renderIcon = (
    icon: keyof typeof Ionicons.glyphMap,
    onPress?: () => void,
    position: "left" | "right" = "left"
  ) => {
    const iconComponent = (
      <Icon
        name={icon}
        size={iconSize.sm}
        color={theme.text.primary}
        background={false}
      />
    );

    // Always wrap with a container for consistent spacing and background
    const wrappedIcon = (
      <View style={styles.iconContainer}>
        {variant === "transparent" ? (
          // Transparent headers get blur background
          <Animated.View
            style={[styles.blurContainer, { opacity: blurOpacity }]}
          >
            <BlurView intensity={80} tint="light" style={styles.blurView} />
          </Animated.View>
        ) : (
          // Solid headers get transparent background to maintain consistent sizing
          <View style={styles.solidContainer} />
        )}
        <View style={styles.iconWrapper}>{iconComponent}</View>
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          style={
            variant === "modal" ? styles.modalIconButton : styles.iconButton
          }
          testID={`header-${position}-button`}
        >
          {wrappedIcon}
        </TouchableOpacity>
      );
    }

    return wrappedIcon;
  };

  // Render content based on type (icon, text, or custom)
  const renderContent = (
    content?: any,
    fallbackIcon?: keyof typeof Ionicons.glyphMap,
    fallbackOnPress?: () => void,
    position: "left" | "right" = "left"
  ) => {
    if (content?.children) {
      return content.children;
    }

    if (content?.icon || fallbackIcon) {
      const icon = content?.icon || fallbackIcon;
      const onPress = content?.onPress || fallbackOnPress;
      return renderIcon(icon, onPress, position);
    }

    if (content?.text) {
      return (
        <Text variant="button" color="primary">
          {content.text}
        </Text>
      );
    }

    return null;
  };

  if (variant === "none") {
    return null;
  }

  const isAbsolutePositioned = variant === "transparent";
  const headerPaddingTop = getHeaderPaddingTop();

  return (
    <Container
      style={[
        ...(isAbsolutePositioned ? [styles.absoluteHeader] : []),
        ...(style ? [style] : []),
      ]}
      {...props}
    >
      <Animated.View
        style={[
          styles.headerContent,
          variant === "modal" && styles.modalHeaderContent,
          {
            paddingTop: headerPaddingTop,
            backgroundColor: getHeaderBackgroundColor(),
          },
        ]}
      >
        {/* Left Section */}
        <Container
          style={
            variant === "modal" ? styles.modalLeftSection : styles.leftSection
          }
        >
          {renderContent(left, leftIcon, onLeftPress, "left")}
        </Container>

        {/* Center Section */}
        <Container
          style={
            variant === "modal"
              ? styles.modalCenterSection
              : styles.centerSection
          }
        >
          {title && (
            <Text
              variant="h6"
              weight="semibold"
              align="center"
              numberOfLines={1}
              style={titleStyle}
            >
              {title}
            </Text>
          )}
        </Container>

        {/* Right Section */}
        <Container
          style={
            variant === "modal" ? styles.modalRightSection : styles.rightSection
          }
        >
          {renderContent(right, rightIcon, onRightPress, "right")}
        </Container>
      </Animated.View>

      {/* Optional Divider */}
      {showDivider && (
        <Animated.View
          style={[
            styles.divider,
            {
              backgroundColor:
                variant === "transparent"
                  ? headerOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        "rgba(229,229,229,0)",
                        theme.colors?.gray?.[200] || "#e5e5e5",
                      ],
                    })
                  : theme.colors?.gray?.[200] || "#e5e5e5",
            },
          ]}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  // Header Container Styles
  absoluteHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },

  // Header Content Styles
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md, // Only for non-modal headers
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm, // Use vertical padding instead of bottom-only
    paddingBottom: 0, // Override the paddingBottom from headerContent
    minHeight: 56,
  },

  // Section Styles - Regular Layout
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
  },

  // Section Styles - Modal Layout
  modalLeftSection: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  modalCenterSection: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalRightSection: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  // Icon Container Styles
  iconContainer: {
    position: "relative",
    width: iconSize.sm + spacing.xs * 2,
    height: iconSize.sm + spacing.xs * 2,
    borderRadius: radius.circle,
    overflow: "hidden",
  },
  iconWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  // Icon Background Styles
  blurContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  solidContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    borderRadius: radius.circle,
  },
  blurView: {
    flex: 1,
    borderRadius: radius.circle,
  },

  // Button Styles
  iconButton: {
    marginHorizontal: -spacing.sm,
  },
  modalIconButton: {
    marginHorizontal: 0,
  },

  // Divider Style
  divider: {
    height: 1,
  },
});

// ========================================
// EXPORTS
// ========================================
export { Header };
export default Header;
