/**
 * Simple logger utility for the application
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  category?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private logs: LogEntry[] = [];

  private createLogEntry(
    level: LogLevel,
    message: string,
    category?: string,
    data?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      category,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  info(message: string, category?: string, data?: Record<string, unknown>): void {
    const entry = this.createLogEntry('info', message, category, data);
    this.logs.push(entry);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${category || 'INFO'}] ${message}`, data || '');
    }
  }

  warn(message: string, category?: string, data?: Record<string, unknown>): void {
    const entry = this.createLogEntry('warn', message, category, data);
    this.logs.push(entry);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[${category || 'WARN'}] ${message}`, data || '');
    }
  }

  error(message: string, category?: string, data?: Record<string, unknown>): void {
    const entry = this.createLogEntry('error', message, category, data);
    this.logs.push(entry);
    console.error(`[${category || 'ERROR'}] ${message}`, data || '');
  }

  debug(message: string, category?: string, data?: Record<string, unknown>): void {
    const entry = this.createLogEntry('debug', message, category, data);
    this.logs.push(entry);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${category || 'DEBUG'}] ${message}`, data || '');
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();