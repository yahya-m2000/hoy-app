import React, { createContext, useContext, useState, useMemo } from "react";
import * as hostService from "@host/services/hostService";

const HostContext = createContext<any>(null);

export const HostProvider = ({ children }: { children: React.ReactNode }) => {
  const [dashboard, setDashboard] = useState(null);
  const [properties, setProperties] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [earnings, setEarnings] = useState(null);

  const value = useMemo(
    () => ({
      dashboard,
      setDashboard,
      properties,
      setProperties,
      reservations,
      setReservations,
      messages,
      setMessages,
      earnings,
      setEarnings,
      hostService,
    }),
    [dashboard, properties, reservations, messages, earnings]
  );

  return <HostContext.Provider value={value}>{children}</HostContext.Provider>;
};

export const useHostContext = () => useContext(HostContext);
