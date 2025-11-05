import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';
import { authApi } from '../api/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
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
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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
        }
      )
      // Регистрация успешна
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, action) => {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      )
      // Получение пользователя успешно
      .addMatcher(
        authApi.endpoints.getMe.matchFulfilled,
        (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = true;
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
        (state) => {
          state.isAuthenticated = false;
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
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
