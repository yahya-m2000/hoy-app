/**
 * Password Strength Indicator Component
 *
 * Displays real-time password strength with visual feedback
 * and helpful suggestions for improving password security.
 *
 * @module @shared/components/PasswordStrengthIndicator
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./base/Text";
import { Container } from "./layout";
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  PasswordStrength,
} from "@core/utils/security/password-utils";
import { spacing, radius } from "@core/design";

// ========================================
// TYPES
// ========================================

interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
  style?: any;
}

// ========================================
// COMPONENT
// ========================================

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, showSuggestions = false, style }) => {
  // Don't show anything if password is empty
  if (!password) {
    return null;
  }

  const validation = validatePassword(password);
  const strengthColor = getPasswordStrengthColor(validation.strength);
  const strengthText = getPasswordStrengthText(validation.strength);

  return (
    <Container style={[styles.container, style]}>
      {/* Strength Bar */}
      <Container marginBottom="xs">
        <View style={styles.strengthBarContainer}>
          <View
            style={[
              styles.strengthBar,
              {
                width: `${Math.min(validation.score, 100)}%`,
                backgroundColor: strengthColor,
              },
            ]}
          />
        </View>
      </Container>

      {/* Strength Text */}
      <Container marginBottom="xs">
        <Text size="sm" style={{ color: strengthColor, fontWeight: "600" }}>
          {strengthText}
        </Text>
      </Container>

      {/* Issues List */}
      {validation.issues.length > 0 && (
        <Container marginBottom="xs">
          {validation.issues.map((issue, index) => (
            <Text key={index} size="xs" color="error" style={styles.issueText}>
              • {issue}
            </Text>
          ))}
        </Container>
      )}

      {/* Suggestions */}
      {showSuggestions && validation.strength === PasswordStrength.WEAK && (
        <Container
          padding="sm"
          backgroundColor="primary"
          borderRadius="sm"
          marginTop="xs"
        >
          <Text size="xs" color="white" style={styles.suggestionTitle}>
            💡 Password Tips:
          </Text>
          <Text size="xs" color="white" style={styles.suggestionText}>
            • Use at least 8 characters
          </Text>
          <Text size="xs" color="white" style={styles.suggestionText}>
            • Include uppercase and lowercase letters
          </Text>
          <Text size="xs" color="white" style={styles.suggestionText}>
            • Add numbers and special characters
          </Text>
          <Text size="xs" color="white" style={styles.suggestionText}>
            • Avoid common patterns and words
          </Text>
        </Container>
      )}
    </Container>
  );
};

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
    borderRadius: radius.sm,
  },
  issueText: {
    marginBottom: 2,
  },
  suggestionTitle: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  suggestionText: {
    marginBottom: 2,
  },
});

export default PasswordStrengthIndicator;
