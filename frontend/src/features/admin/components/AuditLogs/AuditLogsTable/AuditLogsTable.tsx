import { Delete } from '@mui/icons-material';
import type { AuditLog } from '../../../api/auditApi';
import { IconButton } from '../../../../../shared/ui/IconButton/IconButton';
import { formatAuditLogDate, formatAuditLogUser, formatAuditLogOldValue } from '../utils/formatAuditLog';
import styles from './AuditLogsTable.module.scss';

interface AuditLogsTableProps {
    logs: AuditLog[];
    onDeleteClick: (logId: string) => void;
}

export const AuditLogsTable = ({ logs, onDeleteClick }: AuditLogsTableProps) => {
    if (logs.length === 0) {
        return (
            <div className={styles['auditLogsTable']}>
                <table className={styles['auditLogsTable__content']}>
                    <thead>
                        <tr>
                            <th>Кто</th>
                            <th>Что изменил</th>
                            <th>Когда</th>
                            <th>Прошлое значение</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={5} className={styles['auditLogsTable__empty']}>
                                Нет записей
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className={styles['auditLogsTable']}>
            <table className={styles['auditLogsTable__content']}>
                <thead>
                    <tr>
                        <th>Кто</th>
                        <th>Что изменил</th>
                        <th>Когда</th>
                        <th>Прошлое значение</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log._id}>
                            <td>{formatAuditLogUser(log)}</td>
                            <td>{log.action}</td>
                            <td>{formatAuditLogDate(log.createdAt)}</td>
                            <td>{formatAuditLogOldValue(log.oldValue)}</td>
                            <td>
                                <IconButton
                                    icon={<Delete />}
                                    tooltip="Удалить лог"
                                    variant="delete"
                                    onClick={() => onDeleteClick(log._id)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

