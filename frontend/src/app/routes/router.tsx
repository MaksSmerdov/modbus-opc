import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/shared/layout';
import { ProfilesPage } from '@/pages';

const RootLayout = () => {
  const { content, sidebarProps } = ProfilesPage();

  return (
    <Layout sidebarProps={sidebarProps}>
      {content}
    </Layout>
  );
};

const NotFound = () => (
  <div style={{ padding: '32px', textAlign: 'center' }}>
    <h1>404 - Страница не найдена</h1>
    <p>Запрашиваемая страница не существует</p>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Navigate to="/profiles" replace />} />
        <Route path="profiles" element={<Outlet />} />
        <Route path="profiles/:profileId" element={<Outlet />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};