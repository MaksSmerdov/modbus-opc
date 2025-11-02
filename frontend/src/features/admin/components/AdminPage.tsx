import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/hooks';
import { UsersList } from './UsersList';
import styles from './AdminPage.module.scss';

export const AdminPage = () => {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Пока идет проверка авторизации - показываем loader
  if (isLoading) {
    return (
      <div className={styles['admin']}>
        <div className={styles['admin__container']}>
          <div>Загрузка...</div>
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