import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/hooks/useTheme";
import {
  Text,
  Icon,
  Avatar,
  Skeleton,
  Container,
} from "@shared/components/base";
import { hostUtils } from "@shared/utils";
import type { HostSectionProps } from "../../types/sections";

// Constants
import { spacing } from "@shared/constants";

const HostSection: React.FC<HostSectionProps> = ({
  host,
  hostLoading,
  property,
  onMessageHost, // Keep for compatibility, but not used in this minimalist design
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = createStyles(theme);

  // Use contact data from host profile
  const phoneNumber = host?.phone || host?.phoneNumber || "+1-555-123-4567";

  const handleCallHost = () => {
    hostUtils.handleCall(phoneNumber);
  };

  const handleWhatsAppHost = () => {
    const whatsappNumber = host?.whatsappNumber || phoneNumber;
    hostUtils.handleWhatsApp(whatsappNumber);
  }; // Show minimalist loading skeleton
  if (hostLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.hostContainer}>
          <Skeleton width={48} height={48} borderRadius={24} />
          <View style={styles.hostInfo}>
            <Skeleton
              width="50%"
              height={18}
              style={{ marginBottom: spacing.xs }}
            />
            <Skeleton width="70%" height={14} />
          </View>
          <View style={styles.actionContainer}>
            <Skeleton
              width={32}
              height={32}
              borderRadius={16}
              style={{ marginRight: spacing.sm }}
            />
            <Skeleton width={32} height={32} borderRadius={16} />
          </View>
        </View>
      </View>
    );
  }

  if (!host) {
    return null;
  } // Host stats for display
  const hostName = `${host?.firstName || ""} ${host?.lastName || ""}`.trim();
  const propertyCount =
    (host as any)?.totalProperties || (host as any)?.activeProperties || 1;
  const hostingYears = (host as any)?.hostingYears || 0;

  // Use the host's average rating from the backend
  const averageRating = (host as any)?.averageRating || 0;
  return (
    <View style={styles.container}>
      <View style={styles.hostContainer}>
        <Avatar
          size="medium"
          src={host?.avatarUrl || host?.profileImage}
          name={hostName}
          initials={hostUtils.getInitials(
            host?.firstName || "U",
            host?.lastName || "H"
          )}
          backgroundColor={theme.colors.gray[200]}
        />
        <View style={styles.hostInfo}>
          <Text variant="h4" weight="medium" color={theme.text.primary}>
            {host?.firstName || t("property.hostTitle")}
            &nbsp;
          </Text>
          {(propertyCount > 0 || averageRating >= 0) && (
            <View style={styles.hostStats}>
              {propertyCount > 0 && (
                <Text variant="caption" color={theme.text.secondary}>
                  {propertyCount}&nbsp;
                  {propertyCount === 1
                    ? t("common.property")
                    : t("common.properties")}
                </Text>
              )}
              {propertyCount > 0 && averageRating > 0 && (
                <Text variant="caption" color={theme.text.secondary}>
                  &nbsp;•&nbsp;
                </Text>
              )}
              {averageRating > 0 && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={12} color={theme.colors.primary} />
                  <Text variant="caption" color={theme.text.secondary}>
                    {averageRating.toFixed(1)}
                  </Text>
                </View>
              )}
              {hostingYears > 0 && (
                <Container>
                  <Text variant="caption" color={theme.text.secondary}>
                    &nbsp;•&nbsp;
                  </Text>
                  <Text variant="caption" color={theme.text.secondary}>
                    {hostingYears} {hostingYears === 1 ? "year" : "years"}
                    hosting
                  </Text>
                </Container>
              )}
            </View>
          )}
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity onPress={handleCallHost} style={styles.iconButton}>
            <Icon name="call" color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleWhatsAppHost}
            style={styles.iconButton}
          >
            <Icon name="logo-whatsapp" color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: "transparent",
      // paddingHorizontal: spacing.md,
      // paddingVertical: spacing.lg,
    },
    hostContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    hostInfo: {
      flex: 1,
      marginLeft: spacing.md,
      marginRight: spacing.md,
    },
    hostStats: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.xxs,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    actionContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    iconButton: {
      padding: spacing.xs,
      borderRadius: 16,
      backgroundColor: "transparent",
    },
  });

export default HostSection;
