/**
 * Currency Setting Component
 * Handles currency display and selection
 */

import React from "react";
import { TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import { Container, Text, Icon } from "@shared/components";
import { useTheme } from "@core/hooks";
import { useCurrency } from "@core/context";
import { iconSize } from "@core/design";
import { InfoBox } from "src/features/host";

interface CurrencyOptionProps {
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  isSelected: boolean;
  onPress: () => void;
}

const CurrencyOption: React.FC<CurrencyOptionProps> = ({
  currency,
  isSelected,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Container
        borderRadius="lg"
        paddingHorizontal="md"
        paddingVertical="sm"
        backgroundColor={isSelected ? theme.surface : "transparent"}
        marginBottom="md"
        flexDirection="row"
        alignItems="center"
      >
        <Container
          width={40}
          height={40}
          borderRadius="circle"
          justifyContent="center"
          alignItems="center"
        >
          <Text variant="h6" weight="bold">
            {currency.symbol}
          </Text>
        </Container>

        <Container flex={1}>
          <Text variant="h6" weight="semibold">
            {currency.name}
          </Text>
          <Text variant="body2" color="secondary">
            {currency.code.toUpperCase()}
          </Text>
        </Container>

        {isSelected && (
          <Container
            width={24}
            height={24}
            justifyContent="center"
            alignItems="center"
          >
            <Icon name="checkmark" size={iconSize.sm} color="inverse" />
          </Container>
        )}
      </Container>
    </TouchableOpacity>
  );
};

interface CurrencySettingProps {
  title: string;
  description: string;
  infoContent: string;
  onCurrencyChange: (currency: string) => void;
}

export const CurrencySetting: React.FC<CurrencySettingProps> = ({
  title,
  description,
  infoContent,
  onCurrencyChange,
}) => {
  const { t } = useTranslation();
  const { currency, supportedCurrencies, changeCurrency } = useCurrency();

  const handleCurrencySelect = async (selectedCurrency: string) => {
    try {
      await changeCurrency(selectedCurrency);
      onCurrencyChange(selectedCurrency);
    } catch (error) {
      console.error("Failed to change currency:", error);
    }
  };

  return (
    <Container marginBottom="xl">
      <Container marginBottom="lg">
        <Text variant="h6" marginBottom="sm">
          {t(title)}
        </Text>
        <Text variant="body2" color="secondary" marginBottom="lg">
          {t(description)}
        </Text>
      </Container>

      <Container marginBottom="xl">
        {supportedCurrencies.map((curr) => (
          <CurrencyOption
            key={curr.code}
            currency={curr}
            isSelected={curr.code === currency}
            onPress={() => handleCurrencySelect(curr.code)}
          />
        ))}
      </Container>

      <InfoBox>
        <Text>{t(infoContent)}</Text>
      </InfoBox>
    </Container>
  );
};
