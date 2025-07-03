import React from "react";
import { Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@core/hooks";
import { spacing } from "@core/design";

export type FilterType =
  | "all"
  | "checkingOut"
  | "currentlyHosting"
  | "arrivingSoon"
  | "upcoming"
  | "pendingReview";

export interface FilterTab {
  key: FilterType;
  label: string;
  count: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  noPaddingHorizontal?: boolean; // For when parent already has padding
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeFilter,
  onFilterChange,
  noPaddingHorizontal = false,
}) => {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        noPaddingHorizontal && styles.contentNoPadding,
      ]}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            { borderColor: theme.border },
            activeFilter === tab.key && {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={() => onFilterChange(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeFilter === tab.key ? "#FFFFFF" : theme.text.primary,
              },
            ]}
          >
            {tab.label}
          </Text>
          {tab.count > 0 && (
            <Text
              style={[
                styles.tabCount,
                {
                  color:
                    activeFilter === tab.key ? "#FFFFFF" : theme.text.secondary,
                },
              ]}
            >
              {tab.count}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 50,
    marginBottom: spacing.md,
  },
  content: {
    // paddingHorizontal: spacing.xs,
  },
  contentNoPadding: {
    paddingHorizontal: 0,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabCount: {
    fontSize: 12,
    marginLeft: spacing.xs,
  },
});

export default FilterTabs;
