import React from "react";
import { TouchableOpacity, FlatList, Alert } from "react-native";
import { Container, Text, Icon } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks/useTheme";

import { RecentSearch } from "../../utils";

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
      style={{
        backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
        borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
      }}
      onPress={() => onSearchSelect(item)}
      activeOpacity={0.7}
    >
      <Container flexDirection="row" alignItems="center" flex={1}>
        <Container marginRight="sm">
          <Ionicons
            name="time-outline"
            size={20}
            color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
          />
        </Container>
        <Container flex={1}>
          <Text
            color={isDark ? theme.white : theme.colors.gray[900]}
            size="md"
            weight="normal"
            numberOfLines={1}
          >
            {item.location}
          </Text>
          <Container marginTop="xs">
            <Text
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
              size="sm"
              numberOfLines={1}
            >
              {item.displayDates} • {item.displayTravelers}
            </Text>
          </Container>
          <Container marginTop="xs">
            <Text
              color={isDark ? theme.colors.gray[500] : theme.colors.gray[500]}
              size="xs"
            >
              {formatTimeAgo(item.timestamp)}
            </Text>
          </Container>
        </Container>
      </Container>
      <TouchableOpacity
        style={{ padding: 8, marginLeft: 12 }}
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
    <Container marginBottom="lg">
      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginVertical="md"
      >
        <Text
          color={isDark ? theme.colors.gray[50] : theme.colors.gray[900]}
          variant="h6"
        >
          {t("search.recentSearches") || "Recent Searches"}
        </Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text
            color={theme.colors.primaryPalette[500]}
            size="sm"
            weight="semibold"
          >
            {t("search.clear") || "Clear All"}
          </Text>
        </TouchableOpacity>
      </Container>
      <FlatList
        data={searches}
        renderItem={renderRecentSearchItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </Container>
  );
};
