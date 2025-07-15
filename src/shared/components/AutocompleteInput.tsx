import React, { useState, useEffect } from "react";
import {
  Modal,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  View,
} from "react-native";
import { useTheme } from "@core/hooks";
import { Container, Text, Icon, Input } from "@shared/components";
import { spacing, iconSize } from "@core/design";

export interface AutocompleteInputProps {
  value: string;
  onSelect: (item: string) => void;
  onSearchTextChange?: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  suggestions: string[];
  disabled?: boolean;
  required?: boolean;
  noResultsText?: string;
  modalTitle?: string;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onSelect,
  onSearchTextChange,
  placeholder,
  label,
  error,
  suggestions,
  disabled = false,
  required = false,
  noResultsText = "No results found",
  modalTitle = "Select Option",
}) => {
  const { theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (onSearchTextChange) {
      onSearchTextChange(text);
    }
  };

  const handleOpenModal = () => {
    if (!disabled) {
      setSearchText("");
      if (onSearchTextChange) {
        onSearchTextChange("");
      }
      setIsModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSearchText("");
  };

  const handleSelectItem = (item: string) => {
    onSelect(item);
    handleCloseModal();
  };

  const renderSuggestionItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => handleSelectItem(item)}
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.border || theme.secondary,
      }}
    >
      <Text variant="body" color="primary">
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderNoResults = () => (
    <Container
      padding="xl"
      alignItems="center"
      justifyContent="center"
      flex={1}
    >
      <Text variant="body" color="secondary" align="center">
        {noResultsText}
      </Text>
    </Container>
  );

  return (
    <>
      {/* Main Input Field */}
      <TouchableOpacity onPress={handleOpenModal} disabled={disabled}>
        <View pointerEvents="none">
          <Input
            value={value}
            placeholder={placeholder}
            label={label}
            error={error}
            disabled={disabled}
            required={required}
            rightIcon={
              <Icon
                name="chevron-down"
                size={iconSize.sm}
                color={theme.text?.secondary || theme.secondary}
              />
            }
          />
        </View>
      </TouchableOpacity>

      {/* Fullscreen Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <Container flex={1} backgroundColor="background">
            {/* Header */}
            <View
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderBottomColor: theme.border || theme.secondary,
              }}
            >
              <TouchableOpacity onPress={handleCloseModal}>
                <Icon
                  name="chevron-back-outline"
                  size={iconSize.md}
                  color={theme.text?.primary || theme.primary}
                />
              </TouchableOpacity>

              <Text variant="h6" color="primary" weight="semibold">
                {modalTitle}
              </Text>

              <View style={{ width: iconSize.md }} />
            </View>

            {/* Search Input */}
            <Container padding="md">
              <Input
                value={searchText}
                onChangeText={handleSearchTextChange}
                placeholder="Search..."
                leftIcon={
                  <Icon
                    name="search"
                    size={iconSize.sm}
                    color={theme.text?.secondary || theme.secondary}
                  />
                }
              />
            </Container>

            {/* Results List */}
            <Container flex={1}>
              {suggestions.length > 0 ? (
                <FlatList
                  data={suggestions}
                  renderItem={renderSuggestionItem}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                />
              ) : (
                renderNoResults()
              )}
            </Container>
          </Container>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default AutocompleteInput;
