import React from "react";
import { View, StyleSheet } from "react-native";
import { Container, Button } from "@shared/components";
import StepHeader from "../StepHeader";
import { PROPERTY_TAGS } from "@core/types/listings.types";
import { spacing } from "@core/design";

interface TagsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function TagsStep({ formData, updateFormData }: TagsStepProps) {
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
        title="Choose tags that describe your place"
        description="Help guests find your property"
      />

      <View style={styles.tagsGrid}>
        {PROPERTY_TAGS.map((tag) => {
          const selected = formData.tags?.includes(tag) || false;
          return (
            <Button
              key={tag}
              title={tag}
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
