import React from "react";
import { TouchableOpacity } from "react-native";

import { Text } from "@shared/components/base/Text";
import { Avatar } from "@shared/components/base/Avatar";
import { Icon } from "@shared/components/base/Icon";
import { useTheme } from "@core/hooks/useTheme";
import { iconSize } from "@core/design";
import { Container } from "@shared/components/layout/Container";
import { t } from "i18next";

interface PropertyHeaderProps {
  title: string;
  host?: {
    name: string;
    avatar?: string;
  };
  rating: number;
  reviewCount: number;
  onShowReviews?: () => void;
}

/**
 * PropertyHeader - Displays property title, host info, and ratings
 * Features: star ratings, host avatar, review count with navigation
 */
const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  title,
  host,
  rating,
  reviewCount,
  onShowReviews,
}) => {
  const { theme } = useTheme();

  // Render star rating display
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= fullStars ? "star" : "star-outline"}
          size={iconSize.xxs}
          color={i <= fullStars ? theme.colors.primary : theme.text.secondary}
        />
      );
    }
    return stars;
  };

  return (
    <Container paddingVertical="lg">
      <Text variant="h5" align="center">
        {title}
      </Text>

      {host && (
        <Container
          flex={1}
          flexDirection="column"
          alignItems="center"
          marginBottom="sm"
        >
          <Container paddingTop="sm">
            <Avatar src={host.avatar} size="medium" name={host.name} />
          </Container>
          <Container paddingTop="sm" alignItems="center">
            <Text color="secondary" size="sm">
              {t("features.property.details.general.hostedBy", {
                name: host.name,
              })}
            </Text>
          </Container>
        </Container>
      )}

      <Container
        flex={1}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginHorizontal="xxxl"
      >
        <Container
          alignItems="center"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Text weight="semibold" size="xl">
            {rating.toFixed(2)}
          </Text>
          <Container flexDirection="row">{renderStars(rating)}</Container>
        </Container>
        <TouchableOpacity onPress={onShowReviews} disabled={!onShowReviews}>
          <Container
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text weight="semibold" size="xl">
              {reviewCount}
            </Text>
            <Text>{reviewCount === 1 ? "Review" : "Reviews"}</Text>
          </Container>
        </TouchableOpacity>
      </Container>
    </Container>
  );
};

export { PropertyHeader };
export default PropertyHeader;
