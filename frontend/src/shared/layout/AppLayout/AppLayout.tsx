import React, { useState, useCallback, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs';
import { useAppSelector } from '@/app/hooks/hooks';
import styles from './AppLayout.module.scss';

export const AppLayout: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const showSidebar = useMemo(() => user?.role !== 'viewer', [user?.role]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const mainClassName = useMemo(() => {
    if (!showSidebar) {
      return `${styles['appLayout__main']} ${styles['appLayout__main_fullWidth']}`;
    }
    return `${styles['appLayout__main']} ${isSidebarCollapsed ? styles['appLayout__main_collapsed'] : ''}`;
  }, [showSidebar, isSidebarCollapsed]);

  return (
    <div className={styles['appLayout']}>
      <Header />
      <div className={styles['appLayout__content']}>
        {showSidebar && (
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggleSidebar} />
        )}
        <main className={mainClassName}>
          <div className={styles['appLayout__breadcrumbs']}>
            <Breadcrumbs />
          </div>
          <div className={styles['appLayout__contentWrapper']}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;