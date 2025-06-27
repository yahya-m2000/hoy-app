import React, { ReactNode } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@shared/hooks/useTheme";
import {
  Text,
  Icon,
  Button,
  Container,
  Section,
} from "@shared/components/base";
import { spacing } from "@shared/constants";

export interface OverlayScreenProps {
  headerIcon?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  children: ReactNode;
  infoBoxIcon?: string;
  infoBoxText?: string;
  infoBoxColor?: string;
  isLoading?: boolean;
  loadingText?: string;
  errorText?: string;
  onClose?: () => void;

  // Custom footer actions
  customFooter?: ReactNode;
  hideDefaultCloseButton?: boolean;

  // Legacy PolicyScreen compatibility props
  title?: string;
  icon?: string;
  leftIcon?: string;
}

export const OverlayScreen: React.FC<OverlayScreenProps> = ({
  headerIcon,
  headerTitle,
  headerSubtitle,
  children,
  infoBoxIcon = "information-circle-outline",
  infoBoxText,
  infoBoxColor,
  isLoading,
  loadingText = "Loading...",
  errorText,
  onClose,

  // Custom footer actions
  customFooter,
  hideDefaultCloseButton = false,

  // Legacy PolicyScreen compatibility props
  title,
  icon,
  leftIcon,
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  // Support legacy PolicyScreen props for backward compatibility
  const finalHeaderIcon = headerIcon || icon || leftIcon || "document-outline";
  const finalHeaderTitle = headerTitle || title || "Details";
  const finalHeaderSubtitle = headerSubtitle || "";

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <Container
        flex={1}
        backgroundColor="background"
        justifyContent="center"
        alignItems="center"
      >
        <Text>{loadingText}</Text>
      </Container>
    );
  }

  if (errorText) {
    return (
      <Container
        flex={1}
        backgroundColor="background"
        justifyContent="center"
        alignItems="center"
      >
        <Text color={theme.colors.error}>{errorText}</Text>
      </Container>
    );
  }

  return (
    <Container flex={1} backgroundColor="background">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Section>
          <Container
            paddingHorizontal="lg"
            paddingVertical="xl"
            paddingTop="xxl"
            alignItems="center"
          >
            <Icon
              name={finalHeaderIcon as any}
              size={48}
              color={theme.text.primary}
              style={{ marginBottom: spacing.md }}
            />
            <Text variant="h2" weight="bold">
              {finalHeaderTitle}
            </Text>
            {finalHeaderSubtitle && (
              <Text variant="body" color="secondary">
                {finalHeaderSubtitle}
              </Text>
            )}
          </Container>
        </Section>

        {/* Content Section */}
        <Container paddingHorizontal="lg" flex={1}>
          {children}
        </Container>

        {/* Info Box Section */}
        {infoBoxText && (
          <Section>
            <Container paddingHorizontal="lg" marginBottom="xl">
              <Container
                backgroundColor={infoBoxColor || "rgba(59, 130, 246, 0.1)"}
                padding="md"
                borderRadius="md"
                flexDirection="row"
                alignItems="flex-start"
              >
                <Icon
                  name={infoBoxIcon as any}
                  size={20}
                  color={theme.colors.primary}
                  style={{ marginRight: spacing.sm, marginTop: 2 }}
                />
                <Container flex={1}>
                  <Text variant="caption" color={theme.text.secondary}>
                    {infoBoxText}
                  </Text>
                </Container>
              </Container>
            </Container>
          </Section>
        )}

        <Container height={spacing.xxl}>
          <></>
        </Container>
      </ScrollView>

      {/* Footer */}
      {customFooter ? (
        <Container padding="lg" paddingBottom="xl">
          {customFooter}
        </Container>
      ) : !hideDefaultCloseButton ? (
        <Container padding="lg" paddingBottom="xl">
          <Button
            title="Close"
            onPress={handleClose}
            variant="primary"
            size="medium"
            style={{ width: "100%" }}
          />
        </Container>
      ) : null}
    </Container>
  );
};

// Legacy PolicyScreen alias for backward compatibility
export const PolicyScreen = OverlayScreen;

// Export OverlayScreen as default and named
export default OverlayScreen;
