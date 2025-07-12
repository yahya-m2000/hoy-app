/**
 * Font Test Debug Screen
 * For testing font loading and display
 */

import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "src/shared/components/base";
import { useFonts } from "@core/hooks";

export default function FontTestScreen() {
  const { fontsLoaded, fontError } = useFonts();

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text variant="h1">Loading fonts...</Text>
      </View>
    );
  }

  if (fontError) {
    return (
      <View style={styles.container}>
        <Text variant="h1" color="error">
          Font Error
        </Text>
        <Text variant="body">{fontError}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="h1" weight="bold">
        Satoshi Bold - Heading 1
      </Text>
      <Text variant="h2" weight="bold">
        Satoshi Bold - Heading 2
      </Text>
      <Text variant="h3" weight="semibold">
        Satoshi SemiBold - Heading 3
      </Text>
      <Text variant="h4" weight="medium">
        Satoshi Medium - Heading 4
      </Text>
      <Text variant="h5" weight="normal">
        Satoshi Regular - Heading 5
      </Text>
      <Text variant="h6" weight="normal">
        Satoshi Regular - Heading 6
      </Text>

      <Text variant="subtitle" weight="medium">
        Satoshi Medium - Subtitle
      </Text>
      <Text variant="body" weight="normal">
        Satoshi Regular - Body
      </Text>
      <Text variant="body2" weight="normal">
        Satoshi Regular - Body 2
      </Text>
      <Text variant="caption" weight="normal">
        Satoshi Regular - Caption
      </Text>

      <Text variant="button" weight="semibold">
        Satoshi SemiBold - Button
      </Text>
      <Text variant="buttonSmall" weight="medium">
        Satoshi Medium - Small Button
      </Text>

      <Text variant="body" weight="normal" style={{ fontStyle: "italic" }}>
        Satoshi Italic - Regular Italic
      </Text>
      <Text variant="body" weight="bold" style={{ fontStyle: "italic" }}>
        Satoshi Bold Italic - Bold Italic
      </Text>

      <Text variant="body" weight="bold">
        Satoshi Bold - Bold Weight
      </Text>
      <Text variant="body" weight="semibold">
        Satoshi SemiBold - SemiBold Weight
      </Text>

      <Text variant="body" style={{ fontFamily: "Satoshi-Regular" }}>
        Direct font family: Satoshi-Regular
      </Text>
      <Text variant="body" style={{ fontFamily: "Satoshi-Bold" }}>
        Direct font family: Satoshi-Bold
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
});
