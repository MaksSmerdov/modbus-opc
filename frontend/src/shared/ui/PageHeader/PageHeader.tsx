import React from 'react';
import classNames from 'classnames';
import styles from './PageHeader.module.scss';

export interface PageHeaderProps {
    title: string;
    status?: string;
    isActive?: boolean;
    leftContent?: React.ReactNode;
    rightContent?: React.ReactNode;
    className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    status,
    isActive = true,
    leftContent,
    rightContent,
    className,
}) => {
    return (
        <div className={classNames(styles['pageHeader'], className)}>
            <div className={styles['pageHeader__left']}>
                {leftContent}
                <h1 className={styles['pageHeader__title']}>{title}</h1>
            </div>
            <div className={styles['pageHeader__right']}>
                {status && (
                    <span
                        className={classNames(styles['pageHeader__status'], {
                            [styles['pageHeader__status_inactive']]: !isActive,
                        })}
                    >
                        {status}
                    </span>
                )}
                {rightContent}
            </div>
        </div>
    );
};
