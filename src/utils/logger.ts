type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  data?: any;
  context?: Record<string, any>;
}

class Logger {
  private isEnabled: boolean;
  private environment: string;
  private logQueue: Array<{
    level: LogLevel;
    message: string;
    data?: any;
    context?: Record<string, any>;
    timestamp: string;
  }> = [];
  private isFlushing = false;

  constructor() {
    this.environment = import.meta.env.MODE || 'development';

    // Enable logging in development and staging (preview deployments)
    // VERCEL_ENV will be 'preview' for staging deployments
    const vercelEnv = import.meta.env.VITE_VERCEL_ENV || '';
    const enableDebugLogs = import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true';

    this.isEnabled =
      this.environment === 'development' ||
      vercelEnv === 'preview' ||
      enableDebugLogs;
  }

  private async sendToServer(
    level: LogLevel,
    message: string,
    options?: LogOptions
  ) {
    // Only send to server in staging/preview environment
    const vercelEnv = import.meta.env.VITE_VERCEL_ENV || '';
    if (vercelEnv !== 'preview' && this.environment !== 'staging') {
      return;
    }

    try {
      const logEntry = {
        level,
        message,
        data: options?.data,
        context: {
          ...options?.context,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      // Queue the log
      this.logQueue.push(logEntry);

      // Debounce flushing
      if (!this.isFlushing) {
        this.isFlushing = true;
        setTimeout(() => this.flushLogs(), 1000);
      }
    } catch (error) {
      // Silently fail - don't break the app if logging fails
      console.error('Failed to queue log:', error);
    }
  }

  private async flushLogs() {
    if (this.logQueue.length === 0) {
      this.isFlushing = false;
      return;
    }

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logsToSend),
      });
    } catch (error) {
      // Silently fail - restore logs to queue for retry
      this.logQueue.unshift(...logsToSend);
    } finally {
      this.isFlushing = false;
    }
  }

  debug(message: string, options?: LogOptions) {
    if (!this.isEnabled) return;

    console.debug(`[DEBUG] ${message}`, options?.data || '');
    this.sendToServer('debug', message, options);
  }

  info(message: string, options?: LogOptions) {
    if (!this.isEnabled) return;

    console.info(`[INFO] ${message}`, options?.data || '');
    this.sendToServer('info', message, options);
  }

  warn(message: string, options?: LogOptions) {
    if (!this.isEnabled) return;

    console.warn(`[WARN] ${message}`, options?.data || '');
    this.sendToServer('warn', message, options);
  }

  error(message: string, options?: LogOptions) {
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, options?.data || '');
    this.sendToServer('error', message, options);
  }

  // Convenience method for logging with context
  log(message: string, data?: any) {
    this.info(message, { data });
  }
}

export const logger = new Logger();
