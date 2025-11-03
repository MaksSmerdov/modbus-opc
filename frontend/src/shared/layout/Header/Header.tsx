import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';
import { logout } from '@/features/auth';
import { ThemeToggle } from '@/features/theme';
import styles from './Header.module.scss';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    const isAdmin = user?.role === 'admin';

    const handleLogout = () => {
        dispatch(logout());
    };

    const handleAdmin = () => {
        navigate('/admin');
    };

    return (
        <header className={styles['header']}>
            <div className={styles['header__left']}>
                <h2 className={`${styles['header__title']} title-reset`}>Modbus OPC</h2>
            </div>
            <div className={styles['header__right']}>
                <ThemeToggle />
                {isAuthenticated && (
                    <div className={styles['header__user']}>
                        <span className={styles['header__user-name']}>{user?.name}</span>
                        {isAdmin && (
                            <Button variant="contained" className={styles['header__user-admin']} onClick={handleAdmin}>
                                Админ панель
                            </Button>
                        )}
                        <Button variant="contained" className={styles['header__user-logout']} onClick={handleLogout}>
                            Выйти
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;