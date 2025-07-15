import React from "react";
import { View, StyleSheet } from "react-native";
import { Container, Button } from "@shared/components";
import StepHeader from "../StepHeader";
import { PROPERTY_TAGS } from "@core/types/listings.types";
import { spacing } from "@core/design";
import { useTranslation } from "react-i18next";

interface TagsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function TagsStep({ formData, updateFormData }: TagsStepProps) {
  const { t } = useTranslation();
  const handleTagToggle = (tag: string) => {
    const current = formData.tags || [];
    if (current.includes(tag)) {
      updateFormData({ tags: current.filter((t: string) => t !== tag) });
    } else {
      updateFormData({ tags: [...current, tag] });
    }
  };

  return (
    <Container>
      <StepHeader
        title={t("property.steps.tags.title")}
        description={t("property.steps.tags.description")}
      />

      <View style={styles.tagsGrid}>
        {PROPERTY_TAGS.map((tag) => {
          const selected = formData.tags?.includes(tag) || false;
          return (
            <Button
              key={tag}
              title={t(
                `property.tags.${tag
                  .toLowerCase()
                  .replace(/\s+([a-z])/g, (_, letter) => letter.toUpperCase())}`
              )}
              variant={selected ? "primary" : "outline"}
              onPress={() => handleTagToggle(tag)}
              style={styles.tagButton}
            />
          );
        })}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.lg,
    marginHorizontal: -spacing.xs,
  },
  tagButton: {
    margin: spacing.xs,
  },
});
