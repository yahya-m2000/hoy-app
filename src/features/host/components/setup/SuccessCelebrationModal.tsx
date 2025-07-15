/**
 * Success Celebration Modal
 * Celebratory modal shown when host setup is completed
 */

import React from "react";
import { Modal, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

// Core hooks and theme
import { useTheme } from "@core/hooks";

// Shared components
import { Container, Text, Button, Icon, Header } from "@shared/components";

// Constants
import { spacing, radius, iconSize } from "@core/design";

interface SuccessCelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  onAddProperty: () => void;
  onExploreDashboard: () => void;
}

export const SuccessCelebrationModal: React.FC<
  SuccessCelebrationModalProps
> = ({ visible, onClose, onAddProperty, onExploreDashboard }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAddProperty = () => {
    onAddProperty();
    onClose();
    router.push("/(tabs)/host/listings/create");
  };

  const handleExploreDashboard = () => {
    onExploreDashboard();
    onClose();
    router.push("/(tabs)/host/today");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <Container flex={1} backgroundColor="background">
        {/* Header */}
        <Header
          right={{
            icon: "close",
            onPress: onClose,
          }}
        />

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.xxl),
            },
          ]}
        >
          {/* Success Animation/Icon */}
          <Container alignItems="center" paddingVertical="xxl">
            <Container
              style={[
                styles.successIconContainer,
                {
                  backgroundColor: theme.colors.success + "20",
                  borderColor: theme.colors.success,
                },
              ]}
            >
              <Icon
                name="checkmark-circle"
                size={iconSize.xxl}
                color={theme.colors.success}
              />
            </Container>
          </Container>

          {/* Success Message */}
          <Container
            alignItems="center"
            paddingHorizontal="lg"
            marginBottom="xl"
          >
            <Text variant="h1" style={[styles.title, { textAlign: "center" }]}>
              {t("host.setup.success.title")}
            </Text>

            <Container marginTop="md">
              <Text
                variant="body"
                color="secondary"
                style={[styles.subtitle, { textAlign: "center" }]}
              >
                {t("host.setup.success.subtitle")}
              </Text>
            </Container>
          </Container>

          {/* Features Unlocked */}
          <Container paddingHorizontal="lg" marginBottom="xl">
            <Text variant="h3" style={styles.sectionTitle}>
              {t("host.setup.success.featuresUnlocked")}
            </Text>

            <Container marginTop="md">
              {[
                {
                  icon: "home",
                  title: t("host.setup.success.features.listings"),
                  description: t("host.setup.success.features.listingsDesc"),
                },
                {
                  icon: "calendar",
                  title: t("host.setup.success.features.calendar"),
                  description: t("host.setup.success.features.calendarDesc"),
                },
                {
                  icon: "chatbubbles",
                  title: t("host.setup.success.features.messaging"),
                  description: t("host.setup.success.features.messagingDesc"),
                },
                {
                  icon: "analytics",
                  title: t("host.setup.success.features.insights"),
                  description: t("host.setup.success.features.insightsDesc"),
                },
              ].map((feature, index) => (
                <Container
                  key={index}
                  flexDirection="row"
                  alignItems="flex-start"
                  marginBottom="md"
                >
                  <Container
                    style={[
                      styles.featureIcon,
                      {
                        backgroundColor: theme.colors.primary + "20",
                      },
                    ]}
                  >
                    <Icon
                      name={feature.icon}
                      size={iconSize.md}
                      color={theme.colors.primary}
                    />
                  </Container>

                  <Container flex={1} marginLeft="md">
                    <Text variant="subtitle" style={styles.featureTitle}>
                      {feature.title}
                    </Text>
                    <Text
                      variant="caption"
                      color="secondary"
                      style={styles.featureDescription}
                    >
                      {feature.description}
                    </Text>
                  </Container>
                </Container>
              ))}
            </Container>
          </Container>

          {/* Next Steps */}
          <Container paddingHorizontal="lg">
            <Text variant="h3" style={styles.sectionTitle}>
              {t("host.setup.success.nextSteps")}
            </Text>

            <Container marginTop="lg">
              <Text
                variant="body"
                color="secondary"
                style={styles.nextStepsText}
              >
                {t("host.setup.success.nextStepsDesc")}
              </Text>
            </Container>
          </Container>
        </ScrollView>

        {/* Action Buttons */}
        <Container
          paddingHorizontal="lg"
          backgroundColor="background"
          borderTopWidth={1}
          borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
          style={{
            paddingBottom: Math.max(insets.bottom + spacing.md, spacing.lg),
          }}
        >
          <Container paddingTop="lg">
            <Button
              title={t("host.setup.success.addProperty")}
              variant="primary"
              onPress={handleAddProperty}
              style={styles.primaryButton}
            />

            <Container marginTop="md">
              <Button
                title={t("host.setup.success.exploreDashboard")}
                variant="outline"
                onPress={handleExploreDashboard}
                style={styles.secondaryButton}
              />
            </Container>
          </Container>
        </Container>
      </Container>
    </Modal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  nextStepsText: {
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    marginBottom: spacing.sm,
  },
});
