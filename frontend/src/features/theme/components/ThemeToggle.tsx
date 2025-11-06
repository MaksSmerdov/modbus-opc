import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';
import { setThemeLocal } from '@/features/theme/store/themeSlice';
import { useUpdateSettingsMutation } from '@/features/auth/api/authApi';
import type { Theme } from '@/shared/types';
import { IconButton } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import styles from './ThemeToggle.module.scss';

export const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const [updateSettings] = useUpdateSettingsMutation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleThemeToggle = async () => {
    // Переключаем только между light и dark
    const currentTheme = theme === 'light' || theme === 'auto' ? 'dark' : 'light';
    const newTheme: Theme = currentTheme;

    dispatch(setThemeLocal(newTheme));

    // Сохраняем на сервере, если пользователь авторизован
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        await updateSettings({ theme: newTheme }).unwrap();
      } catch (error) {
        console.warn('Не удалось сохранить тему на сервере:', error);
      }
    }
  };

  // Определяем, какая тема активна (если auto, показываем текущую системную)
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (!isMounted) {
    return (
      <IconButton className={styles['themeToggle']} disabled>
        <LightMode />
      </IconButton>
    );
  }

  return (
    <IconButton
      onClick={handleThemeToggle}
      className={styles['themeToggle']}
      aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
    >
      {isDark ? <DarkMode /> : <LightMode />}
    </IconButton>
  );
};