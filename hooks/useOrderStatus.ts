import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import type { OrderStatus, OrderStatusPhase } from '../services/interfaces';
import { LoggerFactory } from '../services/logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('useOrderStatus');

const POLL_INTERVAL_MS = 5000;
const TERMINAL_PHASES: OrderStatusPhase[] = ['completed', 'cancelled', 'refunded', 'error'];

interface UseOrderStatusOptions {
  /** Polling interval in ms (default 5000) */
  intervalMs?: number;
  /** Whether to start polling immediately (default true) */
  enabled?: boolean;
}

interface UseOrderStatusReturn {
  status: OrderStatus | null;
  isPolling: boolean;
  error: string | null;
  /** Manually refresh the status once */
  refresh: () => Promise<void>;
  /** Stop polling */
  stop: () => void;
}

export function useOrderStatus(orderId: string | null, options: UseOrderStatusOptions = {}): UseOrderStatusReturn {
  const { intervalMs = POLL_INTERVAL_MS, enabled = true } = options;
  const { service } = usePlatform();

  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    if (!orderId || !service?.checkout?.getOrderStatus) return;

    try {
      const orderStatus = await service.checkout.getOrderStatus(orderId);
      setStatus(orderStatus);
      setError(null);

      // Stop polling if we've reached a terminal phase
      if (TERMINAL_PHASES.includes(orderStatus.phase)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsPolling(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch order status';
      setError(message);
      logger.error({ message: 'Order status poll failed' }, err instanceof Error ? err : new Error(message));
    }
  }, [orderId, service]);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Start polling
  useEffect(() => {
    if (!enabled || !orderId || !service?.checkout?.getOrderStatus) {
      return;
    }

    stoppedRef.current = false;
    setIsPolling(true);

    // Initial fetch
    void fetchStatus();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      if (!stoppedRef.current) {
        void fetchStatus();
      }
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
    };
  }, [enabled, orderId, service, intervalMs, fetchStatus]);

  return { status, isPolling, error, refresh: fetchStatus, stop };
}
