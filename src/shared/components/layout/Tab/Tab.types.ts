import type { ReactNode } from "react";
import type { ContainerProps } from "../Container/Container.types";

export interface TabProps extends Omit<ContainerProps, "children"> {
  children: ReactNode;
  backgroundColor?: string;
  borderTopWidth?: number;
  borderColor?: string;
  height?: number;
  position?: "absolute" | "relative" | "fixed";
}
