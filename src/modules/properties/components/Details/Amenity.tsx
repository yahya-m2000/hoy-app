import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shared/context";

// Constants
import { fontSize, spacing, radius, fontWeight } from "@shared/constants";

interface AmenityProps {
  name: string;
}

const Amenity: React.FC<AmenityProps> = ({ name }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.amenity}>
      <Ionicons
        name="checkmark-circle-outline"
        size={16}
        color={theme.colors.gray[500]}
      />
      <Text style={[styles.amenityText, { color: theme.text.primary }]}>
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
    paddingRight: 8,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "400",
    flex: 1,
  },
});

export default Amenity;
