import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Theme } from '@/shared/types';
import {authApi} from "@/features/auth/api/authApi.ts";

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

  // Удаляем старые классы
  root.classList.remove('dark', 'light');

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');
    
    // Слушаем изменения системной темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      root.classList.toggle('dark', e.matches);
      root.classList.toggle('light', !e.matches);
    };
    
    // Очищаем предыдущие слушатели перед добавлением нового
    mediaQuery.addEventListener('change', handleChange);
  } else {
    root.classList.add(theme);
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
      const theme = response.data.settings.theme;
      if (theme === 'light' || theme === 'dark' || theme === 'auto') {
        return theme as Theme;
      }
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