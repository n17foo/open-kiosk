import type { OrderStatus, OrderStatusPhase } from '../interfaces';

const PHASE_MESSAGES: Record<OrderStatusPhase, string> = {
  pending: 'Order is being processed',
  confirmed: 'Order confirmed',
  preparing: 'Order is being prepared',
  ready: 'Order is ready',
  completed: 'Order complete',
  cancelled: 'Order was cancelled',
  refunded: 'Order was refunded',
  error: 'Unable to retrieve order status',
};

export function getPhaseMessage(phase: OrderStatusPhase): string {
  return PHASE_MESSAGES[phase];
}

export function buildOrderStatus(
  orderId: string,
  phase: OrderStatusPhase,
  updatedAt?: Date | string,
  estimatedReadyAt?: Date
): OrderStatus {
  return {
    orderId,
    phase,
    displayMessage: getPhaseMessage(phase),
    updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
    estimatedReadyAt,
  };
}

export function buildErrorOrderStatus(orderId: string): OrderStatus {
  return buildOrderStatus(orderId, 'error');
}
