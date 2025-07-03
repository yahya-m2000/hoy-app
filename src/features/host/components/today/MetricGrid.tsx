import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@core/hooks";
import { spacing } from "@core/design";
import { Ionicons } from "@expo/vector-icons";

export interface MetricItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}

interface MetricGridProps {
  title: string;
  items: MetricItem[];
  columns?: number;
}

const MetricGrid: React.FC<MetricGridProps> = ({
  title,
  items,
  columns = 2,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.gridItem,
              { width: `${100 / columns}%` },
              index % columns !== columns - 1 && styles.gridItemBorder,
              index < items.length - columns && styles.gridItemBottomBorder,
              { borderColor: theme.border },
            ]}
            onPress={item.onPress}
            disabled={!item.onPress}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.icon === "star" ? "#FFB400" : "#007AFF"}
                />
                <Text
                  style={[styles.itemLabel, { color: theme.text.secondary }]}
                >
                  {item.label}
                </Text>
              </View>
              <Text style={[styles.itemValue, { color: theme.text.primary }]}>
                {item.value}
              </Text>
              {item.onPress && (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.text.secondary}
                  style={styles.chevron}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    padding: spacing.md,
  },
  gridItemBorder: {
    borderRightWidth: 1,
  },
  gridItemBottomBorder: {
    borderBottomWidth: 1,
  },
  itemContent: {
    alignItems: "flex-start",
    position: "relative",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  itemLabel: {
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  itemValue: {
    fontSize: 20,
    fontWeight: "600",
  },
  chevron: {
    position: "absolute",
    top: 0,
    right: 0,
  },
});

export default MetricGrid;
