import React from "react";
import { Container, Text, Button, Icon } from "@shared/components";
import { router } from "expo-router";
import { spacing, iconSize } from "@core/design";
import { useTranslation } from "react-i18next";

interface SuccessStepProps {
  formData: any;
  isPublished?: boolean;
}

export default function SuccessStep({
  formData,
  isPublished,
}: SuccessStepProps) {
  const { t } = useTranslation();
  const handleViewListing = () => {
    if (formData._id) {
      router.push(`/(tabs)/host/listings/${formData._id}`);
    }
  };

  const handleAddAnother = () => {
    router.replace("/host/listings/add/index");
  };

  const handleClose = () => {
    router.replace("/(tabs)/host/listings");
  };

  return (
    <Container
      flex={1}
      justifyContent="center"
      alignItems="center"
      paddingHorizontal="lg"
    >
      <Icon
        name={isPublished ? "checkmark-circle" : "save-outline"}
        size={iconSize.xxl}
        color="success"
        style={{ marginBottom: spacing.lg }}
      />

      <Text
        variant="h2"
        weight="bold"
        style={{ marginBottom: spacing.sm, textAlign: "center" }}
      >
        {isPublished
          ? t("features.property.listing.steps.success.congratulations")
          : t("features.property.listing.steps.success.draftSaved")}
      </Text>

      <Text
        variant="body"
        color="secondary"
        style={{ marginBottom: spacing.xl, textAlign: "center" }}
      >
        {isPublished
          ? t("features.property.listing.steps.success.publishedMessage")
          : t("features.property.listing.steps.success.draftMessage")}
      </Text>

      <Container marginTop="lg">
        <Button
          title={t("features.property.listing.actions.viewListing")}
          variant="primary"
          onPress={handleViewListing}
          style={{ marginBottom: spacing.md }}
        />

        <Button
          title={t("features.property.listing.actions.addAnother")}
          variant="outline"
          onPress={handleAddAnother}
          style={{ marginBottom: spacing.md }}
        />

        <Button
          title={t("common.close", "Close")}
          variant="ghost"
          onPress={handleClose}
        />
      </Container>
    </Container>
  );
}
