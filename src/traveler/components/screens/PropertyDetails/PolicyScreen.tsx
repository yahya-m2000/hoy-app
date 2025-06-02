import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

interface PolicyScreenProps {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  children: React.ReactNode;
  onClose: () => void;
}

const PolicyScreen: React.FC<PolicyScreenProps> = ({
  title,
  icon,
  children,
  onClose,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[900]
            : theme.colors.white,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[800]
              : theme.colors.white,
            borderBottomColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[200],
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <MaterialIcons
            name={icon}
            size={24}
            color={theme.colors.primary}
            style={styles.headerIcon}
          />
          <Text
            style={[
              styles.headerTitle,
              {
                color: isDark
                  ? theme.colors.grayPalette[100]
                  : theme.colors.grayPalette[900],
              },
            ]}
          >
            {title}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.closeButton,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.grayPalette[100],
            },
          ]}
          onPress={onClose}
        >
          <MaterialIcons
            name="close"
            size={20}
            color={
              isDark
                ? theme.colors.grayPalette[300]
                : theme.colors.grayPalette[600]
            }
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

// Policy content components
interface PolicySectionProps {
  title: string;
  children: React.ReactNode;
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  title,
  children,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDark
              ? theme.colors.grayPalette[100]
              : theme.colors.grayPalette[900],
          },
        ]}
      >
        {title}
      </Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

interface PolicyItemProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  highlight?: boolean;
}

export const PolicyItem: React.FC<PolicyItemProps> = ({
  icon,
  title,
  description,
  highlight = false,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.policyItem,
        highlight && {
          backgroundColor: isDark
            ? theme.colors.grayPalette[800]
            : theme.colors.grayPalette[50],
        },
      ]}
    >
      <View style={styles.policyItemHeader}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={
              highlight
                ? theme.colors.primary
                : isDark
                ? theme.colors.grayPalette[400]
                : theme.colors.grayPalette[600]
            }
            style={styles.policyItemIcon}
          />
        )}
        <Text
          style={[
            styles.policyItemTitle,
            {
              color: isDark
                ? theme.colors.grayPalette[100]
                : theme.colors.grayPalette[900],
            },
            highlight && { color: theme.colors.primary },
          ]}
        >
          {title}
        </Text>
      </View>
      <Text
        style={[
          styles.policyItemDescription,
          {
            color: isDark
              ? theme.colors.grayPalette[300]
              : theme.colors.grayPalette[600],
          },
        ]}
      >
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  sectionContent: {
    gap: spacing.sm,
  },
  policyItem: {
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  policyItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  policyItemIcon: {
    marginRight: spacing.sm,
  },
  policyItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  policyItemDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: spacing.xs,
  },
});

export default PolicyScreen;
