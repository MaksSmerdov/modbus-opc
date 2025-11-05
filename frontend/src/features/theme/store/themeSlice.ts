import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Theme } from '@/shared/types';
import { authApi } from '@/features/auth/api/authApi';

interface ThemeState {
  theme: Theme;
}

// Получение темы из localStorage
const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored && ['light', 'dark', 'auto'].includes(stored)) {
    return stored;
  }
  return 'light';
};

// Применение темы к документу
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      root.classList.toggle('dark', e.matches);
      root.classList.toggle('light', !e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
  } else {
    root.classList.add(theme);
  }
};

// Применяем тему сразу при инициализации
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

const initialState: ThemeState = {
  theme: initialTheme,
};

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
      // Обновление настроек успешно - синхронизируем тему
      .addMatcher(
        authApi.endpoints.updateSettings.matchFulfilled,
        (state, action) => {
          if (action.payload.theme && ['light', 'dark', 'auto'].includes(action.payload.theme)) {
            state.theme = action.payload.theme as Theme;
            localStorage.setItem('theme', action.payload.theme);
            applyTheme(action.payload.theme as Theme);
          }
        }
      )
      // Получение пользователя успешно - проверяем тему из настроек
      .addMatcher(
        authApi.endpoints.getMe.matchFulfilled,
        (state, action) => {
          const serverTheme = action.payload.settings?.theme;
          if (serverTheme && ['light', 'dark', 'auto'].includes(serverTheme)) {
            state.theme = serverTheme as Theme;
            localStorage.setItem('theme', serverTheme);
            applyTheme(serverTheme as Theme);
          }
        }
      );
  },
});

export const { setThemeLocal } = themeSlice.actions;
export default themeSlice.reducer;
