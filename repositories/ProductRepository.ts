import { db } from '../utils/db';

export interface ProductRow {
  id: string;
  platform: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  sku: string | null;
  barcode: string | null;
  in_stock: number;
  stock_quantity: number | null;
  sync_status: string;
  created_at: number;
  updated_at: number;
}

export interface CreateProductInput {
  id: string;
  platform?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: string;
  sku?: string;
  barcode?: string;
  inStock?: boolean;
  stockQuantity?: number;
}

export class ProductRepository {
  async upsert(input: CreateProductInput): Promise<void> {
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO products (id, platform, name, description, price, image_url, category_id, sku, barcode, in_stock, stock_quantity, sync_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name, description = excluded.description, price = excluded.price,
         image_url = excluded.image_url, category_id = excluded.category_id, sku = excluded.sku,
         barcode = excluded.barcode, in_stock = excluded.in_stock, stock_quantity = excluded.stock_quantity,
         sync_status = excluded.sync_status, updated_at = excluded.updated_at`,
      [
        input.id,
        input.platform ?? null,
        input.name,
        input.description ?? null,
        input.price,
        input.imageUrl ?? null,
        input.categoryId ?? null,
        input.sku ?? null,
        input.barcode ?? null,
        input.inStock !== false ? 1 : 0,
        input.stockQuantity ?? null,
        now,
        now,
      ]
    );
  }

  async findById(productId: string): Promise<ProductRow | null> {
    return db.getFirstAsync<ProductRow>('SELECT * FROM products WHERE id = ?', [productId]);
  }

  async findByBarcode(barcode: string): Promise<ProductRow | null> {
    return db.getFirstAsync<ProductRow>('SELECT * FROM products WHERE barcode = ?', [barcode]);
  }

  async findAll(categoryId?: string): Promise<ProductRow[]> {
    if (categoryId) {
      return db.getAllAsync<ProductRow>('SELECT * FROM products WHERE category_id = ? ORDER BY name ASC', [categoryId]);
    }
    return db.getAllAsync<ProductRow>('SELECT * FROM products ORDER BY name ASC');
  }

  async search(query: string): Promise<ProductRow[]> {
    const pattern = `%${query}%`;
    return db.getAllAsync<ProductRow>('SELECT * FROM products WHERE name LIKE ? OR sku LIKE ? OR barcode LIKE ? ORDER BY name ASC', [
      pattern,
      pattern,
      pattern,
    ]);
  }

  async delete(productId: string): Promise<void> {
    await db.runAsync('DELETE FROM products WHERE id = ?', [productId]);
  }

  async deleteAll(): Promise<void> {
    await db.runAsync('DELETE FROM products');
  }
}

export const productRepository = new ProductRepository();
