/**
 * VerificationCard Component
 *
 * Reusable card component for verification steps in host setup flow.
 * Displays verification status, action buttons, and progress states.
 *
 * @module @features/host/components/setup
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@core/hooks";
import {
  Container,
  Text,
  Button,
  Icon,
  Input,
  LoadingSpinner,
} from "@shared/components";
import { spacing, radius, iconSize } from "@core/design";

export type VerificationStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "error";
export type VerificationType = "email" | "phone" | "identity";

interface VerificationCardProps {
  type: VerificationType;
  status: VerificationStatus;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onVerify?: () => void;
  onResend?: () => void;
  onUpload?: () => void;
  isLoading?: boolean;
  errorMessage?: string;
  showCodeInput?: boolean;
  onCodeSubmit?: (code: string) => void;
  canResend?: boolean;
  resendCountdown?: number;
  verificationId?: string;
  disabled?: boolean;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  type,
  status,
  title,
  subtitle,
  icon,
  onVerify,
  onResend,
  onUpload,
  isLoading = false,
  errorMessage,
  showCodeInput = false,
  onCodeSubmit,
  canResend = true,
  resendCountdown = 0,
  verificationId,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const [code, setCode] = useState("");
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return theme.colors.success;
      case "in_progress":
        return theme.colors.primary;
      case "error":
        return theme.colors.error;
      default:
        return theme.colors.gray[500];
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "in_progress":
        return "time-outline";
      case "error":
        return "alert-circle";
      default:
        return "ellipse-outline";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "completed":
        return t("features.host.setup.verification.completed");
      case "in_progress":
        return t("features.host.setup.verification.inProgress");
      case "error":
        return t("features.host.setup.verification.error");
      default:
        return t("features.host.setup.verification.pending");
    }
  };

  const handleCodeSubmit = async () => {
    if (!code.trim() || !onCodeSubmit) return;

    setIsSubmittingCode(true);
    try {
      await onCodeSubmit(code.trim());
      setCode("");
    } catch (error) {
      // Error handling is done by parent component
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleVerify = () => {
    if (type === "identity" && onUpload) {
      onUpload();
    } else if (onVerify) {
      onVerify();
    }
  };

  const renderActionButton = () => {
    if (status === "completed") {
      return (
        <Button
          title={t("features.host.setup.verification.verified")}
          variant="outline"
          size="small"
          disabled={true}
          onPress={() => {}}
          style={styles.actionButton}
          textStyle={{ color: theme.colors.success }}
        />
      );
    }

    if (showCodeInput) {
      return (
        <Container>
          <Container marginBottom="sm">
            <Input
              label={t("features.host.setup.verification.enterCode")}
              value={code}
              onChangeText={setCode}
              placeholder={t("features.host.setup.verification.codePlaceholder")}
              keyboardType="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              style={styles.codeInput}
            />
          </Container>

          <Container flexDirection="row" style={{ gap: spacing.sm }}>
            <Button
              title={t("features.host.setup.verification.submitCode")}
              variant="primary"
              size="small"
              onPress={handleCodeSubmit}
              loading={isSubmittingCode}
              disabled={!code.trim() || isSubmittingCode || disabled}
              style={{...styles.actionButton, flex: 1}}
            />

            {canResend && (
              <Button
                title={
                  resendCountdown > 0
                    ? t("features.host.setup.verification.resendIn", {
                        seconds: resendCountdown,
                      })
                    : t("features.host.setup.verification.resend")
                }
                variant="outline"
                size="small"
                onPress={onResend || (() => {})}
                disabled={resendCountdown > 0 || isLoading || disabled}
                style={{...styles.actionButton, flex: 1}}
              />
            )}
          </Container>
        </Container>
      );
    }

    return (
      <Button
        title={
          type === "identity"
            ? t("features.host.setup.verification.uploadDocument")
            : t("features.host.setup.verification.sendCode")
        }
        variant="primary"
        size="small"
        onPress={handleVerify}
        loading={isLoading}
        disabled={isLoading || disabled}
        style={styles.actionButton}
      />
    );
  };

  return (
    <Container
      style={[
        styles.card,
        {
          backgroundColor: isDark ? theme.colors.gray[800] : theme.colors.white,
          borderColor:
            status === "error" ? theme.colors.error : theme.colors.gray[200],
          borderWidth: status === "error" ? 2 : 1,
        },
      ]}
    >
      {/* Card Header */}
      <Container flexDirection="row" alignItems="flex-start" marginBottom="md">
        {/* Main Icon */}
        <Container
          style={[
            styles.iconContainer,
            {
              backgroundColor: getStatusColor() + "20",
            },
          ]}
        >
          <Icon name={icon} size={iconSize.md} color={getStatusColor()} />
        </Container>

        {/* Title and Subtitle */}
        <Container flex={1} paddingLeft="md">
          <Text variant="h6" color="primary" style={styles.title}>
            {title}
          </Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        </Container>

        {/* Status Indicator */}
        <Container alignItems="center">
          <Icon
            name={getStatusIcon()}
            size={iconSize.sm}
            color={getStatusColor()}
          />
          <Text
            variant="caption"
            color={status === "error" ? "error" : "secondary"}
            style={styles.statusText}
          >
            {getStatusText()}
          </Text>
        </Container>
      </Container>

      {/* Error Message */}
      {errorMessage && (
        <Container
          style={[
            styles.errorContainer,
            { backgroundColor: theme.colors.error + "10" },
          ]}
          marginBottom="md"
        >
          <Icon
            name="alert-circle-outline"
            size={iconSize.xs}
            color={theme.colors.error}
            style={styles.errorIcon}
          />
          <Text variant="caption" color="error" style={styles.errorText}>
            {errorMessage}
          </Text>
        </Container>
      )}

      {/* Loading Indicator */}
      {isLoading && !showCodeInput && (
        <Container
          alignItems="center"
          justifyContent="center"
          style={styles.loadingContainer}
          marginBottom="md"
        >
          <LoadingSpinner size="small" />
          <Text variant="caption" color="secondary" style={styles.loadingText}>
            {t("features.host.setup.verification.processing")}
          </Text>
        </Container>
      )}

      {/* Action Button */}
      <Container>{renderActionButton()}</Container>

      {/* Help Text */}
      {status === "pending" && (
        <Container marginTop="sm">
          <Text variant="caption" color="secondary" style={styles.helpText}>
            {type === "email" && t("features.host.setup.verification.emailHelp")}
            {type === "phone" && t("features.host.setup.verification.phoneHelp")}
            {type === "identity" && t("features.host.setup.verification.identityHelp")}
          </Text>
        </Container>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusText: {
    fontSize: 12,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  errorIcon: {
    marginRight: spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
  },
  loadingContainer: {
    paddingVertical: spacing.sm,
  },
  loadingText: {
    marginTop: spacing.xs,
    fontSize: 12,
  },
  actionButton: {
    marginTop: spacing.xs,
  },
  codeInput: {
    textAlign: "center",
    fontSize: 18,
    letterSpacing: 2,
  },
  helpText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});

export default VerificationCard;
