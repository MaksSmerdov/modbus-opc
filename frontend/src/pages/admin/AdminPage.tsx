import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks/hooks.ts';
import { UsersList } from '../../features/admin/components/UsersList/UsersList';
import styles from './AdminPage.module.scss';
import { Loader } from '@/shared/ui/Loader/Loader';

export const AdminPage = () => {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Пока идет проверка авторизации - показываем loader
  if (isLoading) {
    return (
      <div className={styles['admin']}>
        <div className={styles['admin__container']}>
          <Loader fullScreen />
        </div>
      </div>
    );
  }

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