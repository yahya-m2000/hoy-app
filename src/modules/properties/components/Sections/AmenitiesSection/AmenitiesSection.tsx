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
import { Text, Icon, Container } from "@shared/components/base";

// Constants
import { spacing } from "@shared/constants";
import Amenity from "./Amenity";
import type { AmenitiesSectionProps } from "../../types/sections";

const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ amenities }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const styles = createStyles(theme);

  return (
    <Container>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {t("property.whatThisPlaceOffers")}
        </Text>

        <View style={styles.amenitiesContainer}>
          {amenities?.slice(0, 6).map((amenity, index) => (
            <Amenity key={index} name={amenity} />
          ))}
        </View>

        {amenities && amenities.length > 6 && (
          <TouchableOpacity
            style={styles.showAllButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={[styles.showAllText, { color: theme.text.primary }]}>
              {amenities.length === 1
                ? t("property.showAllSingle", { count: amenities.length })
                : t("property.showAllMultiple", { count: amenities.length })}
            </Text>
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
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              {t("property.whatThisPlaceOffers")}
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
            <View style={styles.modalAmenitiesContainer}>
              {amenities?.map((amenity, index) => (
                <Amenity key={index} name={amenity} />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </Container>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {},
    title: {
      fontSize: 22,
      fontWeight: "600",
      marginBottom: spacing.md,
    },
    amenitiesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    showAllButton: {
      paddingVertical: spacing.xs,
    },
    showAllText: {
      fontSize: 14,
      fontWeight: "500",
      textDecorationLine: "underline",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      backgroundColor: theme.background.primary,
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
      backgroundColor: theme.background.secondary,
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
