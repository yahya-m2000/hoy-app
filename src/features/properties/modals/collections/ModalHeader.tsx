/**
 * Modal Header Component
 * Reusable header for modals with title and close/cancel button
 * Uses the base Header component for consistency
 */

import React from "react";
import { useTheme } from "@core/hooks";
import { Header, Container } from "@shared/components";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  showCloseIcon?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  showCloseIcon = true,
}) => {
  const { theme } = useTheme();

  return (
    <Container
      borderBottomWidth={1}
      style={{ borderBottomColor: theme.border }}
    >
      <Header
        title={title}
        variant="modal"
        useSafeArea={false}
        showDivider={false}
        right={{
          icon: showCloseIcon ? "close" : undefined,
          text: showCloseIcon ? undefined : "Cancel",
          onPress: onClose,
        }}
      />
    </Container>
  );
};
