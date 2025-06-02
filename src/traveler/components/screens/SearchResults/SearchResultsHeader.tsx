import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@common/context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";

interface SearchResultsHeaderProps {
  title: string;
}

export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  title,
}) => {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
          borderBottomColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[200],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={isDark ? theme.colors.gray[100] : theme.colors.gray[800]}
        />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.title,
            {
              color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
  },
});
