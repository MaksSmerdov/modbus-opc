import React, { useMemo, useCallback } from 'react';
import { useAppSelector } from '@/app/hooks/hooks';
import { useLogoutMutation } from '@/features/auth/api/authApi';
import { ThemeToggle } from '@/features/theme';
import { PollingToggle } from '@/features/polling';
import styles from './Header.module.scss';
import { IconButton, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logout, AdminPanelSettings, Person } from '@mui/icons-material';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [logout] = useLogoutMutation();

    const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);
    const isOperator = useMemo(() => user?.role === 'operator', [user?.role]);
    const canManagePolling = useMemo(() => isAdmin || isOperator, [isAdmin, isOperator]);
    const isAdminPage = useMemo(() => location.pathname === '/admin', [location.pathname]);

    const handleLogout = useCallback(async () => {
        try {
            await logout().unwrap();
        } catch (error) {
            // Ошибка обрабатывается автоматически
        }
    }, [logout]);

    const handleAdmin = useCallback(() => {
        navigate('/admin');
    }, [navigate]);

    return (
        <header className={styles['header']}>
            <div className={styles['header__left']}>
                <h2 className={`${styles['header__title']} title-reset`}>Modbus OPC</h2>
            </div>
            <div className={styles['header__right']}>
                <ThemeToggle />
                {isAuthenticated && canManagePolling && (
                    <div className={styles['header__polling']}>
                        <PollingToggle />
                    </div>
                )}
                {isAuthenticated && (
                    <div className={styles['header__user']}>
                        <div className={styles['header__userInfo']}>
                            <Person className={styles['header__userIcon']} />
                            <span className={styles['header__userName']}>{user?.name}</span>
                        </div>
                        {isAdmin && (
                            <Tooltip title="Админ панель" arrow>
                                <IconButton
                                    onClick={handleAdmin}
                                    className={`${styles['header__adminButton']} ${isAdminPage ? styles['header__adminButton_active'] : ''}`}
                                    size="small"
                                >
                                    <AdminPanelSettings />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Выйти" arrow>
                            <IconButton
                                onClick={handleLogout}
                                className={styles['header__logoutButton']}
                                size="small"
                            >
                                <Logout />
                            </IconButton>
                        </Tooltip>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
