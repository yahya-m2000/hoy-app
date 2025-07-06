import React from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { Container, Text, Button, Icon } from "@shared/components";
import { spacing, iconSize } from "@core/design";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "@core/hooks";

interface DraftProperty {
  _id: string;
  name?: string;
  propertyType: string;
  address: {
    city?: string;
    state?: string;
  };
  currentStep?: number;
  currentSubstep?: number;
  updatedAt: string;
  images: string[];
}

interface DraftSelectionStepProps {
  drafts: DraftProperty[];
  onContinueDraft: (draft: DraftProperty) => void;
  onCreateNew: () => void;
  loading?: boolean;
}

const DraftSelectionStep: React.FC<DraftSelectionStepProps> = ({
  drafts,
  onContinueDraft,
  onCreateNew,
  loading = false,
}) => {
  const { theme } = useTheme();
  const getProgressText = (draft: DraftProperty) => {
    if (!draft.currentStep) return "Just started";

    const stepNames = ["About Your Place", "Make It Stand Out", "Finish Up"];
    const stepName = stepNames[draft.currentStep - 1] || "In Progress";

    return `Step ${draft.currentStep}: ${stepName}`;
  };

  const getDraftTitle = (draft: DraftProperty) => {
    if (draft.name?.trim()) return draft.name;
    if (draft.address.city) return `Property in ${draft.address.city}`;
    return `${
      draft.propertyType.charAt(0).toUpperCase() + draft.propertyType.slice(1)
    } Listing`;
  };

  const renderDraftItem = ({ item: draft }: { item: DraftProperty }) => (
    <TouchableOpacity onPress={() => onContinueDraft(draft)}>
      <Container
        backgroundColor="surface"
        padding="lg"
        style={{
          borderRadius: 12,
        }}
      >
        <Container flexDirection="row" alignItems="center" marginBottom="xs">
          <Container flex={1}>
            <Text variant="h6" color="onSurface">
              {getDraftTitle(draft)}
            </Text>
            <Container>
              <Text variant="caption" color="onSurfaceVariant">
                {getProgressText(draft)}
              </Text>
            </Container>
          </Container>

          {draft.images.length > 0 && (
            <Container
              backgroundColor="surfaceVariant"
              style={{ borderRadius: 8 }}
              justifyContent="center"
              alignItems="center"
            >
              <Icon
                name="image-outline"
                size={iconSize.md}
                color={theme.text.primary}
              />
              <Text variant="caption" color="onSurfaceVariant">
                {draft.images.length}
              </Text>
            </Container>
          )}
        </Container>

        <Container
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text variant="caption" color="onSurfaceVariant">
            Last edited&nbsp;
            {formatDistanceToNow(new Date(draft.updatedAt), {
              addSuffix: true,
            })}
          </Text>

          <Icon
            name="chevron-forward"
            size={iconSize.xs}
            color={theme.text.primary}
          />
        </Container>
      </Container>
    </TouchableOpacity>
  );

  return (
    <Container flex={1}>
      {/* Header */}
      <Container marginBottom="xl">
        <Container marginBottom="sm">
          <Text variant="h2" color="onBackground">
            Continue Your Listing
          </Text>
        </Container>
        <Text variant="body" color="onBackgroundVariant">
          You have saved properties in progress. Choose one to continue or start
          fresh.
        </Text>
      </Container>

      {/* Create New Button */}
      <Container marginBottom="xl">
        <Button
          title="Create New Property"
          variant="primary"
          onPress={onCreateNew}
          disabled={loading}
        />
      </Container>

      {/* Drafts List */}
      {drafts.length > 0 && (
        <Container flex={1}>
          <Container marginBottom="md">
            <Text variant="h6" color="onBackground">
              Your Drafts ({drafts.length})
            </Text>
          </Container>

          <FlatList
            data={drafts}
            renderItem={renderDraftItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: spacing.xxl }}
          />
        </Container>
      )}
    </Container>
  );
};

export default DraftSelectionStep;
