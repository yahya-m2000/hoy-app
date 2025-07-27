import React from "react";
import { Alert, TouchableOpacity } from "react-native";
import { Property } from "@core/types/property.types";
import { formatCurrency } from "@core/utils/data/currency";
import { useTranslation } from "react-i18next";
import {
  Container,
  Card,
  Text,
  Icon,
  Badge,
  Button,
  PropertyImage,
} from "@shared/components";
import { iconSize, spacing, radius } from "@core/design";

// Custom status badge for this file only
const StatusBadge: React.FC<{ status: "Active" | "Inactive" }> = ({
  status,
}) => {
  const { t } = useTranslation();
  const isActive = status === "Active";
  return (
    <Container
      flexDirection="row"
      alignItems="center"
      paddingVertical="xxs"
      style={{ alignSelf: "flex-start" }}
    >
      <Icon
        name={isActive ? "checkmark-circle" : "close-circle"}
        size={14}
        style={{ marginRight: 4 }}
      />
      <Text variant="caption" weight="medium">
        {isActive ? t("features.property.management.status.active") : t("features.property.management.status.inactive")}
      </Text>
    </Container>
  );
};

interface PropertyListItemProps {
  property: Property;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus?: () => void;
  isDeleting?: boolean;
}

function isPriceObject(
  price: any
): price is { amount: number; currency?: string } {
  return (
    price &&
    typeof price === "object" &&
    price !== null &&
    Object.prototype.hasOwnProperty.call(price, "amount")
  );
}

export default function PropertyListItem({
  property,
  onPress,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting = false,
}: PropertyListItemProps) {
  const { t } = useTranslation();
  const primaryImage = property.images?.[0];
  const address = `${property.address.city}, ${property.address.state}`;

  const handleOptionsPress = () => {
    Alert.alert(
      t("features.property.management.options.title"),
      `Options for \"${property.name}\"`,
      [
        {
          text: t("features.property.management.options.edit"),
          onPress: () => {
            Alert.alert(
              t("features.property.management.options.editProperty"),
              "What would you like to edit?",
              [
                {
                  text: t("features.property.management.options.editDetails"),
                  onPress: onEdit,
                },
                {
                  text: t("features.property.management.options.toggleStatus"),
                  onPress: handleToggleStatus,
                },
                {
                  text: t("common.cancel"),
                  style: "cancel",
                },
              ]
            );
          },
        },
        {
          text: t("features.property.management.options.delete"),
          style: "destructive",
          onPress: onDelete,
        },
        {
          text: t("common.cancel"),
          style: "cancel",
        },
      ]
    );
  };

  const handleToggleStatus = () => {
    if (!onToggleStatus) return;

    const isCurrentlyActive = property.isActive;
    const actionText = isCurrentlyActive
      ? t("features.property.management.options.deactivateProperty")
      : t("features.property.management.options.activateProperty");
    const confirmMessage = isCurrentlyActive
      ? t("features.property.management.options.deactivateConfirm")
      : t("features.property.management.options.activateConfirm");
    const additionalMessage = isCurrentlyActive
      ? t("features.property.management.options.deactivateMessage")
      : "";

    Alert.alert(
      actionText,
      `${confirmMessage}${additionalMessage ? `\n\n${additionalMessage}` : ""}`,
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: property.isActive
            ? t("features.property.management.options.deactivate")
            : t("features.property.management.options.activate"),
          onPress: onToggleStatus,
        },
      ]
    );
  };

  const status = property.isActive ? "Active" : "Inactive";

  return (
    <Container
      marginBottom="md"
      style={{ opacity: isDeleting ? 0.6 : 1 }}
      padding="none"
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={isDeleting}
        activeOpacity={0.7}
      >
        <Container flexDirection="row">
          {/* Left: Property Image */}
          <Container
            style={{
              position: "relative",
              width: 120,
            }}
          >
            {primaryImage ? (
              <PropertyImage uri={primaryImage} fill borderRadius="md" />
            ) : (
              <Container
                style={{
                  width: 120,
                  height: 120,
                  borderTopLeftRadius: radius.md,
                  borderBottomLeftRadius: radius.md,
                  backgroundColor: "#f5f5f5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  name="image-outline"
                  size={iconSize.lg}
                  color="secondary"
                />
              </Container>
            )}
          </Container>

          {/* Right: Property Details */}
          <Container flex={1} paddingHorizontal="sm">
            {/* Status Badge - Above Title */}
            <Container
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginBottom="xs"
            >
              <StatusBadge status={status} />
              <TouchableOpacity onPress={handleOptionsPress}>
                <Icon
                  name={
                    isDeleting ? "hourglass-outline" : "ellipsis-horizontal"
                  }
                  size={iconSize.sm}
                  color="primary"
                />
              </TouchableOpacity>
            </Container>

            <Container
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginBottom="xs"
            >
              <Text
                variant="h6"
                weight="medium"
                numberOfLines={1}
                style={{ flex: 1, paddingRight: 8 }}
              >
                {property.name}
              </Text>
            </Container>

            <Container marginBottom="xs">
              <Text variant="body" color="secondary" numberOfLines={1}>
                {address}
              </Text>
            </Container>

            <Container marginBottom="sm">
              <Text variant="caption" color="primary" weight="medium">
                {property.propertyType.charAt(0).toUpperCase() +
                  property.propertyType.slice(1)}
              </Text>
            </Container>

            {/* Property Stats */}
            <Container
              flexDirection="row"
              alignItems="center"
              marginBottom="sm"
              flexWrap="wrap"
            >
              <Container
                flexDirection="row"
                alignItems="center"
                marginRight="md"
                marginBottom="xs"
              >
                <Icon name="bed-outline" size={iconSize.sm} color="secondary" />
                <Container marginLeft="xs">
                  <Text variant="caption">{property.bedrooms}</Text>
                </Container>
              </Container>

              <Container
                flexDirection="row"
                alignItems="center"
                marginRight="md"
                marginBottom="xs"
              >
                <Icon
                  name="water-outline"
                  size={iconSize.sm}
                  color="secondary"
                />
                <Container marginLeft="xs">
                  <Text variant="caption">{property.bathrooms}</Text>
                </Container>
              </Container>

              <Container
                flexDirection="row"
                alignItems="center"
                marginRight="md"
                marginBottom="xs"
              >
                <Icon
                  name="people-outline"
                  size={iconSize.sm}
                  color="secondary"
                />
                <Container marginLeft="xs">
                  <Text variant="caption">{property.maxGuests}</Text>
                </Container>
              </Container>

              {property.rating > 0 && (
                <Container
                  flexDirection="row"
                  alignItems="center"
                  marginBottom="xs"
                >
                  <Icon name="star" size={iconSize.sm} color="warning" />
                  <Container marginLeft="xs">
                    <Text variant="caption">{property.rating.toFixed(1)}</Text>
                  </Container>
                </Container>
              )}
            </Container>

            {/* Price */}
            <Container flexDirection="row" alignItems="baseline">
              <Text variant="body" weight="medium" color="primary">
                {typeof property.price === "number"
                  ? formatCurrency(property.price, property.currency)
                  : isPriceObject(property.price)
                  ? formatCurrency(
                      (property.price as { amount: number; currency?: string })
                        .amount,
                      (property.price as { amount: number; currency?: string })
                        .currency || property.currency
                    )
                  : "-"}
              </Text>
              <Container marginLeft="xs">
                <Text variant="caption" color="secondary">
                  {t("features.property.management.pricing.perNight")}
                </Text>
              </Container>
            </Container>
          </Container>
        </Container>
      </TouchableOpacity>
    </Container>
  );
}
