import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@shared/context";

// Constants
import { fontSize, spacing, radius, fontWeight } from "@shared/constants";

interface PolicyNavigationItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  route: string;
  withDivider?: boolean;
}

const PolicyNavigationItem: React.FC<PolicyNavigationItemProps> = ({
  icon,
  title,
  subtitle,
  route,
  withDivider = false,
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  const styles = createStyles(theme);

  return (
    <View style={styles.policySection}>
      <TouchableOpacity
        style={styles.policyButton}
        onPress={() => router.push(route as any)}
      >
        <View style={styles.policyButtonContent}>
          <MaterialIcons
            name={icon}
            size={24}
            color={theme.colors.gray[500]}
            style={styles.policyIcon}
          />
          <View style={styles.policyTextContainer}>
            <Text style={[styles.policyTitle, { color: theme.text.primary }]}>
              {title}
            </Text>
            <Text
              style={[styles.policySubtitle, { color: theme.text.secondary }]}
            >
              {subtitle}
            </Text>
          </View>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={theme.colors.gray[400]}
        />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    policySection: {
      marginBottom: spacing.sm,
    },
    policyButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
      backgroundColor: theme.background.primary,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.gray[200],
      shadowColor: theme.isDark ? theme.colors.gray[800] : "#000000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    policyButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    policyIcon: {
      marginRight: spacing.md,
    },
    policyTextContainer: {
      flex: 1,
    },
    policyTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    policySubtitle: {
      fontSize: 14,
      opacity: 0.7,
    },
  });

export default PolicyNavigationItem;
