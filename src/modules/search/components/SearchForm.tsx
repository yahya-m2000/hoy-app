import React from "react";
import { TouchableOpacity } from "react-native";
import { Container, Text } from "@shared/components/base";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { useSearchForm } from "@shared/hooks";
import { useTheme } from "@shared/hooks/useTheme";

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
    <Container>
      {/* Location Input - Full Width */}
      <TouchableOpacity
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderRadius: 12,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
          borderWidth: 1,
        }}
        onPress={openLocationModal}
        activeOpacity={0.7}
      >
        <Container
          flex={1}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons
            name="location-outline"
            size={24}
            color={
              location
                ? theme.colors.primaryPalette[500]
                : isDark
                ? theme.colors.gray[400]
                : theme.colors.gray[500]
            }
          />
          <Container flex={1} style={{ marginLeft: 12 }}>
            <Text
              size="xs"
              weight="medium"
              color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
              style={{ marginBottom: 2 }}
            >
              {t("search.where")}
            </Text>
            <Text
              size="md"
              color={
                location
                  ? isDark
                    ? theme.white
                    : theme.colors.gray[900]
                  : isDark
                  ? theme.colors.gray[500]
                  : theme.colors.gray[400]
              }
              numberOfLines={1}
            >
              {location || t("search.goingTo")}
            </Text>
          </Container>
        </Container>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
        />
      </TouchableOpacity>

      {/* Dates Input - Full Width */}
      <TouchableOpacity
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderRadius: 12,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
          borderWidth: 1,
        }}
        onPress={openDateModal}
        activeOpacity={0.7}
      >
        <Container
          flex={1}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons
            name="calendar-outline"
            size={24}
            color={
              dates
                ? theme.colors.primaryPalette[500]
                : isDark
                ? theme.colors.gray[400]
                : theme.colors.gray[500]
            }
          />
          <Container flex={1} style={{ marginLeft: 12 }}>
            <Text
              size="xs"
              weight="medium"
              color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
              style={{ marginBottom: 2 }}
            >
              {t("search.when")}
            </Text>
            <Text
              size="md"
              color={
                dates
                  ? isDark
                    ? theme.white
                    : theme.colors.gray[900]
                  : isDark
                  ? theme.colors.gray[500]
                  : theme.colors.gray[400]
              }
              numberOfLines={1}
            >
              {dates || t("search.selectDates")}
            </Text>
          </Container>
        </Container>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
        />
      </TouchableOpacity>

      {/* Travelers Input - Full Width */}
      <TouchableOpacity
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderRadius: 12,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
          borderWidth: 1,
        }}
        onPress={openTravelersModal}
        activeOpacity={0.7}
      >
        <Container
          flex={1}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons
            name="people-outline"
            size={24}
            color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
          />
          <Container flex={1} style={{ marginLeft: 12 }}>
            <Text
              size="xs"
              weight="medium"
              color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
              style={{ marginBottom: 2 }}
            >
              {t("search.who")}
            </Text>
            <Text
              size="md"
              color={isDark ? theme.white : theme.colors.gray[900]}
              numberOfLines={1}
            >
              {travelers}
            </Text>
          </Container>
        </Container>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
        />
      </TouchableOpacity>

      {/* Search Button */}
      <TouchableOpacity
        style={{
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 12,
          backgroundColor: theme.colors.primaryPalette[500],
        }}
        onPress={onSearch}
        activeOpacity={0.8}
      >
        <Text size="md" weight="semibold" color={theme.colors.white}>
          {t("search.search") || "Search"}
        </Text>
      </TouchableOpacity>
    </Container>
  );
};
