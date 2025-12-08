import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks/hooks';
import { AdminPage } from '@/features/admin';
import { AppLayout, ProtectedRoute } from '@/shared/layout';
import { AuthPage } from '@/pages/auth/AuthPage';
import { HomePage } from '@/pages/home/HomePage';
import { PortPage } from '@/pages/port/PortPage';
import { DevicePage } from '@/pages/device/DevicePage';
import { MonitorPage } from '@/pages/monitor/MonitorPage';
import { ConnectionModesPage } from '@/pages/docs/ConnectionModesPage';

export const AppRoutes = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      <Route path='/login' element={isAuthenticated ? <Navigate to='/' replace /> : <AuthPage />} />
      <Route path='/register' element={isAuthenticated ? <Navigate to='/' replace /> : <AuthPage />} />
      <Route path='*' element={isAuthenticated ? <AppLayout /> : <Navigate to='/login' replace />}>
        <Route index element={<HomePage />} />
        <Route
          path='admin'
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path='monitor' element={<MonitorPage />} />
        <Route path='docs/connection-modes' element={<ConnectionModesPage />} />
        {/* Роут для страницы устройства с тэгами - только для admin и operator */}
        <Route
          path=':portSlug/:deviceSlug'
          element={
            <ProtectedRoute allowedRoles={['admin', 'operator']}>
              <DevicePage />
            </ProtectedRoute>
          }
        />
        {/* Динамический роут для портов - только для admin и operator */}
        <Route
          path=':portSlug'
          element={
            <ProtectedRoute allowedRoles={['admin', 'operator']}>
              <PortPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};
