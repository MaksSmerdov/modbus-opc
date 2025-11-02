import { useEffect, useState } from 'react';
import { usersApi } from '../api/usersApi';
import { UserRow } from './UserRow';
import { Button } from '../../../shared/ui/Button/Button';
import type { User } from '../../../shared/types';
import styles from './UsersList.module.scss';

export const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    const response = await usersApi.getAllUsers();
    
    if (response.success) {
      setUsers(response.data);
    } else {
      setError(response.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (userId: string, newRole: User['role']) => {
    const response = await usersApi.updateUserRole(userId, newRole);
    
    if (response.success) {
      // Обновляем список пользователей
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? response.data : user
        )
      );
    } else {
      setError(response.error);
    }
  };

  if (isLoading) {
    return <div className={styles['usersList__loading']}>Загрузка...</div>;
  }

  if (error) {
    return (
      <div className={styles['usersList__error']}>
        <p>{error}</p>
        <Button onClick={fetchUsers} variant="outlined" size="small">
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className={styles['usersList']}>
      <div className={styles['usersList__header']}>
        <h2 className={styles['usersList__title']}>Список пользователей</h2>
        <Button onClick={fetchUsers} variant="outlined" size="small">
          Обновить
        </Button>
      </div>
      
      <div className={styles['usersList__table']}>
        <table className={styles['usersList__table-content']}>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Дата регистрации</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onRoleUpdate={handleRoleUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};