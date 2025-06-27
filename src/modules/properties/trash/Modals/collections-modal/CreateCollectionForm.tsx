/**
 * Create Collection Form Component
 * Form for creating new collections with input and actions
 */

import React from "react";
import { useTheme } from "@shared/hooks/useTheme";
import { Container, Text, Button, Input } from "@shared/components/base";
import { spacing } from "@shared/constants";

interface CreateCollectionFormProps {
  collectionName: string;
  onNameChange: (name: string) => void;
  onClear: () => void;
  onCreate: () => void;
  creating: boolean;
}

export const CreateCollectionForm: React.FC<CreateCollectionFormProps> =
  React.memo(
    ({ collectionName, onNameChange, onClear, onCreate, creating }) => {
      const { theme } = useTheme();

      return (
        <Container>
          {/* Content */}
          <Container flex={1} paddingHorizontal="lg" paddingVertical="lg">
            <Input
              placeholder="Name your wishlist"
              value={collectionName}
              onChangeText={onNameChange}
            />

            <Container>
              <Text variant="caption" color="secondary">
                {collectionName.length}/50 characters
              </Text>
            </Container>
          </Container>

          {/* Fixed Bottom Actions */}
          <Container
            paddingHorizontal="lg"
            paddingTop="md"
            borderTopWidth={1}
            style={{ borderTopColor: theme.border }}
          >
            <Container flexDirection="row" style={{ gap: spacing.md }}>
              <Container flex={1}>
                <Button
                  title="Clear"
                  variant="outline"
                  onPress={onClear}
                  disabled={!collectionName.trim()}
                />
              </Container>
              <Container flex={1}>
                <Button
                  title="Create"
                  variant="primary"
                  onPress={onCreate}
                  loading={creating}
                  disabled={!collectionName.trim() || creating}
                />
              </Container>
            </Container>
          </Container>
        </Container>
      );
    }
  );
