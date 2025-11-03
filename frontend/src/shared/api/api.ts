type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  private async refreshTokens(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          return null;
        }

        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            return data.data.accessToken;
          }
        }
        return null;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
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

      let response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      // Обработка нового access токена из заголовка (автоматическое обновление через middleware)
      const newAccessToken = response.headers.get('X-New-Access-Token');
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
      }

      // Если получили 401 и это не запрос на refresh/login/register, пытаемся обновить токены
      if (
        response.status === 401 &&
        refreshToken &&
        !endpoint.includes('/auth/refresh') &&
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/register')
      ) {
        const newToken = await this.refreshTokens();

        if (newToken) {
          // Повторяем исходный запрос с новым токеном
          const newHeaders: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
            ...(options.headers as Record<string, string>),
          };

          const currentRefreshToken = localStorage.getItem('refreshToken');
          if (currentRefreshToken) {
            newHeaders['X-Refresh-Token'] = currentRefreshToken;
          }

          response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: newHeaders,
          });

          const newAccessTokenFromRetry = response.headers.get('X-New-Access-Token');
          if (newAccessTokenFromRetry) {
            localStorage.setItem('accessToken', newAccessTokenFromRetry);
          }
        } else {
          // Если обновление токена не удалось, очищаем токены
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        // Если все еще 401 после попытки обновить токен, это окончательная ошибка
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }

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