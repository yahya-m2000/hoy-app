import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

interface DescriptionSectionProps {
  description: string;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  description,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  // Check if description is long enough to warrant a "show more" button
  const shouldShowMoreButton = description && description.length > 150;
  const truncatedDescription = shouldShowMoreButton
    ? `${description.substring(0, 150)}...`
    : description;

  return (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.headerContainer}>
          <MaterialIcons
            name="info-outline"
            size={24}
            color={theme.colors.primary}
            style={styles.headerIcon}
          />{" "}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark
                  ? theme.colors.grayPalette[50]
                  : theme.colors.grayPalette[900],
              },
            ]}
          >
            {t("property.aboutTitle")}
          </Text>
        </View>

        <Text
          style={[
            styles.description,
            {
              color: isDark
                ? theme.colors.grayPalette[300]
                : theme.colors.grayPalette[700],
            },
          ]}
        >
          {truncatedDescription}
        </Text>

        {shouldShowMoreButton && (
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={styles.showMoreButton}
          >
            {" "}
            <Text
              style={[
                styles.showMoreButtonText,
                { color: theme.colors.primary },
              ]}
            >
              {t("property.showMore")}
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={theme.colors.primary}
            />
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
        <SafeAreaView
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[900]
                : theme.colors.white,
            },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[800]
                  : theme.colors.white,
                borderBottomColor: isDark
                  ? theme.colors.grayPalette[700]
                  : theme.colors.grayPalette[200],
              },
            ]}
          >
            <View style={styles.modalHeaderLeft}>
              <MaterialIcons
                name="info-outline"
                size={24}
                color={theme.colors.primary}
                style={styles.modalHeaderIcon}
              />{" "}
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[100]
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {t("property.aboutTitle")}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark
                    ? theme.colors.grayPalette[700]
                    : theme.colors.grayPalette[100],
                },
              ]}
              onPress={() => setShowModal(false)}
            >
              <MaterialIcons
                name="close"
                size={20}
                color={
                  isDark
                    ? theme.colors.grayPalette[300]
                    : theme.colors.grayPalette[600]
                }
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContentContainer}
          >
            <Text
              style={[
                styles.modalDescription,
                {
                  color: isDark
                    ? theme.colors.grayPalette[200]
                    : theme.colors.grayPalette[800],
                },
              ]}
            >
              {description}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: spacing.md,
    marginHorizontal: spacing.lg,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  showMoreButtonText: {
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalHeaderIcon: {
    marginRight: spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
