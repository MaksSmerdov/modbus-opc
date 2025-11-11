import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';
import { AdminPage } from '@/features/admin';
import { AppLayout } from '@/shared/layout';
import { AuthPage } from '@/pages/auth/AuthPage';
import { PortPage } from '@/pages/port/PortPage';
import { DevicePage } from '@/pages/device/DevicePage';
import { MonitorPage } from '@/pages/monitor/MonitorPage';

export const AppRoutes = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
            />
            <Route
                path="*"
                element={
                    isAuthenticated ? (
                        <AppLayout />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            >
                <Route index element={<div style={{ padding: '16px' }}>Главная страница</div>} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="monitor" element={<MonitorPage />} />
                {/* Роут для страницы устройства с тэгами */}
                <Route path=":portSlug/:deviceSlug" element={<DevicePage />} />
                {/* Динамический роут для портов - должен быть последним, чтобы не перехватывать зарезервированные пути */}
                <Route path=":portSlug" element={<PortPage />} />
            </Route>
        </Routes>
    );
};
