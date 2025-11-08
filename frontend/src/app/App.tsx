import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useGetMeQuery } from '../features/auth/api/authApi';
import { Loader } from '@/shared/ui/Loader/Loader';
import { SnackbarProvider } from '@/shared/ui/SnackbarProvider/provider/SnackbarProvider';
import { AppRoutes } from './routes/AppRoutes';

const AppContent = () => {
  const hasToken = !!localStorage.getItem('accessToken');

  // Проверяем авторизацию только если есть токен
  const { isLoading } = useGetMeQuery(undefined, {
    skip: !hasToken,
  });

  if (hasToken && isLoading) {
    return <Loader size={80} fullScreen />;
  }

  return <AppRoutes />;
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SnackbarProvider>
          <AppContent />
        </SnackbarProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
