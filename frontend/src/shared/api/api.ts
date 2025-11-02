type ApiResponse<T> = {
    success: true;
    data: T;
  } | {
    success: false;
    error: string;
  };
  
  class ApiClient {
    private baseURL: string;
  
    constructor() {
      this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    }
  
    private async request<T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
  
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
        };
  
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
  
        if (refreshToken) {
          headers['X-Refresh-Token'] = refreshToken;
        }
  
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers,
        });
  
        // Обработка нового access токена
        const newAccessToken = response.headers.get('X-New-Access-Token');
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
        }
  
        const data = await response.json();
  
        if (!response.ok) {
          return {
            success: false,
            error: data.error || `HTTP error! status: ${response.status}`,
          };
        }
  
        return {
          success: true,
          data: data.data || data,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Network error',
        };
      }
    }
  
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
      return this.request<T>(endpoint, { method: 'GET' });
    }
  
    async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
      return this.request<T>(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  
    async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
      return this.request<T>(endpoint, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  
    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
      return this.request<T>(endpoint, { method: 'DELETE' });
    }
  }
  
  export const api = new ApiClient();