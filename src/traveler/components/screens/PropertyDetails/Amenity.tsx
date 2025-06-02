import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@common-context/ThemeContext";

interface AmenityProps {
  name: string;
}

const Amenity: React.FC<AmenityProps> = ({ name }) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.amenity}>
      <Ionicons
        name="checkmark-circle-outline"
        size={16}
        color={theme.colors.primary}
      />
      <Text
        style={[
          styles.amenityText,
          {
            color: isDark
              ? theme.colors.grayPalette[50]
              : theme.colors.grayPalette[900],
          },
        ]}
      >
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  amenity: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 16,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default Amenity;
