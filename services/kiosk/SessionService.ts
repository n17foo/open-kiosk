import { LoggerFactory } from '../logger/LoggerFactory';
import { auditLogService } from '../audit/AuditLogService';
import { notificationService } from '../notifications/NotificationService';

export type SessionState = 'attract' | 'active' | 'idle' | 'admin';

type SessionListener = (state: SessionState) => void;

export class SessionService {
  private static instance: SessionService;
  private logger = LoggerFactory.getInstance().createLogger('SessionService');
  private state: SessionState = 'attract';
  private idleTimeoutMs = 120_000; // 2 minutes default
  private idleTimerId: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<SessionListener> = new Set();
  private sessionStartTime: number | null = null;

  private constructor() {}

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  getState(): SessionState {
    return this.state;
  }

  setIdleTimeout(ms: number): void {
    this.idleTimeoutMs = ms;
    this.logger.info(`Idle timeout set to ${ms}ms`);
  }

  startSession(): void {
    if (this.state === 'active') return;

    this.state = 'active';
    this.sessionStartTime = Date.now();
    this.resetIdleTimer();
    this.emit();

    this.logger.info('Customer session started');
    void auditLogService.log('session:started', {
      details: 'Customer session started',
    });
  }

  endSession(): void {
    this.clearIdleTimer();
    const duration = this.sessionStartTime ? Date.now() - this.sessionStartTime : 0;

    this.state = 'attract';
    this.sessionStartTime = null;
    this.emit();

    this.logger.info(`Customer session ended (duration: ${Math.round(duration / 1000)}s)`);
    void auditLogService.log('session:ended', {
      details: `Session duration: ${Math.round(duration / 1000)}s`,
      metadata: { durationMs: duration },
    });
  }

  enterAdminMode(): void {
    this.clearIdleTimer();
    this.state = 'admin';
    this.emit();
    this.logger.info('Entered admin mode');
  }

  exitAdminMode(): void {
    this.state = 'attract';
    this.emit();
    this.logger.info('Exited admin mode');
  }

  recordActivity(): void {
    if (this.state === 'active' || this.state === 'idle') {
      if (this.state === 'idle') {
        this.state = 'active';
        this.emit();
      }
      this.resetIdleTimer();
    }
  }

  showAttractScreen(): void {
    this.clearIdleTimer();
    this.state = 'attract';
    this.sessionStartTime = null;
    this.emit();

    this.logger.info('Attract screen shown');
    void auditLogService.log('kiosk:attract_shown');
  }

  addListener(listener: SessionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        this.logger.error({ message: 'Session listener error' }, err instanceof Error ? err : new Error(String(err)));
      }
    }
  }

  private resetIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimerId = setTimeout(() => {
      this.handleIdleTimeout();
    }, this.idleTimeoutMs);
  }

  private clearIdleTimer(): void {
    if (this.idleTimerId) {
      clearTimeout(this.idleTimerId);
      this.idleTimerId = null;
    }
  }

  private handleIdleTimeout(): void {
    this.logger.info('Idle timeout reached');
    this.state = 'idle';
    this.emit();

    notificationService.notify('Session Timeout', 'Customer session will reset due to inactivity', 'info');
    void auditLogService.log('session:timeout', {
      details: `Idle timeout after ${this.idleTimeoutMs}ms`,
    });

    // After a brief idle state, reset to attract screen
    setTimeout(() => {
      if (this.state === 'idle') {
        this.showAttractScreen();
      }
    }, 10_000);
  }

  reset(): void {
    this.clearIdleTimer();
    this.state = 'attract';
    this.sessionStartTime = null;
    this.listeners.clear();
  }
}

export const sessionService = SessionService.getInstance();
