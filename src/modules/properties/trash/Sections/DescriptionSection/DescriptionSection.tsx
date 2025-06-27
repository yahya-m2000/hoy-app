import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/hooks/useTheme";

// Components
import { Container, Icon, Text } from "@shared/components/base";

// Types
import { DescriptionSectionProps } from "../../types/sections";

// Constants
import { spacing } from "@shared/constants";

const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  description,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  // Check if description is long enough to warrant a "show more" button
  const shouldShowMoreButton = description && description.length > 150;
  const truncatedDescription = shouldShowMoreButton
    ? `${description.substring(0, 150)}...`
    : description;

  return (
    <Container>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {t("property.aboutTitle")}
        </Text>

        <Text style={[styles.description, { color: theme.text.primary }]}>
          {truncatedDescription}
        </Text>

        {shouldShowMoreButton && (
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={styles.showMoreButton}
          >
            <Text style={[styles.showMoreText, { color: theme.text.primary }]}>
              {t("property.showMore")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Description Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              {t("property.aboutTitle")}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Icon name="close" size={20} color={theme.colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContentContainer}
          >
            <Text
              style={[styles.modalDescription, { color: theme.text.primary }]}
            >
              {description}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  showMoreButton: {
    paddingVertical: spacing.xs,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default DescriptionSection;
