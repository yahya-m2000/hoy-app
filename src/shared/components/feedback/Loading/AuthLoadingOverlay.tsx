import React from "react";
import { View, Modal } from "react-native";
import LoadingSpinner from "./LoadingSpinner";

interface AuthLoadingOverlayProps {
  visible: boolean;
}

const AuthLoadingOverlay: React.FC<AuthLoadingOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingSpinner />
      </View>
    </Modal>
  );
};

export default AuthLoadingOverlay;
