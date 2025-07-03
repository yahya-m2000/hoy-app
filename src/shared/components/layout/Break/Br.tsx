import React from "react";
import { StyleSheet, View } from "react-native";

interface BrProps {
  double?: boolean;
  triple?: boolean;
  quad?: boolean;
}

const baseHeight = 6;

const makeStyles = ({ double, triple, quad }: BrProps) =>
  StyleSheet.create({
    br: {
      width: "100%",
      height: quad
        ? 4 * baseHeight
        : triple
        ? 3 * baseHeight
        : double
        ? 2 * baseHeight
        : baseHeight,
      flexBasis: "100%",
    },
  });

const Br: React.FC<BrProps> = ({ double, triple, quad }) => {
  const styles = makeStyles({
    double,
    triple,
    quad,
  });

  return <View style={styles.br} />;
};

export default Br;
