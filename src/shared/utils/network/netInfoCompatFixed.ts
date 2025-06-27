/**
 * Temporary compatibility layer for @react-native-community/netinfo
 * This makes the app work with Expo Go by providing a simple mock implementation
 * To revert: just delete this file and restore the original imports
 */

// Mock the NetInfo interface to match @react-native-community/netinfo
export interface NetInfoState {
  type: string;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  details: any;
}

class NetInfoWrapper {
  private listeners: ((state: NetInfoState) => void)[] = [];
  private currentState: NetInfoState = {
    type: "wifi",
    isConnected: true,
    isInternetReachable: true,
    details: null,
  };

  constructor() {
    // Initialize with connected state - simple mock for Expo Go
  }

  private async updateNetworkState() {
    try {
      // Simple mock that assumes connection is available
      const newState: NetInfoState = {
        type: "wifi",
        isConnected: true,
        isInternetReachable: true,
        details: null,
      };

      // Only notify if state changed
      if (JSON.stringify(newState) !== JSON.stringify(this.currentState)) {
        this.currentState = newState;
        this.listeners.forEach((listener) => listener(newState));
      }
    } catch (error) {
      console.warn("NetInfo compatibility layer error:", error);
    }
  }

  async fetch(): Promise<NetInfoState> {
    await this.updateNetworkState();
    return this.currentState;
  }

  addEventListener(listener: (state: NetInfoState) => void): () => void {
    this.listeners.push(listener);

    // Immediately call with current state
    listener(this.currentState);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

const netInfoInstance = new NetInfoWrapper();

// Export the same interface as @react-native-community/netinfo
const NetInfo = {
  fetch: () => netInfoInstance.fetch(),
  addEventListener: (listener: (state: NetInfoState) => void) =>
    netInfoInstance.addEventListener(listener),
};

export { NetInfoState as NetInfoStateType };
export default NetInfo;
