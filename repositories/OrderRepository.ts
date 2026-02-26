import { db } from '../utils/db';
import { generateUUID } from '../utils/uuid';

export interface OrderRow {
  id: string;
  platform: string | null;
  platform_order_id: string | null;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  customer_name: string | null;
  customer_email: string | null;
  payment_method: string | null;
  payment_transaction_id: string | null;
  sync_status: string;
  created_at: number;
  updated_at: number;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  variants: string | null;
  created_at: number;
}

export interface CreateOrderInput {
  id?: string;
  platform: string | null;
  subtotal: number;
  tax: number;
  total: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  paymentMethod?: string;
  paymentTransactionId?: string;
}

export interface CreateOrderItemInput {
  orderId: string;
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variants?: string;
}

export class OrderRepository {
  async create(input: CreateOrderInput): Promise<string> {
    const id = input.id ?? generateUUID();
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO orders (id, platform, platform_order_id, status, subtotal, tax, total, currency,
        customer_name, customer_email, payment_method, payment_transaction_id, sync_status, created_at, updated_at)
       VALUES (?, ?, NULL, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        id,
        input.platform,
        input.subtotal,
        input.tax,
        input.total,
        input.currency ?? 'GBP',
        input.customerName ?? null,
        input.customerEmail ?? null,
        input.paymentMethod ?? null,
        input.paymentTransactionId ?? null,
        now,
        now,
      ]
    );
    return id;
  }

  async findById(orderId: string): Promise<OrderRow | null> {
    return db.getFirstAsync<OrderRow>('SELECT * FROM orders WHERE id = ?', [orderId]);
  }

  async findAll(status?: string): Promise<OrderRow[]> {
    if (status) {
      return db.getAllAsync<OrderRow>('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC', [status]);
    }
    return db.getAllAsync<OrderRow>('SELECT * FROM orders ORDER BY created_at DESC');
  }

  async findUnsynced(): Promise<OrderRow[]> {
    return db.getAllAsync<OrderRow>("SELECT * FROM orders WHERE sync_status = 'pending' ORDER BY created_at ASC");
  }

  async updateStatus(orderId: string, status: string): Promise<void> {
    const now = Date.now();
    await db.runAsync('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [status, now, orderId]);
  }

  async updateSyncStatus(orderId: string, syncStatus: string, platformOrderId?: string): Promise<void> {
    const now = Date.now();
    if (platformOrderId) {
      await db.runAsync('UPDATE orders SET sync_status = ?, platform_order_id = ?, updated_at = ? WHERE id = ?', [
        syncStatus,
        platformOrderId,
        now,
        orderId,
      ]);
    } else {
      await db.runAsync('UPDATE orders SET sync_status = ?, updated_at = ? WHERE id = ?', [syncStatus, now, orderId]);
    }
  }

  async delete(orderId: string): Promise<void> {
    await db.runAsync('DELETE FROM orders WHERE id = ?', [orderId]);
  }

  // ── Order Items ──────────────────────────────────────────────────────

  async addItem(input: CreateOrderItemInput): Promise<string> {
    const id = generateUUID();
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO order_items (id, order_id, product_id, name, quantity, unit_price, line_total, variants, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.orderId,
        input.productId ?? null,
        input.name,
        input.quantity,
        input.unitPrice,
        input.lineTotal,
        input.variants ?? null,
        now,
      ]
    );
    return id;
  }

  async getItemsByOrderId(orderId: string): Promise<OrderItemRow[]> {
    return db.getAllAsync<OrderItemRow>('SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC', [orderId]);
  }
}

export const orderRepository = new OrderRepository();
