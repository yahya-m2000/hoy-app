import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/context";
import { spacing, fontSize, radius } from "@shared/constants";

import { RecentSearch } from "./RecentSearchManager";

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSearchSelect: (search: RecentSearch) => void;
  onRemoveSearch: (id: string) => void;
  onClearAll: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSearchSelect,
  onRemoveSearch,
  onClearAll,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const handleClearAll = () => {
    Alert.alert(
      t("search.clearRecentSearches") || "Clear Recent Searches",
      t("search.clearRecentSearchesMessage") ||
        "Are you sure you want to clear all recent searches?",
      [
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("common.clear") || "Clear",
          style: "destructive",
          onPress: onClearAll,
        },
      ]
    );
  };

  const handleRemoveSearch = (id: string, location: string) => {
    Alert.alert(
      t("search.removeSearch") || "Remove Search",
      t("search.removeSearchMessage", { location }) ||
        `Remove "${location}" from recent searches?`,
      [
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("common.remove") || "Remove",
          style: "destructive",
          onPress: () => onRemoveSearch(id),
        },
      ]
    );
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return days === 1 ? "1 day ago" : `${days} days ago`;
    } else if (hours > 0) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    } else if (minutes > 0) {
      return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    } else {
      return "Just now";
    }
  };

  const renderRecentSearchItem = ({ item }: { item: RecentSearch }) => (
    <TouchableOpacity
      style={[
        styles.recentSearchItem,
        {
          backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
        },
      ]}
      onPress={() => onSearchSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.searchContent}>
        <View style={styles.searchIcon}>
          <Ionicons
            name="time-outline"
            size={20}
            color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
          />
        </View>
        <View style={styles.searchDetails}>
          <Text
            style={[
              styles.searchLocation,
              {
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
            numberOfLines={1}
          >
            {item.location}
          </Text>
          <Text
            style={[
              styles.searchInfo,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
            numberOfLines={1}
          >
            {item.displayDates} • {item.displayTravelers}
          </Text>
          <Text
            style={[
              styles.searchTime,
              {
                color: isDark ? theme.colors.gray[500] : theme.colors.gray[500],
              },
            ]}
          >
            {formatTimeAgo(item.timestamp)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveSearch(item.id, item.location)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="close"
          size={16}
          color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (searches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
            },
          ]}
        >
          {t("search.recentSearches") || "Recent Searches"}
        </Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={[styles.clearAll, { color: theme.colors.primary[500] }]}>
            {t("search.clear") || "Clear All"}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={searches}
        renderItem={renderRecentSearchItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  clearAll: {
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
  },
  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchDetails: {
    flex: 1,
  },
  searchLocation: {
    fontSize: fontSize.md,
    fontWeight: "400",
    marginBottom: 2,
  },
  searchInfo: {
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  searchTime: {
    fontSize: fontSize.xs,
  },
  removeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});
