import { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';
import { setThemeLocal } from '@/features/theme/store/themeSlice';
import type { Theme } from '@/shared/types';
import { LoginForm } from '@/features/auth/forms/LoginForm';
import { RegisterForm } from '@/features/auth/forms/RegisterForm';
import styles from './AuthPage.module.scss';

export const AuthPage = () => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state) => state.theme);
    const savedThemeRef = useRef<Theme | null>(null);
    const isLightThemeSetRef = useRef(false);
    const isLogin = location.pathname === '/login';

    useEffect(() => {
        // Сохраняем текущую тему только при первом монтировании
        if (savedThemeRef.current === null) {
            savedThemeRef.current = theme;
        }

        // Устанавливаем светлую тему только один раз при монтировании
        if (!isLightThemeSetRef.current && theme !== 'light') {
            dispatch(setThemeLocal('light'));
            isLightThemeSetRef.current = true;
        }

        // Восстанавливаем сохраненную тему при размонтировании
        return () => {
            if (savedThemeRef.current && savedThemeRef.current !== 'light') {
                dispatch(setThemeLocal(savedThemeRef.current));
            }
            isLightThemeSetRef.current = false;
        };
    }, [dispatch]); // Убрали theme из зависимостей

    return (
        <div className={styles['auth']}>
            <div className={styles['auth__container']}>
                <h1 className={styles['auth__title']}>
                    {isLogin ? 'Вход' : 'Регистрация'}
                </h1>

                {isLogin ? <LoginForm /> : <RegisterForm />}

                <div className={styles['auth__footer']}>
                    <span className={styles['auth__footer-text']}>
                        {isLogin ? (
                            <>
                                Нет аккаунта?{' '}
                                <Link to="/register" className={styles['auth__footer-link']}>
                                    Зарегистрироваться
                                </Link>
                            </>
                        ) : (
                            <>
                                Уже есть аккаунт?{' '}
                                <Link to="/login" className={styles['auth__footer-link']}>
                                    Войти
                                </Link>
                            </>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};