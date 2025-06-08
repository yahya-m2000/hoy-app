import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { useSearchForm } from "@shared/hooks";
import { useTheme } from "@shared/context";
import { spacing, fontSize, radius } from "@shared/constants";

interface SearchFormProps {
  onSearch: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { searchState } = useSearchForm();

  const location = searchState?.location || "";
  const dates = searchState?.displayDates || "";
  const travelers = searchState?.displayTravelers || "2 guests, 1 room";

  const openLocationModal = () => {
    router.push("/(overlays)/search/location");
  };

  const openDateModal = () => {
    router.push("/(overlays)/search/dates");
  };

  const openTravelersModal = () => {
    router.push("/(overlays)/search/travelers");
  };

  return (
    <View style={styles.container}>
      {/* Location Input - Full Width */}
      <TouchableOpacity
        style={[
          styles.searchInput,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[300],
            borderWidth: 1,
          },
        ]}
        onPress={openLocationModal}
        activeOpacity={0.7}
      >
        <View style={styles.inputContent}>
          <Ionicons
            name="location-outline"
            size={24}
            color={
              location
                ? theme.colors.primary[500]
                : isDark
                ? theme.colors.gray[400]
                : theme.colors.gray[500]
            }
          />
          <View style={styles.inputText}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("search.where")}
            </Text>
            <Text
              style={[
                styles.inputValue,
                {
                  color: location
                    ? isDark
                      ? theme.white
                      : theme.colors.gray[900]
                    : isDark
                    ? theme.colors.gray[500]
                    : theme.colors.gray[400],
                },
              ]}
              numberOfLines={1}
            >
              {location || t("search.goingTo")}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
        />
      </TouchableOpacity>

      {/* Dates Input - Full Width */}
      <TouchableOpacity
        style={[
          styles.searchInput,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[300],
            borderWidth: 1,
          },
        ]}
        onPress={openDateModal}
        activeOpacity={0.7}
      >
        <View style={styles.inputContent}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color={
              dates
                ? theme.colors.primary[500]
                : isDark
                ? theme.colors.gray[400]
                : theme.colors.gray[500]
            }
          />
          <View style={styles.inputText}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("search.when")}
            </Text>
            <Text
              style={[
                styles.inputValue,
                {
                  color: dates
                    ? isDark
                      ? theme.white
                      : theme.colors.gray[900]
                    : isDark
                    ? theme.colors.gray[500]
                    : theme.colors.gray[400],
                },
              ]}
              numberOfLines={1}
            >
              {dates || t("search.selectDates")}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
        />
      </TouchableOpacity>

      {/* Travelers Input - Full Width */}
      <TouchableOpacity
        style={[
          styles.searchInput,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[300],
            borderWidth: 1,
          },
        ]}
        onPress={openTravelersModal}
        activeOpacity={0.7}
      >
        <View style={styles.inputContent}>
          <Ionicons
            name="people-outline"
            size={24}
            color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
          />
          <View style={styles.inputText}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("search.who")}
            </Text>
            <Text
              style={[
                styles.inputValue,
                {
                  color: isDark ? theme.white : theme.colors.gray[900],
                },
              ]}
              numberOfLines={1}
            >
              {travelers}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
        />
      </TouchableOpacity>

      {/* Search Button */}
      <TouchableOpacity
        style={[
          styles.searchButton,
          {
            backgroundColor: theme.colors.primaryPalette[500],
          },
        ]}
        onPress={onSearch}
        activeOpacity={0.8}
      >
        <Text style={[styles.searchButtonText, { color: theme.colors.white }]}>
          {t("search.search") || "Search"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  searchInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  inputText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  inputLabel: {
    fontSize: fontSize.xs,
    fontWeight: "500",
    marginBottom: 2,
  },
  inputValue: {
    fontSize: fontSize.md,
    fontWeight: "400",
  },
  searchButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  searchButtonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
