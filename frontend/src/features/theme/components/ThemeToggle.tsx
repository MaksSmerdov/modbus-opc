import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';
import { setTheme } from '@/app/slices/themeSlice';
import type { Theme } from '@/shared/types';
import styles from './ThemeToggle.module.scss';

export const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const { theme, isLoading } = useAppSelector((state) => state.theme);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    dispatch(setTheme(newTheme));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className={styles.themeToggle}>
      <button
        className={`${styles.themeButton} ${theme === 'light' ? styles.themeButton_active : ''}`}
        onClick={() => handleThemeChange('light')}
        disabled={isLoading}
        title="Светлая тема"
        aria-label="Светлая тема"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <button
        className={`${styles.themeButton} ${theme === 'dark' ? styles.themeButton_active : ''}`}
        onClick={() => handleThemeChange('dark')}
        disabled={isLoading}
        title="Тёмная тема"
        aria-label="Тёмная тема"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        className={`${styles.themeButton} ${theme === 'auto' ? styles.themeButton_active : ''}`}
        onClick={() => handleThemeChange('auto')}
        disabled={isLoading}
        title="Автоматическая тема (системная)"
        aria-label="Автоматическая тема"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};