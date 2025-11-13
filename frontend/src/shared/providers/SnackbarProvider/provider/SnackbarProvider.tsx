import { SnackbarProvider as NotistackProvider } from 'notistack';
import { useAppSelector } from '@/app/hooks/hooks';
import { useEffect, useMemo, useRef } from 'react';
import styles from './SnackbarProvider.module.scss';

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
    const theme = useAppSelector((state) => state.theme.theme);
    const mediaQueryRef = useRef<MediaQueryList | null>(null);

    // Инициализируем media query только один раз
    if (!mediaQueryRef.current && typeof window !== 'undefined') {
        mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)');
    }

    const isDark = useMemo(() => {
        if (theme === 'dark') return true;
        if (theme === 'light') return false;
        return mediaQueryRef.current?.matches ?? false;
    }, [theme]);

    useEffect(() => {
        // Применяем класс темы к body для стилизации notistack
        if (isDark) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <NotistackProvider
            maxSnack={3}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            autoHideDuration={2000}
            dense={true}
            preventDuplicate
            className={styles['snackbarProvider']}
        >
            {children}
        </NotistackProvider>
    );
};
