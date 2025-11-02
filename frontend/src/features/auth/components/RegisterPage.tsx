import { Link } from 'react-router-dom';
import { RegisterForm } from '../forms/RegisterForm';
import styles from './AuthPage.module.scss';

export const RegisterPage = () => {
    return (
        <div className={styles['auth']}>
            <div className={styles['auth__container']}>
                <h1 className={styles['auth__title']}>Регистрация</h1>
                <RegisterForm />

                <div className={styles['auth__footer']}>
                    <span className={styles['auth__footer-text']}>
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className={styles['auth__footer-link']}>
                            Войти
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

