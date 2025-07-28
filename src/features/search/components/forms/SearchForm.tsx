import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Container, Text } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useSearchForm } from "@features/search/hooks";
import { useTheme } from "@core/hooks/useTheme";
import UnifiedSearchModal, { ModalType } from "../UnifiedSearchModal";

interface SearchFormProps {
  onSearch: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { searchState } = useSearchForm();

  // Unified modal state
  const [showModal, setShowModal] = useState(false);
  const [currentModalType, setCurrentModalType] =
    useState<ModalType>("location");

  const location = searchState?.location || "";
  const dates = searchState?.displayDates || "";
  const travelers = searchState?.displayTravelers || "2 guests, 1 room";

  const openModal = (modalType: ModalType) => {
    setCurrentModalType(modalType);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
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
        onPress={() => openModal("location")}
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
              {t("features.search.location.where")}
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
              {location || t("features.search.location.goingTo")}
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
        onPress={() => openModal("dates")}
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
              {t("features.search.dates.when")}
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
              {dates || t("features.search.dates.selectDates")}
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
        onPress={() => openModal("travelers")}
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
              {t("features.search.travelers.who")}
            </Text>
            <Text
              size="md"
              color={
                travelers
                  ? isDark
                    ? theme.white
                    : theme.colors.gray[900]
                  : isDark
                  ? theme.colors.gray[500]
                  : theme.colors.gray[400]
              }
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
          backgroundColor: theme.colors.primary,
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 12,
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={onSearch}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={20} color={theme.white} />
        <Text
          size="md"
          weight="semibold"
          color={theme.white}
          style={{ marginLeft: 8 }}
        >
          {t("features.search.actions.search")}
        </Text>
      </TouchableOpacity>

      {/* Unified Modal Component */}
      <UnifiedSearchModal
        visible={showModal}
        modalType={currentModalType}
        onClose={closeModal}
        onComplete={(data) => {
          console.log(`${currentModalType} selected:`, data);
          // The modal already updates the search state via useSearchForm
        }}
      />
    </Container>
  );
};
