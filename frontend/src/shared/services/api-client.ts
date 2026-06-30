export type ApiClientOptions = {
  baseUrl: string;
  getAccessToken?: () => string | null;
  onUnauthorized?: () => void;
};

export type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiClient {
  private readonly options: ApiClientOptions;

  constructor(options: ApiClientOptions) {
    this.options = options;
  }

  async request<T>(path: string, request: ApiRequestOptions = {}): Promise<T> {
    const token = this.options.getAccessToken?.();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...request.headers
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.options.baseUrl}${path}`, {
      method: request.method ?? 'GET',
      headers,
      body: request.body ? JSON.stringify(request.body) : undefined
    });

    if (response.status === 401) {
      this.options.onUnauthorized?.();
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw payload ?? new Error(`Request failed with status ${response.status}.`);
    }

    return payload as T;
  }
}
