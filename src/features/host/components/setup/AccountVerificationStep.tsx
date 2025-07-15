/**
 * Account Verification Step Component
 * Handles email, phone, and identity verification in the host setup flow
 * Following Airbnb's verification pattern with modern card-based UI
 */

import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Container, Text, Button, Input, Icon } from "@shared/components";
import { spacing, radius } from "@core/design";
import type {
  HostVerification,
  VerificationCodeVerification,
} from "@core/types/host.types";
import { HostSetupService } from "@core/api/services/host/setup.service";

interface AccountVerificationStepProps {
  data: Partial<HostVerification>;
  errors: Record<string, string>;
  onChange: (data: Partial<HostVerification>) => void;
}

interface VerificationCardProps {
  type: "email" | "phone" | "identity";
  title: string;
  subtitle: string;
  icon: string;
  isVerified: boolean;
  isLoading?: boolean;
  onVerify: () => void;
  onResend?: () => void;
  canResend?: boolean;
}

const VerificationCard: React.FC<VerificationCardProps> = ({
  type,
  title,
  subtitle,
  icon,
  isVerified,
  isLoading = false,
  onVerify,
  onResend,
  canResend = false,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const getStatusColor = () => {
    if (isVerified) return theme.colors.success;
    if (isLoading) return theme.colors.warning;
    return theme.colors.gray[400];
  };

  const getStatusIcon = () => {
    if (isVerified) return "checkmark-circle";
    if (isLoading) return "time-outline";
    return "ellipse-outline";
  };

  const getStatusText = () => {
    if (isVerified) return t("host.verification.verified");
    if (isLoading) return t("host.verification.pending");
    return t("host.verification.notVerified");
  };

  const getActionText = () => {
    if (isVerified) return t("host.verification.completed");
    if (isLoading) return t("host.verification.verifying");
    return t("host.verification.verify");
  };

  return (
    <Container
      backgroundColor="surface"
      borderRadius="lg"
      padding="lg"
      marginBottom="md"
      borderWidth={1}
      borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
      style={[
        styles.verificationCard,
        ...(isVerified ? [{ borderColor: theme.colors.success }] : []),
      ]}
    >
      <Container flexDirection="row" alignItems="center" marginBottom="md">
        <Container
          width={48}
          height={48}
          borderRadius="md"
          backgroundColor={
            isDark ? theme.colors.gray[800] : theme.colors.gray[100]
          }
          justifyContent="center"
          alignItems="center"
          marginRight="md"
        >
          <Icon name={icon as any} size={24} color={theme.colors.primary} />
        </Container>

        <Container flex={1}>
          <Text variant="subtitle" color="primary" marginBottom="sm">
            {title}
          </Text>
          <Text variant="body" color="secondary" style={{ lineHeight: 18 }}>
            {subtitle}
          </Text>
        </Container>

        <Container alignItems="center">
          <Icon
            name={getStatusIcon()}
            size={20}
            color={getStatusColor()}
            style={{ marginBottom: 4 }}
          />
          <Text
            variant="caption"
            color={isVerified ? "success" : "secondary"}
            style={{ fontSize: 11 }}
          >
            {getStatusText()}
          </Text>
        </Container>
      </Container>

      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        {canResend && onResend && (
          <Button
            title={t("host.verification.resend")}
            variant="ghost"
            size="small"
            onPress={onResend}
            disabled={isLoading}
          />
        )}

        <Button
          title={getActionText()}
          variant={isVerified ? "outline" : "primary"}
          size="small"
          onPress={onVerify}
          disabled={isVerified || isLoading}
          loading={isLoading}
          style={{ marginLeft: "auto" }}
        />
      </Container>
    </Container>
  );
};

export const AccountVerificationStep: React.FC<
  AccountVerificationStepProps
> = ({ data, errors, onChange }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loadingStates, setLoadingStates] = useState({
    email: false,
    phone: false,
    identity: false,
  });
  const [verificationCodes, setVerificationCodes] = useState({
    email: "",
    phone: "",
  });
  const [verificationIds, setVerificationIds] = useState({
    email: "",
    phone: "",
  });
  const [showCodeInputs, setShowCodeInputs] = useState({
    email: false,
    phone: false,
  });

  const setLoading = (
    type: "email" | "phone" | "identity",
    loading: boolean
  ) => {
    setLoadingStates((prev) => ({ ...prev, [type]: loading }));
  };

  const handleEmailVerification = async () => {
    if (showCodeInputs.email) {
      // Verify code
      if (!verificationCodes.email.trim()) {
        Alert.alert(t("common.error"), t("host.verification.enterCode"));
        return;
      }

      setLoading("email", true);
      try {
        const result = await HostSetupService.verifyEmailCode({
          verificationId: verificationIds.email,
          code: verificationCodes.email,
        });
        if (result.success) {
          onChange({ ...data, isEmailVerified: true });
          setShowCodeInputs((prev) => ({ ...prev, email: false }));
          setVerificationCodes((prev) => ({ ...prev, email: "" }));
          Alert.alert(
            t("common.success"),
            t("host.verification.emailVerified")
          );
        } else {
          Alert.alert(
            t("common.error"),
            result.message || t("host.verification.invalidCode")
          );
        }
      } catch (error) {
        Alert.alert(
          t("common.error"),
          t("host.verification.verificationFailed")
        );
      } finally {
        setLoading("email", false);
      }
    } else {
      // Send code
      setLoading("email", true);
      try {
        const result = await HostSetupService.sendEmailVerification(
          "user@example.com"
        );
        if (result.success) {
          setVerificationIds((prev) => ({
            ...prev,
            email: result.verificationId || "",
          }));
          setShowCodeInputs((prev) => ({ ...prev, email: true }));
          Alert.alert(t("common.success"), t("host.verification.codeSent"));
        } else {
          Alert.alert(
            t("common.error"),
            result.message || t("host.verification.sendFailed")
          );
        }
      } catch (error) {
        Alert.alert(t("common.error"), t("host.verification.sendFailed"));
      } finally {
        setLoading("email", false);
      }
    }
  };

  const handlePhoneVerification = async () => {
    if (showCodeInputs.phone) {
      // Verify code
      if (!verificationCodes.phone.trim()) {
        Alert.alert(t("common.error"), t("host.verification.enterCode"));
        return;
      }

      setLoading("phone", true);
      try {
        const result = await HostSetupService.verifyPhoneCode({
          verificationId: verificationIds.phone,
          code: verificationCodes.phone,
        });
        if (result.success) {
          onChange({ ...data, isPhoneVerified: true });
          setShowCodeInputs((prev) => ({ ...prev, phone: false }));
          setVerificationCodes((prev) => ({ ...prev, phone: "" }));
          Alert.alert(
            t("common.success"),
            t("host.verification.phoneVerified")
          );
        } else {
          Alert.alert(
            t("common.error"),
            result.message || t("host.verification.invalidCode")
          );
        }
      } catch (error) {
        Alert.alert(
          t("common.error"),
          t("host.verification.verificationFailed")
        );
      } finally {
        setLoading("phone", false);
      }
    } else {
      // Send code
      setLoading("phone", true);
      try {
        const result = await HostSetupService.sendPhoneVerification(
          "+1234567890"
        );
        if (result.success) {
          setShowCodeInputs((prev) => ({ ...prev, phone: true }));
          Alert.alert(t("common.success"), t("host.verification.codeSent"));
        } else {
          Alert.alert(
            t("common.error"),
            result.message || t("host.verification.sendFailed")
          );
        }
      } catch (error) {
        Alert.alert(t("common.error"), t("host.verification.sendFailed"));
      } finally {
        setLoading("phone", false);
      }
    }
  };

  const handleIdentityVerification = async () => {
    setLoading("identity", true);
    try {
      const result = await HostSetupService.startIdentityVerification();
      if (result.success) {
        // In a real app, this would redirect to identity verification flow
        // For now, we'll simulate successful verification
        setTimeout(() => {
          onChange({ ...data, isIdentityVerified: true });
          setLoading("identity", false);
          Alert.alert(
            t("common.success"),
            t("host.verification.identityVerified")
          );
        }, 2000);
      } else {
        Alert.alert(
          t("common.error"),
          result.message || t("host.verification.identityFailed")
        );
        setLoading("identity", false);
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("host.verification.identityFailed"));
      setLoading("identity", false);
    }
  };

  const handleResendCode = async (type: "email" | "phone") => {
    setLoading(type, true);
    try {
      const result =
        type === "email"
          ? await HostSetupService.sendEmailVerification("user@example.com")
          : await HostSetupService.sendPhoneVerification("+1234567890");

      if (result.success) {
        Alert.alert(t("common.success"), t("host.verification.codeResent"));
      } else {
        Alert.alert(
          t("common.error"),
          result.message || t("host.verification.resendFailed")
        );
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("host.verification.resendFailed"));
    } finally {
      setLoading(type, false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Container paddingHorizontal="lg" paddingVertical="md">
        <Text variant="h2" color="primary" marginBottom="sm">
          {t("host.verification.title")}
        </Text>

        <Text
          variant="body"
          color="secondary"
          marginBottom="xl"
          style={{ lineHeight: 22 }}
        >
          {t("host.verification.subtitle")}
        </Text>

        {/* Email Verification */}
        <VerificationCard
          type="email"
          title={t("host.verification.email.title")}
          subtitle={t("host.verification.email.subtitle")}
          icon="mail-outline"
          isVerified={data.isEmailVerified || false}
          isLoading={loadingStates.email}
          onVerify={handleEmailVerification}
          onResend={
            showCodeInputs.email ? () => handleResendCode("email") : undefined
          }
          canResend={showCodeInputs.email}
        />

        {/* Email Code Input */}
        {showCodeInputs.email && (
          <Container marginBottom="lg" paddingHorizontal="md">
            <Input
              label={t("host.verification.verificationCode")}
              value={verificationCodes.email}
              onChangeText={(text) =>
                setVerificationCodes((prev) => ({ ...prev, email: text }))
              }
              placeholder={t("host.verification.enterCode")}
              keyboardType="number-pad"
              maxLength={6}
              error={errors.emailCode}
            />
          </Container>
        )}

        {/* Phone Verification */}
        <VerificationCard
          type="phone"
          title={t("host.verification.phone.title")}
          subtitle={t("host.verification.phone.subtitle")}
          icon="call-outline"
          isVerified={data.isPhoneVerified || false}
          isLoading={loadingStates.phone}
          onVerify={handlePhoneVerification}
          onResend={
            showCodeInputs.phone ? () => handleResendCode("phone") : undefined
          }
          canResend={showCodeInputs.phone}
        />

        {/* Phone Code Input */}
        {showCodeInputs.phone && (
          <Container marginBottom="lg" paddingHorizontal="md">
            <Input
              label={t("host.verification.verificationCode")}
              value={verificationCodes.phone}
              onChangeText={(text) =>
                setVerificationCodes((prev) => ({ ...prev, phone: text }))
              }
              placeholder={t("host.verification.enterCode")}
              keyboardType="number-pad"
              maxLength={6}
              error={errors.phoneCode}
            />
          </Container>
        )}

        {/* Identity Verification */}
        <VerificationCard
          type="identity"
          title={t("host.verification.identity.title")}
          subtitle={t("host.verification.identity.subtitle")}
          icon="person-outline"
          isVerified={data.isIdentityVerified || false}
          isLoading={loadingStates.identity}
          onVerify={handleIdentityVerification}
        />

        {/* Progress Info */}
        <Container
          backgroundColor="surface"
          borderRadius="md"
          padding="md"
          marginTop="lg"
          borderWidth={1}
          borderColor={theme.colors.gray[200]}
        >
          <Container flexDirection="row" alignItems="center" marginBottom="sm">
            <Icon
              name="information-circle-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text variant="subtitle" color="primary" marginLeft="sm">
              {t("host.verification.whyVerify")}
            </Text>
          </Container>
          <Text variant="body" color="secondary" style={{ lineHeight: 20 }}>
            {t("host.verification.whyVerifyText")}
          </Text>
        </Container>
      </Container>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  verificationCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
