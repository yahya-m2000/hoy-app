import React from "react";
import { Container, Text } from "@shared/components/base";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shared/hooks/useTheme";
interface SearchSummaryProps {
  location: string;
  guests: number;
  resultsCount: number;
  dates?: string;
}

export const SearchSummary: React.FC<SearchSummaryProps> = ({
  location,
  guests,
  resultsCount,
  dates,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <Container
      backgroundColor={isDark ? theme.colors.gray[800] : theme.white}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: isDark
          ? theme.colors.gray[700]
          : theme.colors.gray[200],
      }}
      paddingHorizontal="lg"
      paddingVertical="md"
    >
      <Container flexDirection="row" alignItems="center" marginBottom="xs">
        <Ionicons
          name="location-outline"
          size={16}
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
        />
        <Container marginLeft="xs">
          <Text
            size="md"
            weight="medium"
            color={isDark ? theme.colors.gray[200] : theme.colors.gray[800]}
          >
            {location}
          </Text>
        </Container>
      </Container>

      <Container flexDirection="row" alignItems="center" marginBottom="xs">
        <Container flexDirection="row" alignItems="center" marginRight="md">
          <Ionicons
            name="people-outline"
            size={14}
            color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
          />
          <Container marginLeft="xs">
            <Text
              size="sm"
              color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
            >
              {guests} {guests === 1 ? "guest" : "guests"}
            </Text>
          </Container>
        </Container>

        {dates && (
          <Container flexDirection="row" alignItems="center">
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
            />
            <Container marginLeft="xs">
              <Text
                size="sm"
                color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
              >
                {dates}
              </Text>
            </Container>
          </Container>
        )}
      </Container>

      <Text
        size="sm"
        color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
      >
        {resultsCount} {resultsCount === 1 ? "property" : "properties"} found
      </Text>
    </Container>
  );
};
