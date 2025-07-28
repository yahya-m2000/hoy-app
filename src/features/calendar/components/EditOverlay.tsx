import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { setEditModalVisible } from "../../../../app/(tabs)/host/_layout";
import { fontSize, fontWeight, radius, spacing, iconSize } from "@core/design";
import {
  AnimatedContainer,
  AnimatedPressableContainer,
  Icon,
} from "@shared/components";

interface EditOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDaysCount?: number;
}

export const EditOverlay: React.FC<EditOverlayProps> = ({
  isVisible,
  onClose,
  selectedDaysCount = 3,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    console.log(`EditOverlay visibility changed: ${isVisible}`);
    setEditModalVisible(isVisible);

    if (isVisible) {
      setIsAnimating(true);
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isVisible]);
  // Grid item press handlers
  const handleItem2Press = useCallback(() => {
    console.log("Item 2 pressed");
    // Add your logic here
  }, []);

  const handleItem3Press = useCallback(() => {
    console.log("Item 3 pressed");
    // Add your logic here
  }, []);
  // Don't render anything if not visible or not animating
  if (!isVisible && !isAnimating) {
    return null;
  }
  return (
    <View style={styles.overlayContainer}>
      {/* Header with close button and selected days */}
      <View style={styles.editHeader}>
        {" "}
        <AnimatedPressableContainer
          fadeInDelay={0}
          animationDuration={300}
          isExiting={!isVisible}
          style={[styles.closeButton, { backgroundColor: theme.black }]}
          onPress={onClose}
        >
          <Icon name="close" size={iconSize.md} color={theme.white} />
        </AnimatedPressableContainer>
        <AnimatedPressableContainer
          fadeInDelay={0}
          animationDuration={300}
          isExiting={!isVisible}
          style={[
            styles.selectedDaysContainer,
            { backgroundColor: theme.black },
          ]}
        >
          <Text style={styles.selectedDaysText}>
            {t("features.calendar.daysSelected", { count: selectedDaysCount })}
          </Text>
        </AnimatedPressableContainer>
      </View>

      {/* Grid containers */}
      <View style={styles.gridContainer}>
        {/* 1x2 Grid */}
        <View style={styles.topGrid}>
          {" "}
          <AnimatedContainer
            style={[styles.gridItem, { backgroundColor: theme.black }]}
            fadeInDelay={20}
            animationDuration={300}
            isExiting={!isVisible}
          >
            {" "}
            <Text style={styles.gridItemText}>
              {t("features.calendar.editItem1")}
            </Text>
          </AnimatedContainer>{" "}
          <AnimatedPressableContainer
            onPress={handleItem2Press}
            style={[styles.gridItem, { backgroundColor: theme.black }]}
            fadeInDelay={20}
            animationDuration={300}
            isExiting={!isVisible}
          >
            <Text style={styles.gridItemText}>
              {t("features.calendar.editItem2")}
            </Text>
          </AnimatedPressableContainer>
        </View>

        {/* 1x1 Grid */}
        <View style={styles.bottomGrid}>
          {" "}
          <AnimatedPressableContainer
            onPress={handleItem3Press}
            style={[styles.gridItem, { backgroundColor: theme.black }]}
            fadeInDelay={40}
            animationDuration={300}
            isExiting={!isVisible}
          >
            <Text style={styles.gridItemText}>
              {t("features.calendar.editItem3")}
            </Text>
          </AnimatedPressableContainer>{" "}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",

    bottom: 30,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  closeButton: {
    borderRadius: radius.circle,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDaysContainer: {
    borderRadius: radius.circle,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flex: 1,
  },
  selectedDaysText: {
    color: "#FFFFFF",
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textAlign: "center",
  },
  gridContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: spacing.lg,
  },
  topGrid: {
    height: 150,
    flexDirection: "row",
    gap: spacing.md,
    flex: 1,
  },
  bottomGrid: {
    flex: 1,
  },
  gridItem: {
    borderRadius: radius.xxl,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  gridItemText: {
    color: "#FFFFFF",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
  },
});
