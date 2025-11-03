import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './AppLayout.module.scss';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={styles['appLayout']}>
      <Header />
      <div className={styles['appLayout__content']}>
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggleSidebar} />
        <main className={`${styles['appLayout__main']} ${isSidebarCollapsed ? styles['appLayout__main_collapsed'] : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;