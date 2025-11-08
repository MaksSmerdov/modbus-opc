import { SnackbarProvider as NotistackProvider } from 'notistack';
import { useAppSelector } from '@/app/hooks/hooks';
import { useEffect } from 'react';
import styles from './SnackbarProvider.module.scss';

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
    const theme = useAppSelector((state) => state.theme.theme);

    // Определяем, какая тема активна
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

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
                vertical: 'top',
                horizontal: 'center',
            }}
            autoHideDuration={3000}
            dense={true}
            preventDuplicate
            className={styles['snackbarProvider']}
        >
            {children}
        </NotistackProvider>
    );
};
