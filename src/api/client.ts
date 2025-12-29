import { API_BASE_URL } from '../lib/constants';

export interface ApiClientOptions {
  username: string;
  password: string;
}

export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

export class ApiClient {
  private authHeader: string;

  constructor(options: ApiClientOptions) {
    const credentials = btoa(`${options.username}:${options.password}`);
    this.authHeader = `Basic ${credentials}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = new Headers(options.headers);
    headers.set('Authorization', this.authHeader);
    
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let detail: string | undefined;
      try {
        const errorData = await response.json();
        detail = errorData.detail || errorData.message;
      } catch {
        // Ignore JSON parse errors
      }

      const error: ApiError = {
        message: `API Error: ${response.status} ${response.statusText}`,
        status: response.status,
        detail,
      };
      
      throw error;
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    return {} as T;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Test connection with credentials
  async testConnection(): Promise<boolean> {
    try {
      // Use an endpoint that requires authentication
      // If we get 401, credentials are wrong
      // Any other response (200, 404, 500) means credentials are accepted
      await this.get('/bot-orchestration/status');
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      // 401 means credentials are wrong
      if (apiError.status === 401) {
        return false;
      }
      // If we get any other response, the credentials are valid
      // (the endpoint might fail for other reasons like no data)
      return true;
    }
  }
}

// Singleton instance (set after login)
let apiClient: ApiClient | null = null;

export function setApiClient(client: ApiClient | null) {
  apiClient = client;
}

export function getApiClient(): ApiClient {
  if (!apiClient) {
    throw new Error('API client not initialized. Please login first.');
  }
  return apiClient;
}

export function hasApiClient(): boolean {
  return apiClient !== null;
}

