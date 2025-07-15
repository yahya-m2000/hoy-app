import React from "react";
import { Modal, ScrollView, TouchableOpacity } from "react-native";
import { Container, Screen, Text } from "@shared/components";

interface CitySelectModalProps {
  visible: boolean;
  onClose: () => void;
  cities: string[];
  onSelect: (city: string) => void;
  selectedCountry: { name: string };
  theme: any;
  t: (key: string) => string;
}

const CitySelectModal: React.FC<CitySelectModalProps> = ({
  visible,
  onClose,
  cities,
  onSelect,
  selectedCountry,
  theme,
  t,
}) => (
  <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <Screen
      backgroundColor="background"
      header={{
        title: t("auth.city"),
        left: {
          icon: "close",
          onPress: onClose,
        },
        showDivider: false,
      }}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        {cities.map((c) => (
          <TouchableOpacity
            key={c}
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
              <Text weight="medium">{c}</Text>
              <Text variant="caption" color="secondary">
                {selectedCountry?.name || ""}
              </Text>
            </Container>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  </Modal>
);

export default CitySelectModal;
