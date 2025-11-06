import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks/hooks.ts';
import { UsersList } from '../../features/admin/components/UsersList/UsersList';
import styles from './AdminPage.module.scss';

export const AdminPage = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Если не авторизован или не админ - редирект
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles['admin']}>
      <div className={styles['admin__container']}>
        <h1 className={styles['admin__title']}>Панель администратора</h1>
        <p className={styles['admin__subtitle']}>
          Управление пользователями системы
        </p>
        <UsersList />
      </div>
    </div>
  );
};