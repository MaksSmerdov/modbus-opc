import { api } from '../../../shared/api/api';
import type { User, UserRole } from '../../../shared/types';

export interface UpdateUserRoleData {
  role: UserRole;
}

export const usersApi = {
  // Получить список всех пользователей
  getAllUsers: async () => {
    return api.get<User[]>('/users');
  },

  // Изменить роль пользователя
  updateUserRole: async (userId: string, role: UserRole) => {
    return api.put<User>(`/users/${userId}/role`, { role });
  },
};