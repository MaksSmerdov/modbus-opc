import { Link } from 'react-router-dom';
import { LoginForm } from '../forms/LoginForm';
import styles from './AuthPage.module.scss';

export const LoginPage = () => {
    return (
        <div className={styles['auth']}>
            <div className={styles['auth__container']}>
                <h1 className={styles['auth__title']}>Вход</h1>
                <LoginForm />

                <div className={styles['auth__footer']}>
                    <span className={styles['auth__footer-text']}>
                        Нет аккаунта?{' '}
                        <Link to="/register" className={styles['auth__footer-link']}>
                            Зарегистрироваться
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

