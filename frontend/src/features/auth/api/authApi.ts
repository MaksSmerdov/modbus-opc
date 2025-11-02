import { api } from '../../../shared/api/api';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  },

  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    if (response.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    if (response.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  },

  getMe: async () => {
    return api.get<User>('/users/me');
  },

  updateSettings: async (settings: { theme?: string }) => {
    return api.put<{ theme: string }>('/users/me/settings', settings);
  },
};