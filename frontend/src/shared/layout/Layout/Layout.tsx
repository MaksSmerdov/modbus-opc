import { type ReactNode } from 'react';
import Header from '../Header/Header';
import { Sidebar, type SidebarProps } from '../Sidebar/Sidebar';
import styles from './Layout.module.scss';

export interface LayoutProps {
  children?: ReactNode;
  sidebarProps?: SidebarProps;
}

export const Layout = ({ children, sidebarProps }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.layout__body}>
        {sidebarProps && <Sidebar {...sidebarProps} />}
        <main className={styles.layout__main}>
          <div className={styles.layout__container}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};