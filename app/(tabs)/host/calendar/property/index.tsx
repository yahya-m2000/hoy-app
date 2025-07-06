import React, { useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, TouchableOpacity } from "react-native";

// Core
import { useTheme } from "@core/hooks";
import { spacing, iconSize } from "@core/design";

// Features
import { useHostProperties } from "@features/properties/hooks";
import { Property as APIProperty } from "@core/types/property.types";
import { useProperty } from "@features/calendar/hooks/useProperty";

// Shared
import {
  Container,
  Text,
  Icon,
  Button,
  PropertyImage,
} from "@shared/components";
import { Screen } from "@shared/components/layout/Screen";

// Local Property interface
interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  images: string[];
  isActive: boolean;
}

// Transform API Property to Calendar Property interface
const transformAPIProperty = (apiProperty: APIProperty): Property => {
  return {
    id: apiProperty._id,
    name: apiProperty.name,
    address:
      `${apiProperty.address?.street || ""} ${
        apiProperty.address?.city || ""
      } ${apiProperty.address?.state || ""}`.trim() || "Address not available",
    type: apiProperty.type,
    images: apiProperty.images || [],
    isActive: apiProperty.isActive,
  };
};

export default function PropertySelectionScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { properties: apiProperties, loading: isLoading } = useHostProperties();
  const { setSelectedProperty } = useProperty();

  // Transform API properties to calendar properties - only active properties
  const properties = apiProperties
    .filter((property) => property.isActive)
    .map(transformAPIProperty);

  console.log("🏠 PropertySelectionScreen: Property data", {
    propertiesCount: properties.length,
    properties: properties.map((p: Property) => ({ id: p.id, name: p.name })),
  });

  // Handle close button press
  const handleClosePress = useCallback(() => {
    router.back();
  }, [router]);

  // Handle property selection
  const handlePropertySelect = useCallback(
    (property: Property) => {
      // Set the selected property in the context and go back
      setSelectedProperty(property);
      router.back();
    },
    [setSelectedProperty, router]
  );

  // Handle "All Properties" selection
  const handleAllPropertiesSelect = useCallback(() => {
    // Clear the selected property and go back
    setSelectedProperty(null);
    router.back();
  }, [setSelectedProperty, router]);

  // Render property item
  const renderPropertyItem = useCallback(
    ({ item }: { item: Property }) => (
      <TouchableOpacity onPress={() => handlePropertySelect(item)}>
        <Container flexDirection="row" alignItems="center" marginVertical="sm">
          <PropertyImage uri={item.images[0]} size="sm" />
          <Text marginHorizontal="sm">{item.name}</Text>
          <Icon
            name="chevron-forward"
            size={iconSize.xs}
            color={theme.text.primary || "#007AFF"}
          />
        </Container>
      </TouchableOpacity>
    ),
    [handlePropertySelect, theme]
  );

  return (
    <Screen
      header={{
        title: t("calendar.selectProperty"),
        showDivider: false,
        left: {
          children: (
            <TouchableOpacity onPress={handleClosePress}>
              <Icon
                name="arrow-back"
                size={iconSize.md}
                color={theme.text.primary || "#007AFF"}
              />
            </TouchableOpacity>
          ),
        },
      }}
    >
      <Container paddingHorizontal="lg">
        {/* Properties List */}
        <Text
          variant="h6"
          weight="semibold"
          color={theme.text?.secondary || "#666666"}
          style={{ marginBottom: spacing.md }}
        >
          {t("calendar.yourProperties")}
        </Text>

        <FlatList
          data={properties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        />

        {/* All Properties Option */}
        <Button
          title={t("calendar.allProperties")}
          variant="ghost"
          size="large"
          onPress={handleAllPropertiesSelect}
          icon={
            <Icon
              name="grid-outline"
              size={iconSize.md}
              color={theme.colors.primary || "#007AFF"}
              style={{ marginRight: spacing.sm }}
            />
          }
        />

        {/* Empty State */}
        {properties.length === 0 && (
          <Container
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding="xl"
          >
            <Icon
              name="home-outline"
              size={64}
              color={theme.colors.gray?.[300] || "#cccccc"}
            />
            <Text
              variant="h6"
              weight="medium"
              color={theme.text?.secondary || "#666666"}
              style={{ marginTop: spacing.md, textAlign: "center" }}
            >
              {t("calendar.noProperties")}
            </Text>
            <Text
              variant="body"
              color={theme.text?.tertiary || "#999999"}
              style={{ marginTop: spacing.sm, textAlign: "center" }}
            >
              {t("calendar.addPropertiesToStart")}
            </Text>
          </Container>
        )}
      </Container>
    </Screen>
  );
}
