import React from "react";
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@common-context/ThemeContext";

interface PropertyActionsHeaderProps {
  headerOpacity: Animated.AnimatedAddition<number>;
  propertyTitle: string;
  onGoBack: () => void;
  onShare: () => void;
  onWishlist: () => void;
  isWishlisted: boolean;
}

const PropertyActionsHeader: React.FC<PropertyActionsHeaderProps> = ({
  headerOpacity,
  propertyTitle,
  onGoBack,
  onShare,
  onWishlist,
  isWishlisted,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <>
      {/* Fixed header that appears on scroll */}
      <Animated.View
        style={[
          styles.fixedHeader,
          {
            opacity: headerOpacity,
            backgroundColor: isDark
              ? theme.colors.grayPalette[900]
              : theme.colors.grayPalette[50],
            borderBottomColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
      >
        <Text
          style={[
            styles.fixedHeaderTitle,
            {
              color: isDark
                ? theme.colors.grayPalette[50]
                : theme.colors.grayPalette[900],
            },
          ]}
          numberOfLines={1}
        >
          {propertyTitle}
        </Text>
      </Animated.View>

      {/* Fixed action buttons - always visible */}
      <View style={styles.fixedButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.circleButton,
            {
              backgroundColor: isDark
                ? "rgba(0, 0, 0, 0.5)"
                : "rgba(255, 255, 255, 0.9)",
            },
          ]}
          onPress={onGoBack}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={
              isDark
                ? theme.colors.grayPalette[50]
                : theme.colors.grayPalette[900]
            }
          />
        </TouchableOpacity>

        <View style={styles.rightButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.circleButton,
              {
                backgroundColor: isDark
                  ? "rgba(0, 0, 0, 0.5)"
                  : "rgba(255, 255, 255, 0.9)",
              },
            ]}
            onPress={onShare}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color={
                isDark
                  ? theme.colors.grayPalette[50]
                  : theme.colors.grayPalette[900]
              }
            />
          </TouchableOpacity>
          {/* Heart/Wishlist Button - Always visible */}
          <TouchableOpacity
            style={[
              styles.circleButton,
              {
                backgroundColor: isDark
                  ? "rgba(0, 0, 0, 0.5)"
                  : "rgba(255, 255, 255, 0.9)",
              },
            ]}
            onPress={onWishlist}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={22}
              color={
                isWishlisted
                  ? "#ff385c"
                  : isDark
                  ? theme.colors.grayPalette[50]
                  : theme.colors.grayPalette[900]
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 88 : 80,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 44 : 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  fixedHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  fixedButtonsContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 44 : 30,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  rightButtonsContainer: {
    flexDirection: "row",
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default PropertyActionsHeader;
