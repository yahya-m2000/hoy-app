/**
 * Memory Leak Detection and Prevention System
 * 
 * Simple, effective system to detect and prevent memory leaks
 * 
 * @module @core/utils/sys/memory-leak-detector
 * @author Hoy Development Team
 * @version 1.0.0 - Simplified Implementation
 */

import { logger } from './log';
import React from 'react';

// ========================================
// CONFIGURATION
// ========================================

interface MemoryLeakConfig {
  enabled: boolean;
  maxTimers: number;
  maxListeners: number;
  checkInterval: number;
  warnThreshold: number;
}

const DEFAULT_CONFIG: MemoryLeakConfig = {
  enabled: __DEV__,
  maxTimers: 50,
  maxListeners: 100,
  checkInterval: 30000,
  warnThreshold: 25,
};

let config: MemoryLeakConfig = { ...DEFAULT_CONFIG };

// ========================================
// TRACKING INTERFACES
// ========================================

interface TrackedTimer {
  id: string;
  type: 'timeout' | 'interval';
  createdAt: number;
  component?: string;
}

interface TrackedListener {
  id: string;
  event: string;
  createdAt: number;
  component?: string;
}

interface MemoryLeakReport {
  timers: TrackedTimer[];
  listeners: TrackedListener[];
  totalItems: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

// ========================================
// TRACKING STORAGE
// ========================================

class MemoryTracker {
  private timers = new Map<string, TrackedTimer>();
  private listeners = new Map<string, TrackedListener>();
  private timerIdCounter = 0;
  private listenerIdCounter = 0;

  constructor() {
    this.startMonitoring();
  }

  /**
   * Track a timer
   */
  public trackTimer(type: 'timeout' | 'interval'): string {
    if (!config.enabled) return '';

    const id = `timer_${++this.timerIdCounter}`;
    const component = this.extractComponentName();

    this.timers.set(id, {
      id,
      type,
      createdAt: Date.now(),
      component,
    });

    if (this.timers.size > config.maxTimers) {
      this.handleExcessiveTimers();
    }

    return id;
  }

  /**
   * Untrack a timer
   */
  public untrackTimer(id: string): void {
    this.timers.delete(id);
  }

  /**
   * Track an event listener
   */
  public trackListener(event: string): string {
    if (!config.enabled) return '';

    const id = `listener_${++this.listenerIdCounter}`;
    const component = this.extractComponentName();

    this.listeners.set(id, {
      id,
      event,
      createdAt: Date.now(),
      component,
    });

    if (this.listeners.size > config.maxListeners) {
      this.handleExcessiveListeners();
    }

    return id;
  }

  /**
   * Untrack a listener
   */
  public untrackListener(id: string): void {
    this.listeners.delete(id);
  }

