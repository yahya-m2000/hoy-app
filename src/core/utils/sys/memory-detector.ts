/**
 * Memory Leak Detection System
 * Detects and prevents memory leaks in React Native components
 */

import { logger } from './log';

interface MemoryStats {
  timers: number;
  listeners: number;
  networkListeners: number;
  total: number;
}

class MemoryLeakDetector {
  private timers = new Set<number>();
  private listeners = new Set<string>();
  private networkListeners = new Set<string>();
  private maxTimers = 50;
  private maxListeners = 100;

  trackTimer(id: number): void {
    this.timers.add(id);
    if (this.timers.size > this.maxTimers) {
      logger.warn(`Too many active timers: ${this.timers.size}`, {
        module: 'MemoryLeakDetector'
      });
    }
  }

  untrackTimer(id: number): void {
    this.timers.delete(id);
  }

  trackListener(id: string): void {
    this.listeners.add(id);
    if (this.listeners.size > this.maxListeners) {
      logger.warn(`Too many active listeners: ${this.listeners.size}`, {
        module: 'MemoryLeakDetector'
      });
    }
  }

  untrackListener(id: string): void {
    this.listeners.delete(id);
  }

  getStats(): MemoryStats {
    return {
      timers: this.timers.size,
      listeners: this.listeners.size,
      networkListeners: this.networkListeners.size,
      total: this.timers.size + this.listeners.size + this.networkListeners.size,
    };
  }

  reset(): void {
    this.timers.clear();
    this.listeners.clear();
    this.networkListeners.clear();
  }
}

export const memoryDetector = new MemoryLeakDetector();

export const getMemoryStats = () => memoryDetector.getStats();
export const resetMemoryTracking = () => memoryDetector.reset(); 