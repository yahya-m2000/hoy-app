import React from "react";
import { Text } from "@shared/components/base/Text";
import { Container } from "@shared/components/base/Container";
import { Button } from "@shared/components/base/Button";
import { Tab } from "@shared/components/base/Tab";
import { useTranslation } from "react-i18next";
import type { PropertyTabProps } from "../../types/details";

const PropertyTab: React.FC<PropertyTabProps> = ({
  price,
  totalPrice,
  selectedDates,
  onReserve,
  propertyId,
  onDateSelectionPress,
}) => {
  const { t } = useTranslation();

  const handleReservePress = () => {
    // If dates are selected, proceed with reservation
    if (selectedDates?.startDate && selectedDates?.endDate) {
      onReserve?.();
    } else {
      // If no dates selected, open date selection modal
      onDateSelectionPress?.();
    }
  };

  return (
    <Tab>
      <Container flex={1} flexDirection="column" justifyContent="center">
        <Container flexDirection="row" alignItems="flex-end">
          <Text variant="body" weight="semibold" color="secondary">
            ${price}
          </Text>
          <Text variant="body" color="secondary" style={{ marginLeft: 4 }}>
            {t("property.perNight")}
          </Text>
        </Container>

        {totalPrice && totalPrice > 0 && (
          <Text variant="caption" color="primary" style={{ marginTop: 2 }}>
            ${totalPrice} {t("property.total")}
          </Text>
        )}
      </Container>
      <Button
        title={
          selectedDates?.startDate && selectedDates?.endDate
            ? t("property.reserve")
            : t("property.checkAvailability")
        }
        onPress={handleReservePress}
        variant="primary"
        size="medium"
        radius="circle"
      />
    </Tab>
  );
};

export default PropertyTab;
