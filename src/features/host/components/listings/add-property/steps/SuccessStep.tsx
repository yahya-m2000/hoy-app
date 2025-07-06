import React from "react";
import { Container, Text, Button, Icon } from "@shared/components";
import { router } from "expo-router";
import { spacing, iconSize } from "@core/design";

interface SuccessStepProps {
  formData: any;
  isPublished?: boolean;
}

export default function SuccessStep({
  formData,
  isPublished,
}: SuccessStepProps) {
  const handleViewListing = () => {
    if (formData._id) {
      router.push(`/property/${formData._id}`);
    }
  };

  const handleAddAnother = () => {
    router.replace("/host/listings/add/index");
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
        {isPublished ? "Congratulations!" : "Draft Saved!"}
      </Text>

      <Text
        variant="body"
        color="secondary"
        style={{ marginBottom: spacing.xl, textAlign: "center" }}
      >
        {isPublished
          ? "Your property has been published and is now live"
          : "Your property has been saved as a draft"}
      </Text>

      <Container marginTop="lg">
        <Button
          title="View Listing"
          variant="primary"
          onPress={handleViewListing}
          style={{ marginBottom: spacing.md }}
        />

        <Button
          title="Add Another Property"
          variant="outline"
          onPress={handleAddAnother}
        />
      </Container>
    </Container>
  );
}
