import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/shared/layout';
import { ProfilesPage, DevicePage } from '@/pages';

const ProfilesLayout = () => {
  const { content, sidebarProps } = ProfilesPage();

  return (
    <Layout sidebarProps={sidebarProps}>
      {content}
    </Layout>
  );
};

const DeviceLayout = () => {
  return (
    <Layout>
      <DevicePage />
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
      <Route path="/" element={<Navigate to="/profiles" replace />} />
      <Route path="/profiles" element={<ProfilesLayout />} />
      <Route path="/profiles/:profileId" element={<ProfilesLayout />} />
      <Route path="/devices/:deviceId" element={<DeviceLayout />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};