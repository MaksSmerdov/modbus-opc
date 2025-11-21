import { useState } from 'react';
import { Delete } from '@mui/icons-material';
import { useAppSelector } from '../../../../app/hooks/hooks';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { IconButton } from '@/shared/ui/IconButton/IconButton';
import type { User, UserRole } from '../../../../shared/types';
import styles from './UserRow.module.scss';
import { Select } from '@/shared/ui/Select/Select';
import { MenuItem } from '@mui/material';

interface UserRowProps {
  user: User;
  onRoleUpdate: (userId: string, role: UserRole) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

export const UserRow = ({ user, onRoleUpdate, onDelete }: UserRowProps) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { showError } = useSnackbar();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Нельзя изменить роль самому себе
  const isCurrentUser = currentUser?.id === user.id;

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === user.role) return;

    setIsUpdating(true);
    setSelectedRole(newRole);

    try {
      await onRoleUpdate(user.id, newRole);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления роли';
      showError(errorMessage);
      setSelectedRole(user.role); // Возвращаем предыдущее значение
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isCurrentUser) return; // доп. защита на фронте
    setIsDeleting(true);
    try {
      await onDelete(user.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления пользователя';
      showError(errorMessage);
    } finally {
      setIsDeleting(false);
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
    <tr>
      <td>{user.name}</td>
      <td className={styles['userRow__email']}>{user.email}</td>
      <td>
        {isCurrentUser ? (
          <span className={styles['userRow__current-user']}>{user.role} (вы)</span>
        ) : (
          <Select
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            disabled={isUpdating}
            fullWidth={true}
            className={styles['userRow__select']}
          >
            <MenuItem value='viewer'>Viewer</MenuItem>
            <MenuItem value='operator'>Operator</MenuItem>
            <MenuItem value='admin'>Admin</MenuItem>
          </Select>
        )}
      </td>
      <td>{user.createdAt ? formatDate(user.createdAt) : '-'}</td>
      <td>
        <IconButton
          icon={<Delete />}
          tooltip={isCurrentUser ? 'Нельзя удалить себя' : 'Удалить пользователя'}
          variant='delete'
          onClick={handleDelete}
          disabled={isCurrentUser || isDeleting}
        />
      </td>
    </tr>
  );
};
