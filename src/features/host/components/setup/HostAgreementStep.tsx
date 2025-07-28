/**
 * Host Agreement Step Component
 * Handles terms of service and privacy policy acceptance in the host setup flow
 * Following Airbnb's agreement pattern with clear legal information
 */

import React, { useState } from "react";
import { ScrollView, StyleSheet, Alert, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Container, Text, Button, Icon } from "@shared/components";
import { spacing, radius } from "@core/design";
import type { HostAgreement } from "@core/types/host.types";

interface HostAgreementStepProps {
  data: Partial<HostAgreement>;
  errors: Record<string, string>;
  onChange: (data: Partial<HostAgreement>) => void;
}

interface AgreementCardProps {
  title: string;
  subtitle: string;
  icon: string;
  isAccepted: boolean;
  onToggle: () => void;
  onViewDocument: () => void;
  isRequired?: boolean;
}

const AgreementCard: React.FC<AgreementCardProps> = ({
  title,
  subtitle,
  icon,
  isAccepted,
  onToggle,
  onViewDocument,
  isRequired = false,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Container
      backgroundColor="surface"
      borderRadius="lg"
      padding="lg"
      marginBottom="md"
      borderWidth={1}
      borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
      style={[
        styles.agreementCard,
        ...(isAccepted ? [{ borderColor: theme.colors.success }] : []),
      ]}
    >
      <Container flexDirection="row" alignItems="flex-start" marginBottom="md">
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
          <Container flexDirection="row" alignItems="center" marginBottom="sm">
            <Text variant="subtitle" color="primary" style={{ flex: 1 }}>
              {title}
            </Text>
            {isRequired && (
              <Container
                backgroundColor={theme.colors.error}
                borderRadius="sm"
                paddingHorizontal="sm"
                paddingVertical="xs"
              >
                <Text variant="caption" color="white" style={{ fontSize: 10 }}>
                  {t("common.required")}
                </Text>
              </Container>
            )}
          </Container>

          <Text
            variant="body"
            color="secondary"
            marginBottom="md"
            style={{ lineHeight: 20 }}
          >
            {subtitle}
          </Text>

          <Button
            title={t("features.host.setup.agreement.viewDocument")}
            variant="ghost"
            size="small"
            onPress={onViewDocument}
            style={{ alignSelf: "flex-start", marginBottom: 12 }}
          />
        </Container>
      </Container>

      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingTop="md"
        style={{
          borderTopWidth: 1,
          borderTopColor: isDark
            ? theme.colors.gray[700]
            : theme.colors.gray[200],
        }}
      >
        <Container flexDirection="row" alignItems="center" flex={1}>
          <Icon
            name={isAccepted ? "checkmark-circle" : "ellipse-outline"}
            size={20}
            color={isAccepted ? theme.colors.success : theme.colors.gray[400]}
            style={{ marginRight: 8 }}
          />
          <Text
            variant="body"
            color={isAccepted ? "success" : "secondary"}
            style={{ fontSize: 14 }}
          >
            {isAccepted
              ? t("features.host.setup.agreement.accepted")
              : t("features.host.setup.agreement.notAccepted")}
          </Text>
        </Container>

        <Button
          title={
            isAccepted
              ? t("features.host.setup.agreement.accepted")
              : t("features.host.setup.agreement.accept")
          }
          variant={isAccepted ? "outline" : "primary"}
          size="small"
          onPress={onToggle}
          disabled={isAccepted}
          style={{ minWidth: 100 }}
        />
      </Container>
    </Container>
  );
};

