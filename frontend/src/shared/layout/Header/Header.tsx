import React, { useMemo, useCallback } from 'react';
import { useAppSelector } from '@/app/hooks/hooks';
import { useLogoutMutation } from '@/features/auth/api/authApi';
import { ThemeToggle } from '@/features/theme';
import { PollingToggle } from '@/features/polling';
import styles from './Header.module.scss';
import { IconButton } from '@/shared/ui/IconButton/IconButton';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logout, AdminPanelSettings, Person, Monitor } from '@mui/icons-material';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [logout] = useLogoutMutation();

    const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);
    const isOperator = useMemo(() => user?.role === 'operator', [user?.role]);
    const canManagePolling = useMemo(() => isAdmin || isOperator, [isAdmin, isOperator]);
    const isAdminPage = useMemo(() => location.pathname === '/admin', [location.pathname]);
    const isMonitorPage = useMemo(() => location.pathname === '/monitor', [location.pathname]);

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

    const handleMonitor = useCallback(() => {
        navigate('/monitor');
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
                        <IconButton
                            icon={<Monitor />}
                            onClick={handleMonitor}
                            className={`${styles['header__monitorButton']} ${isMonitorPage ? styles['header__monitorButton_active'] : ''}`}
                            tooltip="Мониторинг"
                            active={isMonitorPage}
                        />
                        {isAdmin && (
                            <IconButton
                                icon={<AdminPanelSettings />}
                                onClick={handleAdmin}
                                className={`${styles['header__adminButton']} ${isAdminPage ? styles['header__adminButton_active'] : ''}`}
                                tooltip="Админ панель"
                                active={isAdminPage}
                            />
                        )}
                        <IconButton
                            icon={<Logout />}
                            onClick={handleLogout}
                            className={styles['header__logoutButton']}
                            tooltip="Выйти"
                        />
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
