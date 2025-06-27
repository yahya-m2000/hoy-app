/**
 * Temporary debugging component to catch text rendering errors
 * Add this to _layout.tsx to help identify the source of the 4 text errors
 */

import React, { ReactNode } from "react";
import { Text, View } from "react-native";

interface State {
  hasError: boolean;
}

interface Props {
  children: ReactNode;
}

class TextErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State | null {
    // Update state so the next render will show the fallback UI.
    if (
      error.message &&
      error.message.includes(
        "Text strings must be rendered within a <Text> component"
      )
    ) {
      console.error("🚨 Text Error Caught:", error);
      console.error("🚨 Error Stack:", error.stack);
      return { hasError: true };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (
      error.message &&
      error.message.includes(
        "Text strings must be rendered within a <Text> component"
      )
    ) {
      console.error("🚨 Text Error Details:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View style={{ padding: 10, backgroundColor: "red" }}>
          <Text style={{ color: "white" }}>Text Error Caught</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default TextErrorBoundary;
