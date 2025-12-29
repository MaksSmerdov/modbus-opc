import React, { useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useGetPortsQuery } from '@/features/settings/port/api/portsApi';
import { useGetDevicesQuery } from '@/features/settings/device/api/devicesApi';
import { transliterate } from '@/shared/utils/transliterate';
import { ChevronRight } from '@mui/icons-material';
import styles from './Breadcrumbs.module.scss';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ portSlug?: string; deviceSlug?: string }>();
  const navigate = useNavigate();

  const { data: ports } = useGetPortsQuery(undefined, { skip: !params.portSlug });
  const { data: devices } = useGetDevicesQuery(undefined, { skip: !params.deviceSlug });

  const breadcrumbs = useMemo(() => {
    const crumbs: Array<{ label: string; path?: string }> = [];

    // Если мы на главной странице, не показываем breadcrumbs
    if (location.pathname === '/') {
      return [];
    }

    // Всегда добавляем "Главная" как первый элемент (кроме самой главной)
    crumbs.push({ label: 'Главная', path: '/' });

    if (location.pathname === '/admin') {
      crumbs.push({ label: 'Админ панель' });
    } else if (location.pathname === '/monitor') {
      crumbs.push({ label: 'Мониторинг' });
    } else if (location.pathname.startsWith('/docs/connection-modes')) {
      crumbs.push({ label: 'Документация' });
    } else if (params.portSlug && params.deviceSlug) {
      // Страница устройства
      // Находим порт по slug
      const port = ports?.find((p) => transliterate(p.name) === params.portSlug);
      if (port) {
        crumbs.push({ label: port.name, path: `/${params.portSlug}` });
      } else {
        crumbs.push({ label: params.portSlug });
      }

      // Находим устройство по slug (используем d.slug || d.name для поиска)
      const device = devices?.find((d) => transliterate(d.slug || d.name) === params.deviceSlug);
      if (device) {
        // Всегда показываем название устройства, а не slug
        crumbs.push({ label: device.name });
      } else {
        crumbs.push({ label: params.deviceSlug });
      }
    } else if (params.portSlug) {
      // Страница порта
      const port = ports?.find((p) => transliterate(p.name) === params.portSlug);
      if (port) {
        crumbs.push({ label: port.name });
      } else {
        crumbs.push({ label: params.portSlug });
      }
    }
    return crumbs;
  }, [location.pathname, params, ports, devices]);

  const handleBreadcrumbClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className={styles['breadcrumbs']}>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className={styles['breadcrumbs__separator']} />}
          <span
            className={`${styles['breadcrumbs__item']} ${crumb.path ? styles['breadcrumbs__item_clickable'] : ''}`}
            onClick={() => handleBreadcrumbClick(crumb.path)}
          >
            {crumb.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};