import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAppSelector } from '@/app/hooks/hooks';
import { AppLayout, ProtectedRoute } from '@/shared/layout';
import { Loader } from '@/shared/ui/Loader/Loader';
import { AuthPage } from '@/pages/auth/AuthPage';

// Lazy load страниц
const AdminPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminPage })));
const HomePage = lazy(() => import('@/pages/home/HomePage').then((m) => ({ default: m.HomePage })));
const PortPage = lazy(() => import('@/pages/port/PortPage').then((m) => ({ default: m.PortPage })));
const DevicePage = lazy(() => import('@/pages/device/DevicePage').then((m) => ({ default: m.DevicePage })));
const MonitorPage = lazy(() => import('@/pages/monitor/MonitorPage').then((m) => ({ default: m.MonitorPage })));
const ConnectionModesPage = lazy(() =>
  import('@/pages/docs/ConnectionModesPage').then((m) => ({ default: m.ConnectionModesPage }))
);
const ChangelogPage = lazy(() => import('@/pages/changelog').then((m) => ({ default: m.ChangelogPage })));

export const AppRoutes = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="*" element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route
          index
          element={
            <Suspense fallback={<Loader size={80} fullScreen />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Suspense fallback={<Loader size={80} fullScreen />}>
                <AdminPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="monitor"
          element={
            <Suspense fallback={<Loader size={80} fullScreen />}>
              <MonitorPage />
            </Suspense>
          }
        />
        <Route
          path="changelog"
          element={
            <Suspense fallback={<Loader size={80} fullScreen />}>
              <ChangelogPage />
            </Suspense>
          }
        />
        <Route
          path="docs/connection-modes"
          element={
            <Suspense fallback={<Loader size={80} fullScreen />}>
              <ConnectionModesPage />
            </Suspense>
          }
        />
        {/* Роут для страницы устройства с тэгами - только для admin и operator */}
        <Route
          path=":portSlug/:deviceSlug"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operator']}>
              <Suspense fallback={<Loader size={80} fullScreen />}>
                <DevicePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Динамический роут для портов - только для admin и operator */}
        <Route
          path=":portSlug"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operator']}>
              <Suspense fallback={<Loader size={80} fullScreen />}>
                <PortPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};
