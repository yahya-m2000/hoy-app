/**
 * Step Navigation Tab Component
 * Reusable navigation tab for reservation flow steps
 */

import React from "react";
import { Container, Button, Tab } from "@shared/components/";

interface StepNavigationTabProps {
  // Back button props
  showBackButton?: boolean;
  backButtonTitle?: string;
  onBackPress?: () => void;
  backButtonDisabled?: boolean;

  // Next/Continue button props
  showNextButton?: boolean;
  nextButtonTitle?: string;
  onNextPress?: () => void;
  nextButtonDisabled?: boolean;
  nextButtonLoading?: boolean;

  // Layout props
  spacing?: number;
  stackButtons?: boolean; // If true, buttons stack vertically
}

export const StepNavigationTab: React.FC<StepNavigationTabProps> = ({
  showBackButton = true,
  backButtonTitle = "Back",
  onBackPress,
  backButtonDisabled = false,

  showNextButton = true,
  nextButtonTitle = "Continue",
  onNextPress,
  nextButtonDisabled = false,
  nextButtonLoading = false,

  spacing = 16,
  stackButtons = false,
}) => {
  if (!showBackButton && !showNextButton) {
    return null;
  }

  if (stackButtons) {
    return (
      <Tab>
        <Container style={{ gap: spacing, width: "100%" }}>
          {showNextButton && onNextPress && (
            <Button
              title={nextButtonTitle}
              onPress={onNextPress}
              variant="primary"
              size="medium"
              radius="circle"
              disabled={nextButtonDisabled}
              loading={nextButtonLoading}
              style={{
                opacity: nextButtonDisabled ? 0.5 : 1,
              }}
            />
          )}

          {showBackButton && onBackPress && (
            <Button
              title={backButtonTitle}
              onPress={onBackPress}
              variant="outline"
              size="medium"
              radius="circle"
              disabled={backButtonDisabled}
            />
          )}
        </Container>
      </Tab>
    );
  }

  return (
    <Tab>
      {showBackButton && onBackPress ? (
        <Button
          title={backButtonTitle}
          onPress={onBackPress}
          variant="outline"
          size="medium"
          radius="circle"
          disabled={backButtonDisabled}
          style={{ flex: 1 }}
        />
      ) : (
        <Container style={{ flex: 1 }}>
          <></>
        </Container>
      )}

      {showNextButton && onNextPress && (
        <Button
          title={nextButtonTitle}
          onPress={onNextPress}
          variant="primary"
          size="medium"
          radius="circle"
          disabled={nextButtonDisabled}
          loading={nextButtonLoading}
          style={{
            flex: 1,
            opacity: nextButtonDisabled ? 0.5 : 1,
            marginLeft: showBackButton && onBackPress ? spacing : 0,
          }}
        />
      )}
    </Tab>
  );
};

export default StepNavigationTab;
