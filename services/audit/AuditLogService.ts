import { LoggerFactory } from '../logger/LoggerFactory';
import { keyValueRepository } from '../../repositories/KeyValueRepository';

export type AuditAction =
  | 'order:created'
  | 'order:paid'
  | 'order:synced'
  | 'order:cancelled'
  | 'refund:processed'
  | 'return:created'
  | 'auth:login'
  | 'auth:logout'
  | 'auth:failed'
  | 'settings:changed'
  | 'drawer:opened'
  | 'sync:started'
  | 'sync:completed'
  | 'sync:failed'
  | 'session:started'
  | 'session:ended'
  | 'session:timeout'
  | 'kiosk:payment_started'
  | 'kiosk:payment_cancelled'
  | 'kiosk:attract_shown';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  userId?: string;
  userName?: string;
  details?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

const AUDIT_LOG_KEY = 'audit.log';
const MAX_ENTRIES = 2000;

export class AuditLogService {
  private static instance: AuditLogService;
  private logger = LoggerFactory.getInstance().createLogger('AuditLogService');

  private constructor() {}

  static getInstance(): AuditLogService {
    if (!AuditLogService.instance) {
      AuditLogService.instance = new AuditLogService();
    }
    return AuditLogService.instance;
  }

  async log(
    action: AuditAction,
    options: {
      userId?: string;
      userName?: string;
      details?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<void> {
    try {
      const entry: AuditEntry = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        userId: options.userId,
        userName: options.userName,
        details: options.details,
        metadata: options.metadata,
        timestamp: Date.now(),
      };

      const entries = await this.getEntries();
      entries.unshift(entry);

      const trimmed = entries.slice(0, MAX_ENTRIES);
      await keyValueRepository.setObject(AUDIT_LOG_KEY, trimmed);

      this.logger.debug(`Audit: ${action}${options.details ? ` — ${options.details}` : ''}`);
    } catch (err) {
      this.logger.error({ message: 'Failed to write audit log' }, err instanceof Error ? err : new Error(String(err)));
    }
  }

  async getEntries(limit?: number): Promise<AuditEntry[]> {
    try {
      const entries = await keyValueRepository.getObject<AuditEntry[]>(AUDIT_LOG_KEY);
      const all = entries ?? [];
      return limit ? all.slice(0, limit) : all;
    } catch {
      return [];
    }
  }

  async getEntriesByAction(action: AuditAction, limit = 100): Promise<AuditEntry[]> {
    const entries = await this.getEntries();
    return entries.filter(e => e.action === action).slice(0, limit);
  }

  async clear(): Promise<void> {
    await keyValueRepository.removeItem(AUDIT_LOG_KEY);
  }

  async exportCsv(): Promise<string> {
    const entries = await this.getEntries();
    const header = 'Timestamp,Action,User,Details\n';
    const rows = entries.map(e => {
      const date = new Date(e.timestamp).toISOString();
      const user = e.userName ?? e.userId ?? '';
      const details = (e.details ?? '').replace(/"/g, '""');
      return `"${date}","${e.action}","${user}","${details}"`;
    });
    return header + rows.join('\n');
  }
}

export const auditLogService = AuditLogService.getInstance();
