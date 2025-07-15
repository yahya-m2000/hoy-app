/**
 * WithSetupCheck Higher-Order Component
 * Wraps host screens and shows setup prompts when user hasn't completed setup
 */

import React from "react";
import { useHostSetupStatus } from "@features/host/hooks";
import { SetupPrompt } from "./SetupPrompt";

interface WithSetupCheckProps {
  children: React.ReactNode;
  showSetupPrompt?: boolean;
  promptVariant?: "default" | "compact" | "card";
  promptTitle?: string;
  promptMessage?: string;
}

export const WithSetupCheck: React.FC<WithSetupCheckProps> = ({
  children,
  showSetupPrompt = true,
  promptVariant = "default",
  promptTitle,
  promptMessage,
}) => {
  const { setupStatus, isLoading, setupModalVisible, refetch } =
    useHostSetupStatus();

  // Show loading state while checking setup status
  if (isLoading) {
    return <>{children}</>;
  }

  // If setup is complete, render the children normally
  if (setupStatus.isSetupComplete) {
    return <>{children}</>;
  }

  // If setup is not complete and we should show a prompt
  // Only show prompt if setup modal is not visible (user cancelled setup)
  if (showSetupPrompt && !setupModalVisible) {
    return (
      <SetupPrompt
        onStartSetup={() => {
          // Re-trigger the setup modal by refreshing the setup status
          // This will cause the layout to show the setup modal again
          refetch();
        }}
        variant={promptVariant}
        title={promptTitle}
        message={promptMessage}
      />
    );
  }

  // If setup is not complete but we don't want to show a prompt, render children
  return <>{children}</>;
};

/**
 * Higher-order function to wrap components with setup check
 */
export const withSetupCheck = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<WithSetupCheckProps, "children"> = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <WithSetupCheck {...options}>
      <Component {...props} />
    </WithSetupCheck>
  );

  WrappedComponent.displayName = `withSetupCheck(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
};
