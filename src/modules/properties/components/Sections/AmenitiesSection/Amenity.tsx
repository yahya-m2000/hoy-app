import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components/base/Text";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shared/hooks/useTheme";
import type { AmenityProps } from "../../../details/types/details";

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
