import React, { useEffect, useRef, useState } from "react";
import { Modal, Animated } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { useUserRole } from "@core/context";
import { Container } from "../../layout";
import { Text } from "../../base";

interface RoleChangeLoadingOverlayProps {
  visible: boolean;
}

const RoleChangeLoadingOverlay: React.FC<RoleChangeLoadingOverlayProps> = ({
  visible,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { userRole, pendingRole } = useUserRole();

  // Animated value for spinner
  const spinnerAnimation = useRef(new Animated.Value(0)).current;

  // State for animated ellipsis
  const [ellipsisIndex, setEllipsisIndex] = useState(0);
  const ellipsisStates = ["", ".", "..", "..."];

  const [message, setMessage] = useState<string>("");

  // Animate spinner
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spinnerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinnerAnimation.setValue(0);
    }
  }, [visible, spinnerAnimation]);

  // Animate ellipsis using interval
  useEffect(() => {
    if (!visible) {
      setEllipsisIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setEllipsisIndex((prev) => (prev + 1) % ellipsisStates.length);
    }, 400);
    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const targetRole = pendingRole ?? userRole;
      const txt =
        targetRole === "host"
          ? t("common.switchingToHost")
          : t("common.switchingToTraveler");
      setMessage(txt);
    }
  }, [visible, pendingRole, userRole, t]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible}>
      <Container
        flex={1}
        backgroundColor="background"
        justifyContent="center"
        alignItems="center"
      >
        <Container alignItems="center">
          {/* Loading spinner */}
          <Container marginBottom="lg" alignItems="center">
            <Animated.View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 3,
                borderColor: theme.colors.primaryPalette[300],
                borderTopColor: theme.colors.primary,
                transform: [
                  {
                    rotate: spinnerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              }}
            />
          </Container>

          {/* Switching text with animated ellipsis */}
          <Text
            variant="body"
            size="lg"
            weight="semibold"
            color={isDark ? "white" : "gray900"}
            align="center"
            style={{ marginBottom: 8 }}
          >
            {message}
          </Text>

          <Text
            variant="body"
            size="lg"
            weight="semibold"
            color="primary"
            align="center"
          >
            {ellipsisStates[ellipsisIndex]}
          </Text>
        </Container>
      </Container>
    </Modal>
  );
};

export default RoleChangeLoadingOverlay;
