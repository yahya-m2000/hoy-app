/**
 * Cycling Toast context for the Hoy application
 * Provides an app-wide notification system with simple cycling toasts
 *
 * @module @core/context/ToastContext
 * @author Hoy Development Team
 * @version 3.0.0
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  Animated,
} from "react-native";
import Toast, { type ToastType } from "@shared/components/feedback/Toast/Toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContextErrorBoundary } from "../error/ContextErrorBoundary";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  timestamp: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, "id" | "timestamp">) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
  getToastCount: () => number;
  skipToNextToast: () => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Custom hook to use toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Toast Provider Component Internal
const ToastProviderInternal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [currentToastId, setCurrentToastId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const positionAnimations = useRef<Map<string, Animated.Value>>(new Map());
  const opacityAnimations = useRef<Map<string, Animated.Value>>(new Map());
  const cycleTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize animations for a toast
  const initializeAnimations = useCallback((toastId: string) => {
    if (!positionAnimations.current.has(toastId)) {
      positionAnimations.current.set(toastId, new Animated.Value(-100));
    }
    if (!opacityAnimations.current.has(toastId)) {
      opacityAnimations.current.set(toastId, new Animated.Value(0));
    }
  }, []);

  // Clean up animations for a toast
  const cleanupAnimations = useCallback((toastId: string) => {
    positionAnimations.current.delete(toastId);
    opacityAnimations.current.delete(toastId);
  }, []);

  // Animate toast entrance
  const animateToastIn = useCallback(
    (toastId: string) => {
      initializeAnimations(toastId);

      const positionAnim = positionAnimations.current.get(toastId);
      const opacityAnim = opacityAnimations.current.get(toastId);

      if (positionAnim && opacityAnim) {
        Animated.parallel([
          Animated.timing(positionAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
    [initializeAnimations]
  );

  // Animate toast exit
  const animateToastOut = useCallback(
    (toastId: string, onComplete?: () => void) => {
      const positionAnim = positionAnimations.current.get(toastId);
      const opacityAnim = opacityAnimations.current.get(toastId);

      if (positionAnim && opacityAnim) {
        Animated.parallel([
          Animated.timing(positionAnim, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          cleanupAnimations(toastId);
          onComplete?.();
        });
      } else {
        cleanupAnimations(toastId);
        onComplete?.();
      }
    },
    [cleanupAnimations]
  );

  // Show the next toast in the queue
  const showNextToast = useCallback(() => {
    if (isTransitioning) return;

    setToasts((prevToasts) => {
      if (prevToasts.length === 0) {
        setCurrentToastId(null);
        return [];
      }

      const nextToast = prevToasts[0]; // Always take the first toast
      setCurrentToastId(nextToast.id);
      console.log("🍞 Showing next toast:", nextToast.message);

      // Animate the next toast in
      setTimeout(() => {
        animateToastIn(nextToast.id);
      }, 50);

      // Set auto-expire timer (3 seconds per toast)
      if (cycleTimer.current) {
        clearTimeout(cycleTimer.current);
      }

      cycleTimer.current = setTimeout(() => {
        console.log("🍞 Timer expired for toast:", nextToast.message);

        // Remove the current toast from the queue
        setToasts((currentToasts) => {
          const updatedToasts = currentToasts.filter(
            (t) => t.id !== nextToast.id
          );
          console.log(
            "🍞 Toast removed from queue, remaining toasts:",
            updatedToasts.length
          );

          if (updatedToasts.length > 0) {
            // Show the next toast (same position, just fade to new content)
            const nextToastInQueue = updatedToasts[0];
            setCurrentToastId(nextToastInQueue.id);
            console.log("🍞 Fading to next toast:", nextToastInQueue.message);

            // Set timer for the next toast
            cycleTimer.current = setTimeout(() => {
              console.log(
                "🍞 Timer expired for toast:",
                nextToastInQueue.message
              );
              // Handle the next toast
              setToasts((finalToasts) => {
                const finalUpdatedToasts = finalToasts.filter(
                  (t) => t.id !== nextToastInQueue.id
                );
                if (finalUpdatedToasts.length > 0) {
                  // Show the final toast
                  const nextToastInFinalQueue = finalUpdatedToasts[0];
                  setCurrentToastId(nextToastInFinalQueue.id);
                  console.log(
                    "🍞 Fading to final toast:",
                    nextToastInFinalQueue.message
                  );

                  // Set timer for the final toast
                  cycleTimer.current = setTimeout(() => {
                    console.log(
                      "🍞 Timer expired for final toast:",
                      nextToastInFinalQueue.message
                    );
                    // Now animate out the toast completely
                    if (currentToastId) {
                      animateToastOut(currentToastId, () => {
                        setToasts((veryFinalToasts) => {
                          const veryFinalUpdatedToasts = veryFinalToasts.filter(
                            (t) => t.id !== nextToastInFinalQueue.id
                          );
                          setCurrentToastId(null);
                          console.log(
                            "🍞 All toasts completed, clearing queue"
                          );
                          return veryFinalUpdatedToasts;
                        });
                      });
                    } else {
                      // No more toasts, animate out the current one
                      animateToastOut(nextToastInQueue.id, () => {
                        setCurrentToastId(null);
                        console.log("🍞 No more toasts, clearing queue");
                      });
                    }
                  }, 3000);
                } else {
                  // No more toasts, animate out the current one
                  animateToastOut(nextToastInQueue.id, () => {
                    setCurrentToastId(null);
                    console.log("🍞 No more toasts, clearing queue");
                  });
                }
                return finalUpdatedToasts;
              });
            }, 3000);
          } else {
            // No more toasts, animate out the current one
            animateToastOut(nextToast.id, () => {
              setCurrentToastId(null);
              console.log("🍞 No more toasts, clearing queue");
            });
          }

          return updatedToasts;
        });
      }, 3000);

      return prevToasts;
    });
  }, [isTransitioning, animateToastIn, animateToastOut]);

  // Skip to the next toast immediately
  const skipToNextToast = useCallback(() => {
    if (cycleTimer.current) {
      clearTimeout(cycleTimer.current);
    }

    setToasts((prevToasts) => {
      if (prevToasts.length === 0) {
        setCurrentToastId(null);
        return [];
      }

      // Remove current toast and show next
      const updatedToasts = prevToasts.slice(1); // Remove first toast
      console.log(
        "🍞 Manually skipped toast, remaining:",
        updatedToasts.length
      );

      if (updatedToasts.length > 0) {
        const nextToast = updatedToasts[0];
        setCurrentToastId(nextToast.id);
        console.log("🍞 Manually showing next toast:", nextToast.message);

        // Animate the next toast in
        setTimeout(() => {
          animateToastIn(nextToast.id);
        }, 50);

        // Set timer for the next toast
        cycleTimer.current = setTimeout(() => {
          console.log("🍞 Timer expired for toast:", nextToast.message);
          skipToNextToast(); // Recursively handle next
        }, 3000);
      } else {
        setCurrentToastId(null);
        console.log("🍞 No more toasts after manual skip");
      }

      return updatedToasts;
    });
  }, [animateToastIn]);

  const showToast = useCallback(
    (toast: Omit<ToastProps, "id" | "timestamp">) => {
      // Safety check: ensure message is valid
      if (
        !toast.message ||
        typeof toast.message !== "string" ||
        toast.message.trim() === ""
      ) {
        console.warn(
          "Toast: Attempted to show toast with invalid message:",
          toast
        );
        return;
      }

      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newToast: ToastProps = {
        ...toast,
        id,
        timestamp: Date.now(),
      };

      console.log("🍞 Adding toast to queue:", newToast.message);
      console.log("🍞 Current queue length:", toasts.length);

      setToasts((prev) => {
        const updatedToasts = [...prev, newToast];

        // If this is the first toast, start showing it
        if (updatedToasts.length === 1) {
          console.log("🍞 Starting first toast cycle");
          setCurrentToastId(newToast.id);

          // Animate the first toast in
          setTimeout(() => {
            animateToastIn(newToast.id);
          }, 50);

          // Set cycle timer (3 seconds per toast)
          console.log(
            "🍞 Setting timer for first toast, will expire in 3 seconds"
          );
          if (cycleTimer.current) {
            clearTimeout(cycleTimer.current);
          }

          cycleTimer.current = setTimeout(() => {
            console.log("🍞 Timer expired for toast:", newToast.message);

            // Remove the current toast from the queue
            setToasts((currentToasts) => {
              const updatedToasts = currentToasts.filter(
                (t) => t.id !== newToast.id
              );
              console.log(
                "🍞 Toast removed from queue, remaining toasts:",
                updatedToasts.length
              );

              if (updatedToasts.length > 0) {
                // Show the next toast (same position, just fade to new content)
                const nextToastInQueue = updatedToasts[0];
                setCurrentToastId(nextToastInQueue.id);
                console.log(
                  "🍞 Fading to next toast:",
                  nextToastInQueue.message
                );

                // Set timer for the next toast
                cycleTimer.current = setTimeout(() => {
                  console.log(
                    "🍞 Timer expired for toast:",
                    nextToastInQueue.message
                  );
                  // Handle the next toast
                  setToasts((finalToasts) => {
                    const finalUpdatedToasts = finalToasts.filter(
                      (t) => t.id !== nextToastInQueue.id
                    );
                    if (finalUpdatedToasts.length > 0) {
                      // Show the final toast
                      const nextToastInFinalQueue = finalUpdatedToasts[0];
                      setCurrentToastId(nextToastInFinalQueue.id);
                      console.log(
                        "🍞 Fading to final toast:",
                        nextToastInFinalQueue.message
                      );

                      // Set timer for the final toast
                      cycleTimer.current = setTimeout(() => {
                        console.log(
                          "🍞 Timer expired for final toast:",
                          nextToastInFinalQueue.message
                        );
                        // Now animate out the toast completely
                        if (currentToastId) {
                          animateToastOut(currentToastId, () => {
                            setToasts((veryFinalToasts) => {
                              const veryFinalUpdatedToasts =
                                veryFinalToasts.filter(
                                  (t) => t.id !== nextToastInFinalQueue.id
                                );
                              setCurrentToastId(null);
                              console.log(
                                "🍞 All toasts completed, clearing queue"
                              );
                              return veryFinalUpdatedToasts;
                            });
                          });
                        } else {
                          // No more toasts, animate out the current one
                          animateToastOut(nextToastInQueue.id, () => {
                            setCurrentToastId(null);
                            console.log("🍞 No more toasts, clearing queue");
                          });
                        }
                      }, 3000);
                    } else {
                      // No more toasts, animate out the current one
                      animateToastOut(nextToastInQueue.id, () => {
                        setCurrentToastId(null);
                        console.log("🍞 No more toasts, clearing queue");
                      });
                    }
                    return finalUpdatedToasts;
                  });
                }, 3000);
              } else {
                // No more toasts, animate out the current one
                animateToastOut(newToast.id, () => {
                  setCurrentToastId(null);
                  console.log("🍞 No more toasts, clearing queue");
                });
              }

              return updatedToasts;
            });
          }, 3000);
        }

        return updatedToasts;
      });
    },
    [toasts.length, animateToastIn, showNextToast]
  );

  const hideToast = useCallback(
    (id: string) => {
      if (id === currentToastId) {
        skipToNextToast();
      } else {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }
    },
    [currentToastId, skipToNextToast]
  );

  const hideAllToasts = useCallback(() => {
    if (cycleTimer.current) {
      clearTimeout(cycleTimer.current);
    }

    if (currentToastId) {
      animateToastOut(currentToastId, () => {
        setToasts([]);
        setCurrentToastId(null);
        setIsTransitioning(false);
      });
    } else {
      setToasts([]);
      setCurrentToastId(null);
      setIsTransitioning(false);
    }
  }, [currentToastId, animateToastOut]);

  const getToastCount = useCallback(() => {
    return toasts.length;
  }, [toasts.length]);

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    hideAllToasts,
    getToastCount,
    skipToNextToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Single Toast Container - stays visible, only content changes */}
      {toasts.length > 0 && currentToastId && (
        <View style={[styles.overlay, { pointerEvents: "box-none" }]}>
          <SafeAreaView
            style={[styles.container, { top: insets.top }]}
            pointerEvents="box-none"
          >
            <Animated.View
              style={[
                styles.toastWrapper,
                {
                  transform: [
                    {
                      translateY:
                        positionAnimations.current.get(currentToastId) ||
                        new Animated.Value(0),
                    },
                  ],
                  opacity:
                    opacityAnimations.current.get(currentToastId) ||
                    new Animated.Value(1),
                },
              ]}
            >
              {/* Queue indicator for multiple toasts */}
              {toasts.length > 1 && (
                <View style={styles.queueIndicator}>
                  <View style={styles.queueDot} />
                  {toasts.length > 2 && (
                    <View style={[styles.queueDot, styles.queueDotSecondary]} />
                  )}
                  {toasts.length > 3 && (
                    <View style={[styles.queueDot, styles.queueDotTertiary]} />
                  )}
                </View>
              )}

              {/* Single Toast with changing content */}
              <Toast
                visible={true}
                message={
                  toasts.find((t) => t.id === currentToastId)?.message || ""
                }
                type={
                  toasts.find((t) => t.id === currentToastId)?.type || "info"
                }
                action={toasts.find((t) => t.id === currentToastId)?.action}
                onHide={() => hideToast(currentToastId!)}
                showCloseButton={true}
                disableInternalAnimation={true}
              />
            </Animated.View>
          </SafeAreaView>
        </View>
      )}
    </ToastContext.Provider>
  );
};

// Toast Provider Component with Error Boundary
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ContextErrorBoundary
    contextName="Toast"
    critical={false}
    enableRetry={true}
    maxRetries={2}
    showErrorUI={false}
  >
    <ToastProviderInternal>{children}</ToastProviderInternal>
  </ContextErrorBoundary>
);

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 999999,
  },
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 999999,
    elevation: 999999,
    paddingTop: Platform.OS === "ios" ? 0 : 20,
  },
  toastWrapper: {
    position: "relative",
    marginBottom: 8,
  },
  queueIndicator: {
    position: "absolute",
    top: -8,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10000,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  queueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3b82f6",
    marginLeft: 2,
  },
  queueDotSecondary: {
    backgroundColor: "#22c55e",
  },
  queueDotTertiary: {
    backgroundColor: "#f59e0b",
  },
});
