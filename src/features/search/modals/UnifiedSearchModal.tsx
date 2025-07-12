/**
 * Unified Search Modal Component
 * Handles different types of search inputs in a modular way
 */

import React, { useState, useEffect } from "react";
import {
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format, addDays, differenceInDays } from "date-fns";
// @ts-ignore
import { debounce } from "lodash";

// App context and hooks
import { useTheme } from "@core/hooks/useTheme";
import { useSearchForm } from "@features/search/hooks";

// Components
import {
  Button,
  Container,
  Header,
  Text,
  Icon,
  Calendar,
  Input,
} from "@shared/components";

// Constants
import { iconSize, spacing } from "@core/design";
import { t } from "i18next";
import { COUNTRIES } from "@core/utils/data/countries";

// Types
export type ModalType = "location" | "dates" | "travelers";

interface LocationResult {
  city: string;
  country: string;
  fullName?: string;
  coordinates?: { longitude: number; latitude: number };
}

interface UnifiedSearchModalProps {
  visible: boolean;
  modalType: ModalType;
  onClose: () => void;
  onComplete?: (data: any) => void;
}

import SearchLocationModal from "./location";
import SearchDateModal from "./dates";
import SearchTravelersModal from "./travelers";

export default function UnifiedSearchModal({
  visible,
  modalType,
  onClose,
  onComplete,
}: UnifiedSearchModalProps) {
  const { theme, isDark } = useTheme();
  const { searchState, updateSearchState } = useSearchForm();
  const insets = useSafeAreaInsets();

  // Render the correct modal section
  let content = null;
  switch (modalType) {
    case "location":
      content = (
        <SearchLocationModal
          visible={visible}
          onClose={onClose}
          onLocationSelected={onComplete}
        />
      );
      break;
    case "dates":
      content = (
        <SearchDateModal
          visible={visible}
          onClose={onClose}
          onDatesSelected={onComplete}
        />
      );
      break;
    case "travelers":
      content = (
        <SearchTravelersModal
          visible={visible}
          onClose={onClose}
          onTravelersSelected={onComplete}
        />
      );
      break;
    default:
      content = null;
  }

  return content;
}
