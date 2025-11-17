import type { ReactNode } from 'react';
import styles from './Table.module.scss';

export interface TableColumn {
    key: string;
    label: string;
    width?: string;
}

export interface TableProps<T = unknown> {
    columns: TableColumn[];
    data: T[];
    renderRow: (item: T, index: number) => ReactNode;
    emptyMessage?: string;
    className?: string;
    stickyHeader?: boolean;
}

export const Table = <T,>({
    columns,
    data,
    renderRow,
    emptyMessage = 'Нет данных',
    className,
    stickyHeader = false,
}: TableProps<T>) => {
    return (
        <div className={`${styles['table']} ${className || ''}`}>
            <div className={styles['table__wrapper']}>
                <table className={styles['table__content']}>
                    <thead className={stickyHeader ? styles['table__header_sticky'] : undefined}>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    style={{
                                        width: column.width,
                                    }}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((item, index) => renderRow(item, index))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className={styles['table__empty']}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

