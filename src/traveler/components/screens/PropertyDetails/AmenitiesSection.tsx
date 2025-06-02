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
import Amenity from "./Amenity";

interface AmenitiesSectionProps {
  amenities: string[];
}

const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ amenities }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.headerContainer}>
          <MaterialIcons
            name="star"
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
            {t("property.whatThisPlaceOffers")}
          </Text>
        </View>

        <View style={styles.amenitiesContainer}>
          {amenities?.slice(0, 6).map((amenity, index) => (
            <Amenity key={index} name={amenity} />
          ))}
        </View>

        {amenities && amenities.length > 6 && (
          <TouchableOpacity
            style={[
              styles.showAllButton,
              {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[800]
                  : theme.colors.grayPalette[100],
                borderColor: isDark
                  ? theme.colors.grayPalette[700]
                  : theme.colors.grayPalette[200],
              },
            ]}
            onPress={() => setShowModal(true)}
          >
            {" "}
            <Text
              style={[
                styles.showAllButtonText,
                { color: theme.colors.primary },
              ]}
            >
              {amenities.length === 1
                ? t("property.showAllSingle", { count: amenities.length })
                : t("property.showAllMultiple", { count: amenities.length })}
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Amenities Modal */}
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
                name="star"
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
                {t("property.whatThisPlaceOffers")}
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
            <View style={styles.modalAmenitiesContainer}>
              {amenities?.map((amenity, index) => (
                <Amenity key={index} name={amenity} />
              ))}
            </View>
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
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  showAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  showAllButtonText: {
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
  modalAmenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default AmenitiesSection;
