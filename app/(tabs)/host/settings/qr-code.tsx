import React from "react";

// Features
import { useCurrentUser } from "@features/user/hooks";
import { QRCodeScreen } from "src/features/account/screens/QRCodeScreen";

// Shared
import { Screen } from "@shared/components";

export default function QRCodeModalScreen() {
  const { data: user } = useCurrentUser();

  return (
    <Screen>
      <QRCodeScreen user={user || null} />
    </Screen>
  );
}
