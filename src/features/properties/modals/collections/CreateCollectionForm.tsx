/**
 * Create Collection Form Component
 * Form for creating new collections with input and actions
 */

import React from "react";
import { useTheme } from "@core/hooks";
import { Container, Text, Button, Input, Icon, Tab } from "@shared/components";
import { spacing, radius, iconSize } from "@core/design";
import { InfoBox } from "src/features/host";

interface CreateCollectionFormProps {
  collectionName: string;
  onNameChange: (name: string) => void;
  onClear: () => void;
  onCreate: () => void;
  creating: boolean;
  isValidName: boolean;
  characterCount: number;
}

export const CreateCollectionForm: React.FC<CreateCollectionFormProps> =
  React.memo(
    ({
      collectionName,
      onNameChange,
      onClear,
      onCreate,
      creating,
      isValidName,
      characterCount,
    }) => {
      const { theme } = useTheme();

      return (
        <Container flex={1} style={{ position: "relative" }}>
          {/* Header */}
          <Container paddingHorizontal="lg" paddingVertical="lg">
            <Container
              flexDirection="row"
              alignItems="center"
              marginBottom="sm"
            >
              <Icon
                name="heart-outline"
                size={iconSize.md}
                color={theme.colors.primary}
                style={{ marginRight: spacing.sm }}
              />
              <Text variant="h6" weight="bold" color="primary">
                Create New Wishlist
              </Text>
            </Container>
            <Text variant="body" color="secondary">
              Give your wishlist a memorable name to help you organize your
              favorite properties
            </Text>
          </Container>

          {/* Content */}
          <Container paddingHorizontal="lg" paddingVertical="xl">
            <Container marginBottom="md">
              <Text
                variant="body"
                weight="medium"
                color="primary"
                marginBottom="sm"
              >
                Wishlist Name
              </Text>
              <Input
                placeholder="e.g., Dream Beach Houses, City Apartments, Mountain Cabins"
                value={collectionName}
                onChangeText={onNameChange}
                maxLength={50}
              />
            </Container>

            {/* Character Counter & Validation */}
            <Container
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginBottom="lg"
            >
              <Container flexDirection="row" alignItems="center">
                {characterCount > 0 && (
                  <>
                    <Icon
                      name={isValidName ? "checkmark-circle" : "alert-circle"}
                      size={iconSize.sm}
                      color={
                        isValidName
                          ? theme.colors.success
                          : theme.colors.warning
                      }
                      style={{ marginRight: spacing.xs }}
                    />
                    <Text
                      variant="caption"
                      color={isValidName ? "success" : "warning"}
                      weight="medium"
                    >
                      {isValidName
                        ? "Valid name"
                        : "Name must be 3-50 characters"}
                    </Text>
                  </>
                )}
              </Container>
              <Text
                variant="caption"
                color={characterCount > 45 ? "warning" : "secondary"}
                weight="medium"
              >
                {characterCount}/50
              </Text>
            </Container>

            {/* Tips Section */}
            <InfoBox>
              <Container>
                <Text variant="subtitle" weight="medium" marginBottom="sm">
                  Tips for a great wishlist name:
                </Text>
                <Text variant="body" style={{ lineHeight: 20 }}>
                  • Use descriptive names like &quot;Beachfront Paradise&quot;
                  or &quot;Downtown Lofts&quot;{"\n"}• Keep it under 50
                  characters for easy reading{"\n"}• Avoid generic names like
                  &quot;Favorites&quot; or &quot;List 1&quot;
                </Text>
              </Container>
            </InfoBox>
          </Container>
        </Container>
      );
    }
  );

CreateCollectionForm.displayName = "CreateCollectionForm";
