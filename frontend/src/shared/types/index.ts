export type Theme = 'light' | 'dark' | 'auto';

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
  settings?: {
    theme?: string;
  };
}