  /**
   * Extract component name from stack trace
   */
  private extractComponentName(): string {
    if (!__DEV__) return 'unknown';
    
    try {
      const stack = new Error().stack || '';
      const componentMatch = stack.match(/at\s+(\w+(?:Screen|Component|Context|Provider|Modal|Hook))/);
      if (componentMatch) {
        return componentMatch[1];
      }

      const fileMatch = stack.match(/\/([^\/]+)\.tsx?/);
      if (fileMatch) {
        return fileMatch[1];
      }

      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Handle excessive timers
   */
  private handleExcessiveTimers(): void {
    const count = this.timers.size;
    logger.warn(`[MemoryLeakDetector] Excessive timers: ${count}/${config.maxTimers}`, {
      module: 'MemoryLeakDetector'
    });

    if (__DEV__) {
      console.warn(`🚨 MEMORY LEAK: ${count} active timers detected!`);
    }
  }

  /**
   * Handle excessive listeners
   */
  private handleExcessiveListeners(): void {
    const count = this.listeners.size;
    logger.warn(`[MemoryLeakDetector] Excessive listeners: ${count}/${config.maxListeners}`, {
      module: 'MemoryLeakDetector'
    });

    if (__DEV__) {
      console.warn(`🚨 MEMORY LEAK: ${count} active listeners detected!`);
    }
  }

  /**
   * Start periodic monitoring
   */
  private startMonitoring(): void {
    if (!config.enabled) return;

    setInterval(() => {
      this.performLeakCheck();
    }, config.checkInterval);
  }

  /**
   * Perform leak check
   */
  private performLeakCheck(): void {
    const report = this.generateReport();
    
    if (report.riskLevel === 'high' || report.riskLevel === 'critical') {
      logger.warn('[MemoryLeakDetector] Memory leak risk detected', {
        riskLevel: report.riskLevel,
        totalItems: report.totalItems,
        module: 'MemoryLeakDetector'
      });
    }
  }

  /**
   * Generate memory leak report
   */
  public generateReport(): MemoryLeakReport {
    const timers = Array.from(this.timers.values());
    const listeners = Array.from(this.listeners.values());
    const totalItems = timers.length + listeners.length;
    
    let riskLevel: MemoryLeakReport['riskLevel'] = 'low';
    if (totalItems > config.warnThreshold * 4) {
      riskLevel = 'critical';
    } else if (totalItems > config.warnThreshold * 2) {
      riskLevel = 'high';
    } else if (totalItems > config.warnThreshold) {
      riskLevel = 'medium';
    }

    const recommendations: string[] = [];
    if (timers.length > config.warnThreshold) {
      recommendations.push(`Clear ${timers.length} active timers`);
    }
    if (listeners.length > config.warnThreshold) {
      recommendations.push(`Remove ${listeners.length} event listeners`);
    }

    return {
      timers,
      listeners,
      totalItems,
      riskLevel,
      recommendations,
    };
  }

  /**
   * Get current stats
   */
  public getStats(): {
    timers: number;
    listeners: number;
    total: number;
  } {
    return {
      timers: this.timers.size,
      listeners: this.listeners.size,
      total: this.timers.size + this.listeners.size,
    };
  }

  /**
   * Reset all tracking
   */
  public reset(): void {
    this.timers.clear();
    this.listeners.clear();
  }
}

// ========================================
// GLOBAL INSTANCE
// ========================================

const memoryTracker = new MemoryTracker();

// ========================================
// SAFE TIMER HOOKS
// ========================================

/**
 * React hook for safe timers with automatic cleanup
 */
export const useSafeTimer = () => {
  const activeTimers = React.useRef<Set<NodeJS.Timeout>>(new Set());

  React.useEffect(() => {
    const timers = activeTimers.current;
    return () => {
      timers.forEach((id: NodeJS.Timeout) => {
        clearTimeout(id);
        clearInterval(id);
      });
      timers.clear();
    };
  }, []);

  return {
    setTimeout: (callback: () => void, delay?: number): NodeJS.Timeout => {
      const trackingId = memoryTracker.trackTimer('timeout');
      const id = setTimeout(() => {
        activeTimers.current.delete(id);
        memoryTracker.untrackTimer(trackingId);
        callback();
      }, delay);
      activeTimers.current.add(id);
      return id;
    },
    setInterval: (callback: () => void, delay?: number): NodeJS.Timeout => {
      const id = setInterval(callback, delay);
      activeTimers.current.add(id);
      return id;
    },
    clearTimeout: (id: NodeJS.Timeout): void => {
      clearTimeout(id);
      activeTimers.current.delete(id);
    },
    clearInterval: (id: NodeJS.Timeout): void => {
      clearInterval(id);
      activeTimers.current.delete(id);
    },
  };
};

/**
 * React hook for safe event listeners
 */
export const useSafeEventListener = (
  event: string, 
  listener: (...args: unknown[]) => void,
  eventEmitter: { on: (event: string, listener: (...args: unknown[]) => void) => () => void },
  dependencies: unknown[] = []
): void => {
  React.useEffect(() => {
    const trackingId = memoryTracker.trackListener(event);
    const unsubscribe = eventEmitter.on(event, listener);
    
    return () => {
      unsubscribe();
      memoryTracker.untrackListener(trackingId);
    };
  }, [event, eventEmitter, listener]);
};

// ========================================
// TRACKING FUNCTIONS
// ========================================

export const trackTimer = (type: 'timeout' | 'interval'): string => {
  return memoryTracker.trackTimer(type);
};

export const untrackTimer = (id: string): void => {
  memoryTracker.untrackTimer(id);
};

export const trackListener = (event: string): string => {
  return memoryTracker.trackListener(event);
};

export const untrackListener = (id: string): void => {
  memoryTracker.untrackListener(id);
};

// ========================================
// MONITORING & REPORTING
// ========================================

export const getMemoryLeakReport = (): MemoryLeakReport => {
  return memoryTracker.generateReport();
};

export const getMemoryStats = () => {
  return memoryTracker.getStats();
};

export const resetMemoryTracking = (): void => {
  memoryTracker.reset();
};

export const updateMemoryLeakConfig = (newConfig: Partial<MemoryLeakConfig>): void => {
  config = { ...config, ...newConfig };
};

export const getMemoryLeakConfig = (): MemoryLeakConfig => {
  return { ...config };
};

// ========================================
// EXPORTS
// ========================================

export {
  MemoryLeakConfig,
  MemoryLeakReport,
  TrackedTimer,
  TrackedListener,
  memoryTracker,
}; 