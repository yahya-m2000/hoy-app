import React from "react";
import { View, StyleSheet } from "react-native";
import { Container } from "@shared/components";
import { useTheme } from "@core/hooks";
import { spacing } from "@core/design";

interface ProgressBarProps {
  currentStep: number; // 1, 2, or 3
  totalSteps?: number; // defaults to 3
}

export default function ProgressBar({
  currentStep,
  totalSteps = 3,
}: ProgressBarProps) {
  const { theme } = useTheme();

  return (
    <Container style={styles.container} backgroundColor="background">
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <View
              key={stepNumber}
              style={[
                styles.progressBlock,
                {
                  backgroundColor: isActive
                    ? theme.colors.primary
                    : theme.colors.tertiary,
                  opacity: isCurrent ? 1 : isActive ? 0.8 : 0.3,
                },
                index < totalSteps - 1 && { marginRight: spacing.xs },
              ]}
            />
          );
        })}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  progressContainer: {
    flexDirection: "row",
    height: 4,
  },
  progressBlock: {
    flex: 1,
    borderRadius: 2,
  },
});
