import React, { createContext, useContext, useState, useMemo } from "react";
import { host } from "@core/api/services";
import { ContextErrorBoundary } from "@core/error/ContextErrorBoundary";

const HostContext = createContext<any>(null);

const HostProviderInternal = ({ children }: { children: React.ReactNode }) => {
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
      host,
    }),
    [dashboard, properties, reservations, messages, earnings]
  );

  return <HostContext.Provider value={value}>{children}</HostContext.Provider>;
};

export const HostProvider = ({ children }: { children: React.ReactNode }) => (
  <ContextErrorBoundary
    contextName="Host"
    critical={false}
    enableRetry={true}
    maxRetries={2}
  >
    <HostProviderInternal>{children}</HostProviderInternal>
  </ContextErrorBoundary>
);

export const useHost = () => {
  const context = useContext(HostContext);
  if (!context) {
    throw new Error("useHost must be used within a HostProvider");
  }
  return context;
};
