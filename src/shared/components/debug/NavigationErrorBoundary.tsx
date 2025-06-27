/**
 * Navigation Error Boundary
 * Specifically designed to catch text rendering errors in navigation wrappers
 */

import React, { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@shared/components/base/Text";

interface State {
  hasError: boolean;
  errorDetails: string | null;
}

interface Props {
  children: ReactNode;
  name: string;
}

class NavigationErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorDetails: null };
  }

  static getDerivedStateFromError(error: Error): State | null {
    // Check if this is a text rendering error
    if (
      error.message &&
      error.message.includes(
        "Text strings must be rendered within a <Text> component"
      )
    ) {
      console.error(`🚨 TEXT ERROR in ${this.name}:`, error);
      console.error("🚨 Error Stack:", error.stack);
      return {
        hasError: true,
        errorDetails: `Text error in ${this.name}: ${error.message}`,
      };
    }
    return null;
  }

  static name: string;

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (
      error.message &&
      error.message.includes(
        "Text strings must be rendered within a <Text> component"
      )
    ) {
      console.error(
        `🚨 TEXT ERROR DETAILS in ${this.props.name}:`,
        error,
        errorInfo
      );
      console.error("🚨 Component Stack:", errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ padding: 20, backgroundColor: "#ffebee" }}>
          <Text style={{ color: "#c62828", fontSize: 12 }}>
            Navigation Error in {this.props.name}: Check console for details
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default NavigationErrorBoundary;
