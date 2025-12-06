import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';
import { authApi } from '../api/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const loadStoredUser = (): User | null => {
  const raw = localStorage.getItem('user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: loadStoredUser(),
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: () => {
      // Ошибки теперь обрабатываются через RTK Query
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      // Логин успешен
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, action) => {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      )
      // Регистрация успешна
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, action) => {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      )
      // Получение пользователя успешно
      .addMatcher(
        authApi.endpoints.getMe.matchFulfilled,
        (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = true;
          localStorage.setItem('user', JSON.stringify(action.payload));
        }
      )
      // Логин/регистрация/получение пользователя с ошибкой
      .addMatcher(
        authApi.endpoints.login.matchRejected,
        (state) => {
          state.isAuthenticated = false;
        }
      )
      .addMatcher(
        authApi.endpoints.register.matchRejected,
        (state) => {
          state.isAuthenticated = false;
        }
      )
      .addMatcher(
        authApi.endpoints.getMe.matchRejected,
        (state, action) => {
          const status =
            typeof action.payload === 'object' &&
              action.payload !== null &&
              'status' in action.payload
              ? (action.payload as { status?: number | string }).status
              : undefined;

          const isUnauthorized = status === 401 || status === 403;

          if (isUnauthorized) {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            return;
          }

          state.isAuthenticated = state.isAuthenticated || !!localStorage.getItem('accessToken');
        }
      )
      // Логаут
      .addMatcher(
        authApi.endpoints.logout.matchFulfilled,
        (state) => {
          state.user = null;
          state.isAuthenticated = false;
        }
      )
      .addMatcher(
        authApi.endpoints.logout.matchRejected,
        (state) => {
          state.user = null;
          state.isAuthenticated = false;
        }
      );
  },
});

export const { clearError, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
