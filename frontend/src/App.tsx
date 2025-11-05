import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store/store';
import { useGetMeQuery } from './features/auth/api/authApi';
import { useAppSelector } from './app/hooks/hooks';
import { AdminPage } from '@/features/admin';
import { AppLayout } from '@/shared/layout';
import { Loader } from '@/shared/ui/Loader/Loader';
import { AuthPage } from './pages/auth/AuthPage';

const AppContent = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const hasToken = !!localStorage.getItem('accessToken');

  // Проверяем авторизацию только если есть токен
  const { isLoading } = useGetMeQuery(undefined, {
    skip: !hasToken,
  });

  if (hasToken && isLoading) {
    return <Loader size={80} fullScreen />;
  }

  return (
    <BrowserRouter>
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
