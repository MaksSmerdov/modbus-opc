import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../shared/api/auth';
import type { Theme } from '../../shared/types';

interface ThemeState {
  theme: Theme;
  isLoading: boolean;
  error: string | null;
}

// Получение темы из localStorage или системных настроек
const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored && ['light', 'dark', 'auto'].includes(stored)) {
    return stored;
  }
  return 'light';
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
  isLoading: false,
  error: null,
};

// Применение темы к документу
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
  }
};

export const setTheme = createAsyncThunk(
  'theme/setTheme',
  async (theme: Theme, { rejectWithValue }) => {
    try {
      localStorage.setItem('theme', theme);
      applyTheme(theme);

      // Сохраняем настройки на сервере, если пользователь авторизован
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const response = await authApi.updateSettings({ theme });
        if (!response.success) {
          console.warn('Не удалось сохранить тему на сервере:', response.error);
        }
      }

      return theme;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка установки темы'
      );
    }
  }
);

export const loadThemeFromServer = createAsyncThunk(
  'theme/loadThemeFromServer',
  async (_, { rejectWithValue }) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return rejectWithValue('Пользователь не авторизован');
    }

    const response = await authApi.getMe();
    if (response.success && response.data.settings?.theme) {
      return response.data.settings.theme;
    }

    return rejectWithValue('Тема не найдена на сервере');
  }
);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeLocal: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      applyTheme(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setTheme.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.theme = action.payload;
        state.error = null;
      })
      .addCase(setTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(loadThemeFromServer.fulfilled, (state, action) => {
        state.theme = action.payload;
        applyTheme(action.payload);
      });
  },
});

export const { setThemeLocal } = themeSlice.actions;
export default themeSlice.reducer;