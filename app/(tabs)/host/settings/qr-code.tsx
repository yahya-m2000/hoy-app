import React from "react";
import { Screen } from "@shared/components/base";
import { useCurrentUser } from "@shared/hooks/useUser";
import { HostQRCodeScreen } from "./components/HostQRCodeScreen";

export default function QRCodeScreen() {
  const { data: user } = useCurrentUser();

  return (
    <Screen>
      <HostQRCodeScreen user={user || null} />
    </Screen>
  );
}
