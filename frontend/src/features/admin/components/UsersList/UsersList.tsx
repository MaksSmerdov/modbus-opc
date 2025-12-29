import { useEffect, useState } from 'react';
import { usersApi } from '@/features/admin/api/usersApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { UserRow } from '@/features/admin/components/UserRow/UserRow';
import { Button } from '@/shared/ui/Button/Button';
import { Table, type TableColumn } from '@/shared/ui/Table/Table';
import type { User } from '@/shared/types';
import styles from './UsersList.module.scss';

export const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError, showInfo } = useSnackbar();

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.error);
        showError(response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки пользователей';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (userId: string, newRole: User['role']) => {
    try {
      const response = await usersApi.updateUserRole(userId, newRole);
      if (response.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { ...user, ...response.data } // Мержим существующие данные с новыми
              : user
          )
        );
        showSuccess('Роль пользователя успешно обновлена');
      } else {
        showError(response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления роли';
      showError(errorMessage);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await usersApi.deleteUser(userId);
      if (response.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showSuccess('Пользователь успешно удален');
      } else {
        showError(response.error);
        throw new Error(response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления пользователя';
      showError(errorMessage);
      throw err;
    }
  };

  const handleRefresh = () => {
    showInfo('Обновление списка пользователей...');
    fetchUsers();
  };

  if (isLoading) {
    return <div className={styles['usersList__loading']}>Загрузка...</div>;
  }

  if (error) {
    return (
      <div className={styles['usersList__error']}>
        <p>{error}</p>
        <Button onClick={handleRefresh} variant="default" size="small">
          Попробовать снова
        </Button>
      </div>
    );
  }

  const columns: TableColumn[] = [
    { key: 'name', label: 'Имя' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Роль' },
    { key: 'createdAt', label: 'Дата регистрации' },
    { key: 'actions', label: 'Действия' },
  ];

  return (
    <div className={styles['usersList']}>
      <div className={styles['usersList__header']}>
        <h2 className={styles['usersList__title']}>Список пользователей</h2>
        <Button onClick={handleRefresh} variant="default" size="small">
          Обновить
        </Button>
      </div>

      <Table
        columns={columns}
        data={users}
        emptyMessage="Нет пользователей"
        renderRow={(user) => (
          <UserRow
            key={user.id}
            user={user}
            onRoleUpdate={handleRoleUpdate}
            onDelete={handleDelete}
          />
        )}
      />
    </div>
  );
};