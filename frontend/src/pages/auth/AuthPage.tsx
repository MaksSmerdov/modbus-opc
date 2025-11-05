import { useLocation, Link } from 'react-router-dom';
import { LoginForm } from '@/features/auth/forms/LoginForm';
import { RegisterForm } from '@/features/auth/forms/RegisterForm';
import styles from './AuthPage.module.scss';

export const AuthPage = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

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