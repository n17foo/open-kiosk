export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  error?: Error;
}

export interface LoggerInterface {
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(info: { message: string; metadata?: Record<string, unknown> }, error?: Error): void;
}

export interface LogTransport {
  name: string;
  minLevel: LogLevel;
  log(entry: LogEntry): void;
}
