/**
 * Heading component for the Hoy application
 * Provides consistent heading styles with semantic variants
 */

// React
import React from "react";

// Components
import Text from "./Text";

// Types
import { HeadingProps } from "./Text.types";

const Heading: React.FC<HeadingProps> = ({
  children,
  variant = "h1",
  weight = "semibold",
  color,
  align = "left",
  style,
  ...props
}) => {
  return (
    <Text
      variant={variant}
      weight={weight}
      color={color}
      align={align}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
};

export default Heading;
