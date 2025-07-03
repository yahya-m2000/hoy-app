import React from "react";
import { useCurrentUser } from "@features/user/hooks";
import QRCodeScreen from "@features/account/screens/QRCodeScreen";

export default function QRCodeRoute() {
  const { data: currentUser } = useCurrentUser();

  return <QRCodeScreen user={currentUser || null} />;
}
