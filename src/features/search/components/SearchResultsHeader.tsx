import React from "react";
import { TouchableOpacity } from "react-native";
import { Container, Text } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@core/hooks/useTheme";

interface SearchResultsHeaderProps {
  title: string;
}

export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  title,
}) => {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  return (
    <Container
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        backgroundColor: isDark
          ? theme.colors.gray[900]
          : theme.colors.gray[50],
        borderBottomColor: isDark
          ? theme.colors.gray[800]
          : theme.colors.gray[200],
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          marginRight: 16,
          padding: 8,
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={isDark ? theme.colors.gray[100] : theme.colors.gray[800]}
        />
      </TouchableOpacity>

      <Container flex={1}>
        <Text
          size="xl"
          weight="bold"
          color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </Container>
    </Container>
  );
};