export const HostAgreementStep: React.FC<HostAgreementStepProps> = ({
  data,
  errors,
  onChange,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const handleTermsToggle = () => {
    if (!data.termsAccepted) {
      onChange({
        ...data,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        termsVersion: "1.0",
      });
    }
  };

  const handlePrivacyToggle = () => {
    if (!data.privacyPolicyAccepted) {
      onChange({
        ...data,
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: new Date(),
        privacyPolicyVersion: "1.0",
      });
    }
  };

  const handleHostGuaranteeToggle = () => {
    if (!data.hostGuaranteeAccepted) {
      onChange({
        ...data,
        hostGuaranteeAccepted: true,
        hostGuaranteeAcceptedAt: new Date(),
      });
    }
  };

  const handleViewDocument = async (
    documentType: "terms" | "privacy" | "guarantee"
  ) => {
    try {
      const urls = {
        terms: "https://hoy.app/terms-of-service",
        privacy: "https://hoy.app/privacy-policy",
        guarantee: "https://hoy.app/host-guarantee",
      };

      const url = urls[documentType];
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t("common.error"), t("features.host.setup.agreement.cannotOpenDocument"));
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("features.host.setup.agreement.documentError"));
    }
  };

  const allRequiredAccepted = data.termsAccepted && data.privacyPolicyAccepted;
  const completionPercentage = [
    data.termsAccepted,
    data.privacyPolicyAccepted,
    data.hostGuaranteeAccepted,
  ].filter(Boolean).length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Container paddingHorizontal="lg" paddingVertical="md">
        <Text variant="h2" color="primary" marginBottom="sm">
          {t("features.host.setup.agreement.title")}
        </Text>

        <Text
          variant="body"
          color="secondary"
          marginBottom="xl"
          style={{ lineHeight: 22 }}
        >
          {t("features.host.setup.agreement.subtitle")}
        </Text>

        {/* Terms of Service */}
        <AgreementCard
          title={t("features.host.setup.agreement.terms.title")}
          subtitle={t("features.host.setup.agreement.terms.subtitle")}
          icon="document-text-outline"
          isAccepted={data.termsAccepted || false}
          onToggle={handleTermsToggle}
          onViewDocument={() => handleViewDocument("terms")}
          isRequired={true}
        />

        {/* Privacy Policy */}
        <AgreementCard
          title={t("features.host.setup.agreement.privacy.title")}
          subtitle={t("features.host.setup.agreement.privacy.subtitle")}
          icon="shield-outline"
          isAccepted={data.privacyPolicyAccepted || false}
          onToggle={handlePrivacyToggle}
          onViewDocument={() => handleViewDocument("privacy")}
          isRequired={true}
        />

        {/* Host Guarantee (Optional) */}
        <AgreementCard
          title={t("features.host.setup.agreement.guarantee.title")}
          subtitle={t("features.host.setup.agreement.guarantee.subtitle")}
          icon="shield-checkmark-outline"
          isAccepted={data.hostGuaranteeAccepted || false}
          onToggle={handleHostGuaranteeToggle}
          onViewDocument={() => handleViewDocument("guarantee")}
          isRequired={false}
        />

        {/* Progress Summary */}
        <Container
          backgroundColor="surface"
          borderRadius="md"
          padding="md"
          marginTop="lg"
          borderWidth={1}
          borderColor={theme.colors.gray[200]}
        >
          <Container
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            marginBottom="sm"
          >
            <Text variant="subtitle" color="primary">
              {t("features.host.setup.agreement.progress")}
            </Text>
            <Text variant="body" color="secondary">
              {completionPercentage}/3 {t("features.host.setup.agreement.completed")}
            </Text>
          </Container>

          <Container
            height={4}
            backgroundColor={theme.colors.gray[200]}
            borderRadius="sm"
            marginBottom="sm"
          >
            <Container
              height={4}
              backgroundColor={theme.colors.primary}
              borderRadius="sm"
              width={`${(completionPercentage / 3) * 100}%`}
            >
              <></>
            </Container>
          </Container>

          <Text
            variant="body"
            color="secondary"
            style={{ lineHeight: 20, fontSize: 13 }}
          >
            {allRequiredAccepted
              ? t("features.host.setup.agreement.allRequiredCompleted")
              : t("features.host.setup.agreement.requiredRemaining")}
          </Text>
        </Container>

        {/* Legal Notice */}
        <Container
          backgroundColor={
            isDark ? theme.colors.gray[800] : theme.colors.gray[50]
          }
          borderRadius="md"
          padding="md"
          marginTop="lg"
          borderWidth={1}
          borderColor={theme.colors.gray[200]}
        >
          <Container
            flexDirection="row"
            alignItems="flex-start"
            marginBottom="sm"
          >
            <Icon
              name="information-circle-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text variant="subtitle" color="primary" marginLeft="sm">
              {t("features.host.setup.agreement.legalNotice")}
            </Text>
          </Container>
          <Text
            variant="body"
            color="secondary"
            style={{ lineHeight: 20, fontSize: 13 }}
          >
            {t("features.host.setup.agreement.legalNoticeText")}
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
  agreementCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
