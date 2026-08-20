/**
 * Sentry No-op Stub — safe when @sentry/react-native is not installed
 */
export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

export interface SentryUser {
  id: string;
  username?: string;
  email?: string;
  gamerTag?: string;
}

export interface Transaction {
  name?: string;
  op?: string;
  finish: (status?: string) => void;
  setStatus: (status: string) => void;
  setTag: (key: string, value: string) => void;
  setData: (key: string, value: any) => void;
}

export const init = (_config?: any): void => {
  try {
    const { logger } = require('../core/logger/logger.service');
    logger.info('⚠️ Sentry disabled (noop stub)');
  } catch {}
};

export const captureException = (error: any, _hint?: any): void => {
  try {
    const { logger } = require('../core/logger/logger.service');
    logger.error('Sentry.captureException (noop):', { error });
  } catch {
    console.error('Sentry.captureException (noop)', error);
  }
};

export const captureMessage = (message: string, _level?: SeverityLevel): void => {
  try {
    console.log('[Sentry noop]', message);
  } catch {}
};

export const setUser = (_user: SentryUser | null): void => {};
export const setTag = (_key: string, _value: string): void => {};
export const setContext = (_name: string, _ctx: Record<string, any>): void => {};
export const addBreadcrumb = (_breadcrumb: any): void => {};

export const startTransaction = (ctx?: { name?: string; op?: string }): Transaction => ({
  name: ctx?.name,
  op: ctx?.op,
  finish: () => {},
  setStatus: () => {},
  setTag: () => {},
  setData: () => {},
});

export const withScope = (fn: (scope: any) => void): void => {
  try {
    fn({
      setTag: () => {},
      setUser: () => {},
      setContext: () => {},
      setLevel: () => {},
      setExtra: () => {},
    });
  } catch {}
};

export const Severity = {
  Fatal: 'fatal' as SeverityLevel,
  Error: 'error' as SeverityLevel,
  Warning: 'warning' as SeverityLevel,
  Log: 'log' as SeverityLevel,
  Info: 'info' as SeverityLevel,
  Debug: 'debug' as SeverityLevel,
};

const Sentry = {
  init,
  captureException,
  captureMessage,
  setUser,
  setTag,
  setContext,
  addBreadcrumb,
  startTransaction,
  withScope,
  Severity,
};

export default Sentry;
