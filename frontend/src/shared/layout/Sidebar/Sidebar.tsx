import React from 'react';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  return (
    <aside className={`${styles['sidebar']} ${isCollapsed ? styles['sidebar_collapsed'] : ''}`}>
      <div className={styles['sidebar__header']}>
        <button
          onClick={onToggle}
          className={styles['sidebar__toggle']}
          type="button"
          aria-label={isCollapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
        >
          <span className={styles['sidebar__toggle-icon']}>
            {isCollapsed ? '›' : '‹'}
          </span>
        </button>
      </div>
      <div className={styles['sidebar__content']}>
        {/* Пока пусто */}
      </div>
    </aside>
  );
};

export default Sidebar;