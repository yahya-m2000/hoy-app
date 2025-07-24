import { ImageSourcePropType } from "react-native";
import { User } from "@shared/types/user";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export type AvatarStatus = "online" | "offline" | "away" | "busy" | null;

export interface AvatarProps {
  size?: AvatarSize;
  source?: string | ImageSourcePropType | null;
  name?: string;
  showBorder?: boolean;
  status?: AvatarStatus;
  user?: User | null;
}