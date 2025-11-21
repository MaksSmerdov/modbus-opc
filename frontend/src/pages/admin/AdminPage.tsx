import { useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks/hooks.ts';
import { UsersList } from '../../features/admin/components/UsersList/UsersList';
import { AuditLogs } from '../../features/admin/components/AuditLogs/AuditLogs';
import { AvailablePortsSettings } from '../../features/admin/components/AvailablePortsSettings/AvailablePortsSettings';
import { Button } from '@/shared/ui/Button/Button';
import styles from './AdminPage.module.scss';

type TabType = 'users' | 'audit' | 'ports';

export const AdminPage = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  // Определяем активный таб по пути
  const activeTab = useMemo<TabType>(() => {
    if (location.pathname === '/admin/users-list') return 'users';
    if (location.pathname === '/admin/audit-log') return 'audit';
    if (location.pathname === '/admin/com-ports') return 'ports';
    return 'users';
  }, [location.pathname]);

  // Если не авторизован или не админ - редирект
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleTabChange = (tab: TabType) => {
    switch (tab) {
      case 'users':
        navigate('/admin/users-list');
        break;
      case 'audit':
        navigate('/admin/audit-log');
        break;
      case 'ports':
        navigate('/admin/com-ports');
        break;
    }
  };

  return (
    <div className={`${styles['adminPage']} page`}>
      <div className={styles['adminPage__container']}>
        <h1 className={styles['adminPage__title']}>Панель администратора</h1>
        <p className={styles['adminPage__subtitle']}>
          Управление пользователями системы
        </p>

        <div className={styles['adminPage__tabs']}>
          <Button
            variant={activeTab === 'users' ? 'contained' : 'outlined'}
            onClick={() => handleTabChange('users')}
            className={styles['adminPage__tab']}
          >
            Пользователи
          </Button>
          <Button
            variant={activeTab === 'audit' ? 'contained' : 'outlined'}
            onClick={() => handleTabChange('audit')}
            className={styles['adminPage__tab']}
          >
            Журнал действий
          </Button>
          <Button
            variant={activeTab === 'ports' ? 'contained' : 'outlined'}
            onClick={() => handleTabChange('ports')}
            className={styles['adminPage__tab']}
          >
            COM-порты
          </Button>
        </div>

        <div className={styles['adminPage__content']}>
          {activeTab === 'users' && <UsersList />}
          {activeTab === 'audit' && <AuditLogs />}
          {activeTab === 'ports' && <AvailablePortsSettings />}
        </div>
      </div>
    </div>
  );
};