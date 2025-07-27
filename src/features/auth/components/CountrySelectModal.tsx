import React from "react";
import { Modal, ScrollView, TouchableOpacity } from "react-native";
import { Container, Screen, Text } from "@shared/components";

interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag?: string;
  cities?: string[];
  states?: string[];
  [key: string]: any; // Allow extra properties for compatibility
}

interface CountrySelectModalProps {
  visible: boolean;
  onClose: () => void;
  countries: Country[];
  onSelect: (country: Country) => void;
  theme: any;
  t: (key: string) => string;
}

const CountrySelectModal: React.FC<CountrySelectModalProps> = ({
  visible,
  onClose,
  countries,
  onSelect,
  theme,
  t,
}) => (
  <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <Screen
      backgroundColor="background"
      header={{
        title: t("features.auth.forms.fields.country"),
        left: {
          icon: "close",
          onPress: onClose,
        },
        showDivider: false,
      }}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        {countries.map((c) => (
          <TouchableOpacity
            key={c.code}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              marginHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}
            onPress={() => onSelect(c)}
          >
            <Container style={{ flex: 1 }}>
              <Text weight="medium">{c.name}</Text>
              <Text variant="caption" color="secondary">
                {c.phoneCode}
              </Text>
            </Container>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  </Modal>
);

export default CountrySelectModal;
