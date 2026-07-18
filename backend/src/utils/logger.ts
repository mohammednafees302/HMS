// ============================================================
// src/utils/logger.ts
// Structured logger wrapping console with log levels and
// colour output in development.
// ============================================================

import { env, isDev } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info:  '\x1b[32m', // green
  warn:  '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};
const RESET = '\x1b[0m';

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const currentLevel: number = LEVELS[(env.LOG_LEVEL as LogLevel) ?? 'debug'] ?? 0;

const format = (level: LogLevel, message: string, meta?: unknown): string => {
  const ts = new Date().toISOString();
  const color = isDev ? COLORS[level] : '';
  const reset = isDev ? RESET : '';
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `${color}[${ts}] [${level.toUpperCase()}]${reset} ${message}${metaStr}`;
};

const log = (level: LogLevel, message: string, meta?: unknown): void => {
  if (LEVELS[level] < currentLevel) return;
  const line = format(level, message, meta);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
};

export const logger = {
  debug: (message: string, meta?: unknown) => log('debug', message, meta),
  info:  (message: string, meta?: unknown) => log('info',  message, meta),
  warn:  (message: string, meta?: unknown) => log('warn',  message, meta),
  error: (message: string, meta?: unknown) => log('error', message, meta),
};
