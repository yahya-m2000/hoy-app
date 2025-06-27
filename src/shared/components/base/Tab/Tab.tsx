import React from "react";
import { Container } from "../Container";
import type { TabProps } from "./Tab.types";

const Tab: React.FC<TabProps> = ({
  children,
  backgroundColor = "white",
  borderTopWidth = 1,
  borderColor = "rgba(0,0,0,0.1)",
  height = 80,
  position = "absolute",
  ...containerProps
}) => {
  return (
    <Container
      backgroundColor={backgroundColor}
      borderTopWidth={borderTopWidth}
      borderColor={borderColor}
      flexDirection="row"
      alignItems="flex-start"
      justifyContent="space-between"
      paddingHorizontal="lg"
      paddingVertical="sm"
      style={{
        position,
        bottom: 0,
        left: 0,
        right: 0,
        height,
      }}
      {...containerProps}
    >
      {children}
    </Container>
  );
};

export default Tab;
