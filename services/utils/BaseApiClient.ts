import { fetchWithRetry } from './fetchWithRetry';
import type { FetchWithRetryOptions } from './fetchWithRetry';
import { networkStatus } from './networkStatus';
import { LoggerFactory } from '../logger/LoggerFactory';
import { notificationService } from '../notifications/NotificationService';

const logger = LoggerFactory.getInstance().createLogger('BaseApiClient');

export interface ApiClientConfig {
  /** Base URL for all requests (e.g. https://store.example.com/api/v3) */
  baseUrl: string;
  /** Default headers applied to every request */
  defaultHeaders: Record<string, string>;
  /** Override fetchWithRetry options for this client */
  retryOptions?: FetchWithRetryOptions;
}

/**
 * Shared HTTP client with retry, timeout, and structured error handling.
 * Intended to be instantiated once per KioskService and shared across sub-services.
 */
export class BaseApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly retryOptions: FetchWithRetryOptions;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.defaultHeaders = config.defaultHeaders;
    this.retryOptions = config.retryOptions ?? {};
  }

  /**
   * Make a JSON API request with retry and timeout.
   * Automatically merges default headers and parses JSON response.
   */
  async request<T = any>(endpoint: string, init: RequestInit = {}): Promise<T> {
    if (!networkStatus.isOnline()) {
      const err = new Error('No network connection. Please check your internet and try again.');
      notificationService.notify('Network Error', err.message, 'error');
      throw err;
    }

    const url = `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;

    const response = await fetchWithRetry(
      url,
      {
        ...init,
        headers: {
          ...this.defaultHeaders,
          ...init.headers,
        },
      },
      this.retryOptions
    );

    // DELETE often returns 204 No Content
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const error = new Error(`API error ${response.status} ${response.statusText}: ${body}`);
      logger.error({ message: `${init.method ?? 'GET'} ${url} failed` }, error);
      notificationService.notify(
        'Request Failed',
        response.status >= 500 ? 'Server error — please try again shortly.' : `Request failed (${response.status}).`,
        'error'
      );
      throw error;
    }

    return response.json() as Promise<T>;
  }

  /** Convenience GET */
  get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /** Convenience POST with JSON body */
  post<T = any>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  /** Convenience PUT with JSON body */
  put<T = any>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  /** Convenience PATCH with JSON body */
  patch<T = any>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  /** Convenience DELETE */
  delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /** Make a raw request (for non-JSON bodies like XML) */
  async raw(endpoint: string, init: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;

    return fetchWithRetry(
      url,
      {
        ...init,
        headers: {
          ...this.defaultHeaders,
          ...init.headers,
        },
      },
      this.retryOptions
    );
  }
}
