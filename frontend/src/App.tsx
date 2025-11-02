import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store/store';
import { checkAuth, LoginPage, logout, RegisterPage } from './features/auth';
import { loadThemeFromServer, setThemeLocal } from './app/slices/themeSlice';
import { useAppDispatch, useAppSelector } from './app/hooks/hooks';
import type { Theme } from './shared/types';
import { AdminPage } from './features/admin/components/AdminPage';

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

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

  const handleLogout = () => {
    dispatch(logout());
  };

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
          path="/admin"
          element={<AdminPage />}
        />
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <div>
                <div onClick={handleLogout}>Главная страница</div>
                {user?.role === 'admin' && (
                  <Link to="/admin" style={{ display: 'block', marginTop: '20px' }}>
                    Панель администратора
                  </Link>
                )}
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
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