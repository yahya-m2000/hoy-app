import React from "react";
import { TouchableOpacity } from "react-native";
import { Container, Text } from "@shared/components";
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
    <Container
      borderRadius="lg"
      borderWidth={1}
      borderColor={theme.border}
      marginBottom="lg"
    >
      <Text
        variant="h6"
        weight="bold"
        color={theme.text.primary}
        style={{ padding: spacing.lg, paddingBottom: spacing.md }}
      >
        {title}
      </Text>
      <Container flexDirection="row" flexWrap="wrap">
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: `${100 / columns}%`,
              padding: spacing.md,
              borderRightWidth: index % columns !== columns - 1 ? 1 : 0,
              borderBottomWidth: index < items.length - columns ? 1 : 0,
              borderColor: theme.border,
            }}
            onPress={item.onPress}
            disabled={!item.onPress}
          >
            <Container alignItems="flex-start" style={{ position: "relative" }}>
              <Container
                flexDirection="row"
                alignItems="center"
                marginBottom="xs"
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.icon === "star" ? "#FFB400" : "#007AFF"}
                />
                <Text
                  variant="body2"
                  color="secondary"
                  style={{ marginLeft: spacing.xs }}
                >
                  {item.label}
                </Text>
              </Container>
              <Text variant="h5" weight="bold" color={theme.text.primary}>
                {item.value}
              </Text>
              {item.onPress && (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.text.secondary}
                  style={{ position: "absolute", top: 0, right: 0 }}
                />
              )}
            </Container>
          </TouchableOpacity>
        ))}
      </Container>
    </Container>
  );
};

export default MetricGrid;
