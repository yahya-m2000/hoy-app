// React imports
import React from "react";

// Third-party imports
import { Ionicons } from "@expo/vector-icons";

// Types
import { IconProps } from "./Icon.types";

const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "#000",
  style,
}) => {
  return <Ionicons name={name} size={size} color={color} style={style} />;
};

export default Icon;
