/**
 * Modal component types for Properties module
 * Contains types for property modal-related components
 */

import type { ExtendedUser } from "@shared/types";

/**
 * Props for MessageHostModal component
 */
export interface MessageHostModalProps {
  visible: boolean;
  onClose: () => void;
  host: ExtendedUser | null;
  propertyTitle: string;
  messageContent: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  sendingMessage: boolean;
}

/**
 * Props for CollectionsModal component
 */
export interface CollectionsModalProps {
  visible: boolean;
  propertyId?: string; // Made optional for general collection management
  onClose: () => void;
  onCollectionToggle?: (collectionId: string, isAdded: boolean) => void;
}
