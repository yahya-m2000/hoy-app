import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

/**
 * Row - Flexible horizontal layout component
 *
 * Props:
 * - align: alignItems ("flex-start" | "center" | "flex-end" | "stretch" | "baseline")
 * - justify: justifyContent ("flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly")
 * - gap: number (horizontal spacing between children)
 * - wrap: boolean (enables flexWrap)
 * - flex: number (flex grow/shrink)
 * - style: additional styles
 */
interface RowProps {
  children: React.ReactNode;
  align?: ViewStyle["alignItems"];
  justify?: ViewStyle["justifyContent"];
  gap?: number;
  wrap?: boolean;
  flex?: number;
  style?: ViewStyle;
}

const Row: React.FC<RowProps> = ({
  children,
  align = "center",
  justify,
  gap,
  wrap = false,
  flex,
  style,
  ...rest
}) => {
  // Apply gap by injecting marginRight except for last child
  const childrenArray = React.Children.toArray(children);
  const spacedChildren = gap
    ? childrenArray.map((child, idx) => {
        if (!React.isValidElement(child)) return child;
        // Only add marginRight if the child is a host component (e.g., 'View', 'Text')
        if (idx < childrenArray.length - 1 && typeof child.type === "string") {
          return React.cloneElement(child as React.ReactElement<any>, {
            style: [(child as any).props?.style, { marginRight: gap }],
          });
        }
        return child;
      })
    : childrenArray;

  return (
    <View
      style={[
        { flexDirection: "row", alignItems: align },
        justify && { justifyContent: justify },
        wrap && { flexWrap: "wrap" },
        flex !== undefined && { flex },
        style,
      ]}
      {...rest}
    >
      {spacedChildren}
    </View>
  );
};

export { Row };
