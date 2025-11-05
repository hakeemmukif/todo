import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  delayMs: 1000,
  backoff: 'exponential',
  onRetry: () => {},
};

export function useRetry() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: RetryOptions = {}
    ): Promise<T> => {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      let lastError: Error | null = null;
      let attempt = 0;

      while (attempt <= opts.maxRetries) {
        try {
          setRetryCount(attempt);

          if (attempt > 0) {
            setIsRetrying(true);
          }

          const result = await operation();

          // Success - reset state
          setIsRetrying(false);
          setRetryCount(0);
          return result;
        } catch (error) {
          lastError = error as Error;
          attempt++;

          // Don't retry on auth errors
          if (
            lastError.message?.includes('JWT') ||
            lastError.message?.includes('auth') ||
            lastError.message?.includes('unauthorized')
          ) {
            throw lastError;
          }

          if (attempt <= opts.maxRetries) {
            // Calculate delay with backoff
            const delay =
              opts.backoff === 'exponential'
                ? opts.delayMs * Math.pow(2, attempt - 1)
                : opts.delayMs * attempt;

            opts.onRetry(attempt, lastError);

            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      // All retries failed
      setIsRetrying(false);
      setRetryCount(0);
      throw lastError || new Error('Operation failed after retries');
    },
    []
  );

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
  };
}

// Standalone retry function for use outside React components
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= opts.maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      attempt++;

      // Don't retry on auth errors
      if (
        lastError.message?.includes('JWT') ||
        lastError.message?.includes('auth') ||
        lastError.message?.includes('unauthorized')
      ) {
        throw lastError;
      }

      if (attempt <= opts.maxRetries) {
        const delay =
          opts.backoff === 'exponential'
            ? opts.delayMs * Math.pow(2, attempt - 1)
            : opts.delayMs * attempt;

        opts.onRetry(attempt, lastError);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}
