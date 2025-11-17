import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks/hooks.ts';
import { UsersList } from '../../features/admin/components/UsersList/UsersList';
import { AuditLogs } from '../../features/admin/components/AuditLogs/AuditLogs';
import { Button } from '@/shared/ui/Button/Button';
import styles from './AdminPage.module.scss';

type TabType = 'users' | 'audit';

export const AdminPage = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<TabType>('users');

  // Если не авторизован или не админ - редирект
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

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
            onClick={() => setActiveTab('users')}
            className={styles['adminPage__tab']}
          >
            Пользователи
          </Button>
          <Button
            variant={activeTab === 'audit' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('audit')}
            className={styles['adminPage__tab']}
          >
            Журнал действий
          </Button>
        </div>

        <div className={styles['adminPage__content']}>
          {activeTab === 'users' && <UsersList />}
          {activeTab === 'audit' && <AuditLogs />}
        </div>
      </div>
    </div>
  );
};