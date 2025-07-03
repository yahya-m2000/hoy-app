/**
 * Settings component
 * Renders a section of settings items with title and content
 */

import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Base Components
import { Container, Icon, Text } from "@shared/components";

// Hooks
import { useTheme } from "@core/hooks";

// Types
import type { SettingsItem } from "@core/types";
import { iconSize } from "src/core/design";

interface SettingsProps {
  title: string;
  items: SettingsItem[];
}

export default function SettingsSection({ title, items }: SettingsProps) {
  const { theme, isDark } = useTheme();

  return (
    <Container marginBottom="lg">
      {/* Section Title */}
      {title && (
        <Text
          variant="caption"
          weight="semibold"
          color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          style={{
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 8,
          }}
        >
          {title}
        </Text>
      )}

      {/* Settings Items Container */}
      <Container
        borderBottomWidth={1}
        borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.action}
            disabled={!item.action}
            activeOpacity={0.7}
          >
            <Container
              flexDirection="row"
              alignItems="center"
              paddingVertical="lg"
            >
              {/* Icon Container */}
              <Container
                borderRadius="sm"
                alignItems="center"
                justifyContent="center"
                marginRight="md"
              >
                <Icon
                  name={item.icon as any}
                  size={iconSize.md}
                  color={theme.text.primary}
                />
              </Container>

              {/* Content Container */}
              <Container flex={1}>
                <Text
                  variant="body"
                  weight="medium"
                  color={theme.text.primary}
                  style={{ marginBottom: item.subtitle ? 2 : 0 }}
                >
                  {item.title}
                </Text>
              </Container>

              {/* Right Element or Chevron */}
              {item.rightElement ? (
                item.rightElement
              ) : (
                <Icon
                  name="chevron-forward-outline"
                  size={iconSize.sm}
                  color={theme.text.primary}
                />
              )}
            </Container>
          </TouchableOpacity>
        ))}
      </Container>
    </Container>
  );
}
