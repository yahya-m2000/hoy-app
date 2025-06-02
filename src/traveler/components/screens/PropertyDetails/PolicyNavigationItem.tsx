import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";

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
  const { theme, isDark } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.policySection}>
      <TouchableOpacity
        style={[
          styles.policyButton,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[800]
              : theme.colors.white,
            borderColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[200],
          },
        ]}
        onPress={() => router.push(route as any)}
      >
        <View style={styles.policyButtonContent}>
          <MaterialIcons
            name={icon}
            size={24}
            color={theme.colors.primary}
            style={styles.policyIcon}
          />
          <View style={styles.policyTextContainer}>
            <Text
              style={[
                styles.policyTitle,
                {
                  color: isDark
                    ? theme.colors.grayPalette[100]
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.policySubtitle,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                },
              ]}
            >
              {subtitle}
            </Text>
          </View>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={
            isDark
              ? theme.colors.grayPalette[400]
              : theme.colors.grayPalette[600]
          }
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  policySection: {
    // marginVertical: spacing.sm,
  },
  policyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderWidth: 1,
    // borderRadius: radius.md,
  },
  policyButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  policyIcon: {
    marginRight: spacing.sm,
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
