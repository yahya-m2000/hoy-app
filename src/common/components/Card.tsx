/**
 * Card Component
 * Reusable card component with title, icon, and optional tap action
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "../constants/spacing";
import { fontSize } from "../constants/typography";
import { radius } from "../constants/radius";
import { useTheme } from "../context/ThemeContext";

interface CardProps {
  title?: string;
  icon?: string;
  isLoading?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  plain?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  icon,
  isLoading = false,
  onPress,
  children,
  plain = false,
}) => {
  const { theme, isDark } = useTheme();
  const cardContent = (
    <>
      {!plain && title && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {icon && (
              <Ionicons
                name={icon as any}
                size={18}
                color={theme.colors.primary}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.title,
                { color: isDark ? theme.white : theme.colors.grayPalette[900] },
              ]}
            >
              {title}
            </Text>
          </View>
          {onPress && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[500]}
            />
          )}
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              {
                color: isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[500],
              },
            ]}
          >
            Loading...
          </Text>
        </View>
      ) : (
        children
      )}
    </>
  );

  return (
    <View
      style={[
        plain ? styles.plainContainer : styles.container,
        { backgroundColor: isDark ? theme.colors.gray[800] : theme.white },
      ]}
    >
      {onPress ? (
        <TouchableOpacity
          style={styles.touchable}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {cardContent}
        </TouchableOpacity>
      ) : (
        cardContent
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  plainContainer: {
    marginBottom: spacing.md,
  },
  touchable: {
    borderRadius: radius.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  loadingText: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
  },
});

export default Card;

