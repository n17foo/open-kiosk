import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('fetchWithRetry');

export interface FetchWithRetryOptions {
  /** Maximum number of retry attempts (default 3) */
  maxRetries?: number;
  /** Request timeout in ms (default 15000) */
  timeoutMs?: number;
  /** Base delay between retries in ms — doubles each attempt (default 1000) */
  baseDelayMs?: number;
  /** HTTP status codes that should trigger a retry (default [408, 429, 500, 502, 503, 504]) */
  retryStatusCodes?: number[];
  /** Signal to abort the request externally */
  signal?: AbortSignal;
}

const DEFAULT_RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Drop-in replacement for `fetch` with:
 * - configurable timeout (AbortController)
 * - exponential-backoff retries on transient errors
 * - structured logging on failures
 */
export async function fetchWithRetry(url: string, init: RequestInit = {}, options: FetchWithRetryOptions = {}): Promise<Response> {
  const {
    maxRetries = 3,
    timeoutMs = 15_000,
    baseDelayMs = 1_000,
    retryStatusCodes = DEFAULT_RETRY_STATUS_CODES,
    signal: externalSignal,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Honour external abort signal
    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener('abort', onExternalAbort);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', onExternalAbort);

      // Success or non-retryable status → return immediately
      if (response.ok || !retryStatusCodes.includes(response.status)) {
        return response;
      }

      // Retryable HTTP status
      lastError = new Error(`HTTP ${response.status} ${response.statusText}`);

      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        logger.warn(`Retryable HTTP ${response.status} on ${url} — retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', onExternalAbort);

      // External abort → rethrow immediately, no retry
      if (externalSignal?.aborted) {
        throw err;
      }

      lastError = err instanceof Error ? err : new Error(String(err));

      // Timeout or network error → retry
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        logger.warn(`Network error on ${url} — retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}): ${lastError.message}`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  logger.error({ message: `All ${maxRetries} retries exhausted for ${url}` }, lastError ?? new Error('Unknown fetch error'));
  throw lastError ?? new Error(`Request to ${url} failed after ${maxRetries} retries`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
