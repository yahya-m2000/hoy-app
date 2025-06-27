/**
 * Example Host Calendar Screen
 * Demonstrates how to integrate the HostCalendarPage into a navigation screen
 */

import React from "react";
import { HostCalendarPage } from "../components/calendar";

interface HostCalendarScreenProps {
  route: {
    params: {
      propertyId: string;
      propertyName?: string;
    };
  };
}

const HostCalendarScreen: React.FC<HostCalendarScreenProps> = ({ route }) => {
  const { propertyId, propertyName } = route.params;

  return (
    <HostCalendarPage propertyId={propertyId} propertyName={propertyName} />
  );
};

export default HostCalendarScreen;
