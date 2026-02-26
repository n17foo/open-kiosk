import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('NetworkStatus');

export type NetworkState = 'online' | 'offline' | 'unknown';

type NetworkListener = (state: NetworkState) => void;

/**
 * Lightweight network-status monitor.
 * Works on both web (navigator.onLine + events) and React Native (NetInfo if available).
 */
class NetworkStatusMonitor {
  private state: NetworkState = 'unknown';
  private listeners = new Set<NetworkListener>();

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      this.state = navigator.onLine ? 'online' : 'offline';

      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => this.update('online'));
        window.addEventListener('offline', () => this.update('offline'));
      }
    }
  }

  private update(newState: NetworkState): void {
    if (this.state === newState) return;
    const prev = this.state;
    this.state = newState;
    logger.info(`Network state changed: ${prev} → ${newState}`);
    this.listeners.forEach(fn => fn(newState));
  }

  getState(): NetworkState {
    return this.state;
  }

  isOnline(): boolean {
    return this.state !== 'offline';
  }

  subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const networkStatus = new NetworkStatusMonitor();
