import React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Container, Button, Text } from "@shared/components";
import { spacing } from "@core/design";
import { useTheme } from "@core/hooks";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StepNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  onSubmit?: () => void;
  onCancel: () => void;
  loading?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isReviewStep?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  hasErrors?: boolean;
  isSuccessStep?: boolean;
  onSuccess?: () => void;
}

export default function StepNavigation({
  onNext,
  onPrev,
  onSubmit,
  onCancel,
  loading = false,
  isFirstStep = false,
  isLastStep = false,
  isReviewStep = false,
  nextLabel = "Next",
  prevLabel = "Back",
  hasErrors = false,
  isSuccessStep = false,
  onSuccess,
}: StepNavigationProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const isNextDisabled = hasErrors || loading;

  return (
    <Container
      style={[styles.container, { paddingBottom: insets.bottom + 20 }]}
      backgroundColor="background"
    >
      <View style={styles.navigationButtons}>
        {!isFirstStep && (
          <Button
            title={prevLabel}
            variant="outline"
            onPress={onPrev}
            style={styles.navButton}
            disabled={loading}
          />
        )}

        {isReviewStep && onSubmit ? (
          <Button
            title="Publish"
            variant="primary"
            onPress={onSubmit}
            style={isFirstStep ? styles.fullWidthButton : styles.navButton}
            loading={loading}
          />
        ) : (
          <Button
            title={isLastStep ? "Review" : nextLabel}
            variant="primary"
            onPress={onNext}
            style={isFirstStep ? styles.fullWidthButton : styles.navButton}
            disabled={isNextDisabled}
          />
        )}
      </View>

      <Container paddingTop="sm" alignItems="center">
        <TouchableOpacity onPress={onCancel} disabled={loading}>
          <Text
            variant="body"
            color="primary"
            style={{ textDecorationLine: "underline" }}
          >
            Save & Exit
          </Text>
        </TouchableOpacity>
      </Container>

      {isSuccessStep && onSuccess && (
        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={onSuccess}
        >
          <Text style={styles.successButtonText}>View Your Listing</Text>
        </TouchableOpacity>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  successButton: {
    // Add appropriate styles for success button
  },
  successButtonText: {
    // Add appropriate styles for success button text
  },
});
