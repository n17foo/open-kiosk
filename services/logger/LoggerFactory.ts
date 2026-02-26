import { LogLevel, LoggerInterface, LogEntry, LogTransport } from './LoggerInterface';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

class Logger implements LoggerInterface {
  constructor(
    private context: string,
    private factory: LoggerFactory
  ) {}

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.emit(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.emit(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.emit(LogLevel.WARN, message, metadata);
  }

  error(info: { message: string; metadata?: Record<string, unknown> }, error?: Error): void {
    this.emit(LogLevel.ERROR, info.message, info.metadata, error);
  }

  private emit(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      level,
      context: this.context,
      message,
      timestamp: Date.now(),
      metadata,
      error,
    };

    this.factory.dispatch(entry);
  }
}

export class LoggerFactory {
  private static instance: LoggerFactory;
  private transports: LogTransport[] = [];

  private constructor() {
    this.addDefaultTransport();
  }

  static getInstance(): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerFactory();
    }
    return LoggerFactory.instance;
  }

  createLogger(context: string): LoggerInterface {
    return new Logger(context, this);
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  removeTransport(name: string): void {
    this.transports = this.transports.filter(t => t.name !== name);
  }

  dispatch(entry: LogEntry): void {
    for (const transport of this.transports) {
      if (LOG_LEVEL_PRIORITY[entry.level] >= LOG_LEVEL_PRIORITY[transport.minLevel]) {
        try {
          transport.log(entry);
        } catch {
          // Transport failure should not crash the app
        }
      }
    }
  }

  private addDefaultTransport(): void {
    this.addTransport({
      name: 'console',
      minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
      log(entry: LogEntry): void {
        const prefix = `[${entry.level.toUpperCase()}] [${entry.context}]`;
        const meta = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';

        switch (entry.level) {
          case LogLevel.ERROR:
            if (entry.error) {
              // eslint-disable-next-line no-console
              console.error(`${prefix} ${entry.message}${meta}`, entry.error);
            } else {
              // eslint-disable-next-line no-console
              console.error(`${prefix} ${entry.message}${meta}`);
            }
            break;
          case LogLevel.WARN:
            // eslint-disable-next-line no-console
            console.warn(`${prefix} ${entry.message}${meta}`);
            break;
          case LogLevel.INFO:
            // eslint-disable-next-line no-console
            console.info(`${prefix} ${entry.message}${meta}`);
            break;
          case LogLevel.DEBUG:
            // eslint-disable-next-line no-console
            console.debug(`${prefix} ${entry.message}${meta}`);
            break;
        }
      },
    });
  }
}

export const loggerFactory = LoggerFactory.getInstance();
