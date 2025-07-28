import React from "react";
import { Container, Text, Icon, Button, Avatar } from "@shared/components";
import { useTheme } from "@core/hooks";
import { Linking } from "react-native";
import { iconSize, spacing } from "@core/design";
import { t } from "i18next";

interface HostInfoSectionProps {
  host?: {
    name: string;
    avatar?: string;
    totalReviews?: number;
    averageRating?: number;
    yearsHosting?: number;
    location?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
  };
}

const HostInfoSection: React.FC<HostInfoSectionProps> = ({ host }) => {
  const { theme } = useTheme();

  if (!host) {
    return null;
  }

  const handleCall = () => {
    if (host.phoneNumber) {
      Linking.openURL(`tel:${host.phoneNumber}`);
    }
  };

  const handleWhatsApp = () => {
    if (host.whatsappNumber) {
      Linking.openURL(`whatsapp://send?phone=${host.whatsappNumber}`);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <Container flexDirection="row" alignItems="center" style={{ gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={14}
            color={
              star <= rating ? theme.colors.primary : theme.colors.gray[400]
            }
          />
        ))}
      </Container>
    );
  };

  return (
    <Container>
      {/* Section Header */}
      <Container marginVertical="md">
        <Text variant="h6" weight="semibold">
          {t("features.property.details.host.meetYourHost")}
        </Text>
      </Container>

      {/* Host Card */}
      <Container paddingVertical="lg" borderRadius="lg" marginBottom="md">
        {/* Host Info Row */}
        <Container flexDirection="row" marginBottom="lg">
          {/* Avatar */}
          <Container marginRight="lg">
            <Avatar size="xlarge" name={host.name} source={host.avatar} />
          </Container>

          {/* Host Details */}
          <Container flex={1} justifyContent="center">
            {/* Host Name */}
            <Container marginBottom="xs">
              <Text variant="h6" color={theme.text.primary}>
                {host.name}
              </Text>
            </Container>

            {/* Rating and Reviews */}
            {host.averageRating && host.totalReviews !== undefined && (
              <Container
                flexDirection="row"
                alignItems="center"
                marginBottom="xs"
                style={{ gap: 6 }}
              >
                {renderStars(host.averageRating)}
                <Text
                  variant="body"
                  color={theme.text.secondary}
                  style={{ marginLeft: 4 }}
                >
                  {host.averageRating.toFixed(1)} ·{" "}
                  {host.totalReviews === 0
                    ? "New host"
                    : `${host.totalReviews} review${
                        host.totalReviews === 1 ? "" : "s"
                      }`}
                </Text>
              </Container>
            )}

            {/* Years Hosting */}
            {host.yearsHosting !== undefined && (
              <Container marginBottom="xs">
                <Text variant="body" color={theme.text.secondary}>
                  {host.yearsHosting === 0
                    ? t("features.property.details.host.newHost")
                    : `${host.yearsHosting} ${t(
                        "features.property.details.host.year",
                        {
                          count: host.yearsHosting,
                        }
                      )} ${t("features.property.details.host.hosting")}`}
                </Text>
              </Container>
            )}

            {/* Location */}
            {host.location && (
              <Container flexDirection="row" alignItems="center">
                <Text variant="body" color={theme.text.secondary}>
                  {t("features.property.details.host.livesIn", {
                    location: host.location,
                  })}
                </Text>
              </Container>
            )}
          </Container>
        </Container>

        {/* Contact Buttons */}
        <Container flexDirection="row" flex={1} style={{ gap: spacing.md }}>
          {/* Call Button - Show even without phone for better UX */}
          <Container flex={1}>
            <Button
              variant="outline"
              onPress={
                host.phoneNumber
                  ? handleCall
                  : () => {
                      // Could show a modal or toast saying "Phone number not available"
                      console.log("Phone number not available for this host");
                    }
              }
              title={t("common.call")}
              icon={
                <Icon
                  name="call-outline"
                  size={iconSize.sm}
                  color={
                    host.phoneNumber
                      ? theme.text.primary
                      : theme.colors.gray[400]
                  }
                />
              }
              iconPosition="left"
            />
          </Container>

          {/* WhatsApp Button - Show even without phone for better UX */}
          <Container flex={1}>
            <Button
              variant="outline"
              onPress={
                host.whatsappNumber
                  ? handleWhatsApp
                  : () => {
                      // Could show a modal or toast saying "WhatsApp not available"
                      console.log(
                        "WhatsApp number not available for this host"
                      );
                    }
              }
              title={t("features.property.details.common.general.whatsapp")}
              icon={
                <Icon
                  name="logo-whatsapp"
                  size={iconSize.sm}
                  color={
                    host.whatsappNumber ? "primary" : theme.colors.gray[400]
                  }
                />
              }
              iconPosition="left"
            />
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default HostInfoSection;
