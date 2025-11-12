import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks/hooks';
import type { UserRole } from '@/shared/types';

interface ProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles: UserRole[];
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    redirectTo,
}) => {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Если viewer пытается зайти на недоступную страницу, редиректим на /monitor
        if (user.role === 'viewer') {
            return <Navigate to="/monitor" replace />;
        }
        // Для остальных ролей редиректим на указанный путь или на главную
        return <Navigate to={redirectTo || '/'} replace />;
    }

    return children;
};

