import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store/store';
import { checkAuth } from './features/auth';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { loadThemeFromServer, setThemeLocal } from './app/slices/themeSlice';
import { useAppDispatch, useAppSelector } from './app/hooks/hooks';
import type { Theme } from './shared/types';
import { AdminPage } from '@/features/admin';
import { AppLayout } from '@/shared/layout';
import { Loader } from '@/shared/ui/Loader/Loader';

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme && ['light', 'dark', 'auto'].includes(storedTheme)) {
      dispatch(setThemeLocal(storedTheme));
    }

    if (isAuthenticated) {
      dispatch(loadThemeFromServer());
    }
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return <Loader size={80} fullScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
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