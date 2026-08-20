import type { LogLevel } from '../logger.types';

export interface LogTransport {
  log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void;
}

export class ConsoleTransport implements LogTransport {
  log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    const prefix = `[KONEX:${String(level).toUpperCase()}]`;

    if (context && Object.keys(context).length > 0) {
      console.log(prefix, message, context);
    } else {
      console.log(prefix, message);
    }
  }
}

export const consoleTransport = new ConsoleTransport();
