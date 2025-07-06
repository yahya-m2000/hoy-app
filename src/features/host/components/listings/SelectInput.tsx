import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, Modal, FlatList } from "react-native";
import { Container, Text, Icon } from "@shared/components";
import { spacing, iconSize } from "@core/design";
import { useTheme } from "@core/hooks";

interface Option {
  label: string;
  value: string;
}

interface SelectInputProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: boolean;
}

export default function SelectInput({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  error = false,
}: SelectInputProps) {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { theme } = useTheme();
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsModalVisible(false);
  };

  return (
    <Container>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 1,
          borderColor: error ? "#FF6B6B" : "#E5E7EB",
          borderRadius: 8,
          padding: spacing.md,
          backgroundColor: "#FFFFFF",
          minHeight: 56,
        }}
      >
        <Text
          variant="body"
          color={selectedOption ? "onSurface" : "onSurfaceVariant"}
          style={{ flex: 1 }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Icon
          name="chevron-down"
          size={iconSize.sm}
          color={theme.text.primary}
        />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <Container flex={1} backgroundColor="background">
          {/* Modal Header */}
          <Container
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            padding="lg"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={{ padding: spacing.xs }}
            >
              <Text variant="body" color="primary">
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>

            <Text variant="h4" color="onBackground">
              {t("common.selectOption")}
            </Text>

            <Container style={{ width: 60 }}>
              <></>
            </Container>
          </Container>

          {/* Options List */}
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            contentContainerStyle={{ paddingBottom: spacing.xxl }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item.value)}
                style={{
                  backgroundColor:
                    item.value === value ? "#F0F8FF" : "transparent",
                }}
              >
                <Container
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  padding="lg"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "#F3F4F6",
                  }}
                >
                  <Text
                    variant="body"
                    color={item.value === value ? "primary" : "onBackground"}
                    style={{
                      flex: 1,
                      fontWeight: item.value === value ? "600" : "400",
                    }}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Icon name="checkmark" size={iconSize.md} color="#007AFF" />
                  )}
                </Container>
              </TouchableOpacity>
            )}
          />
        </Container>
      </Modal>
    </Container>
  );
}
