import React from "react";

// Features
import { useCurrentUser } from "@features/user/hooks";
import { QRCodeScreen } from "src/features/account";

export default function QRCode() {
  const { data: user } = useCurrentUser();

  return <QRCodeScreen user={user || null} />;
}
