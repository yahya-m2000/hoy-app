import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@shared/hooks/useTheme";
import { spacing } from "@shared/constants";

interface SetupProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const SetupProgress: React.FC<SetupProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    isCompleted || isCurrent
                      ? theme.colors.primary
                      : theme.colors.gray[300],
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
