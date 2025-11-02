import { useState } from 'react';
import { useAppSelector } from '../../../app/hooks/hooks';
import type { User, UserRole } from '../../../shared/types';
import styles from './UserRow.module.scss';

interface UserRowProps {
  user: User;
  onRoleUpdate: (userId: string, role: UserRole) => Promise<void>;
}

export const UserRow = ({ user, onRoleUpdate }: UserRowProps) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Нельзя изменить роль самому себе
  const isCurrentUser = currentUser?.id === user.id;

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === user.role) return;

    setIsUpdating(true);
    setError(null);
    setSelectedRole(newRole);

    try {
      await onRoleUpdate(user.id, newRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления роли');
      setSelectedRole(user.role); // Возвращаем предыдущее значение
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <tr className={styles['userRow']}>
      <td className={styles['userRow__name']}>{user.name}</td>
      <td className={styles['userRow__email']}>{user.email}</td>
      <td className={styles['userRow__role']}>
        {isCurrentUser ? (
          <span className={styles['userRow__current-user']}>
            {user.role} (вы)
          </span>
        ) : (
          <select
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            disabled={isUpdating}
            className={styles['userRow__select']}
          >
            <option value="viewer">Viewer</option>
            <option value="operator">Operator</option>
            <option value="admin">Admin</option>
          </select>
        )}
        {error && (
          <span className={styles['userRow__error']}>{error}</span>
        )}
      </td>
      <td className={styles['userRow__date']}>
        {user.createdAt ? formatDate(user.createdAt) : '-'}
      </td>
    </tr>
  );
};