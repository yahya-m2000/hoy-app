import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components";

interface PropertyListingProgressProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  stepTitles: string[];
}

export default function PropertyListingProgress({
  currentStep,
  totalSteps,
  progress,
  stepTitles,
}: PropertyListingProgressProps) {
  return (
    <View style={styles.container}>
      {/* Step Indicators */}
      <View style={styles.steps}>
        {stepTitles.map((title, index) => (
          <View key={index} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index + 1 <= currentStep && styles.stepCircleActive,
                index + 1 < currentStep && styles.stepCircleComplete,
              ]}
            >
              <Text
                variant="sm"
                weight="semibold"
                color={index + 1 <= currentStep ? "white" : "text-tertiary"}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              variant="xs"
              color={
                index + 1 <= currentStep ? "text-primary" : "text-tertiary"
              }
              style={styles.stepTitle}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        ))}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(progress, 100)}%` },
            ]}
          />
        </View>
        <Text variant="xs" color="text-secondary" style={styles.progressText}>
          {Math.round(progress)}% complete
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  steps: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: "#3B82F6",
  },
  stepCircleComplete: {
    backgroundColor: "#10B981",
  },
  stepTitle: {
    textAlign: "center",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  progressText: {
    textAlign: "center",
  },
});
