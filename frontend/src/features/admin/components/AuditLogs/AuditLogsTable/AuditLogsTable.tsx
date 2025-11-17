import { Delete } from '@mui/icons-material';
import type { AuditLog } from '../../../api/auditApi';
import { IconButton } from '../../../../../shared/ui/IconButton/IconButton';
import { Table, type TableColumn } from '../../../../../shared/ui/Table/Table';
import { formatAuditLogDate, formatAuditLogUser, formatAuditLogOldValue } from '../utils/formatAuditLog';

interface AuditLogsTableProps {
    logs: AuditLog[];
    onDeleteClick: (logId: string) => void;
}

const columns: TableColumn[] = [
    { key: 'user', label: 'Кто' },
    { key: 'action', label: 'Что изменил' },
    { key: 'date', label: 'Когда' },
    { key: 'oldValue', label: 'Прошлое значение' },
    { key: 'actions', label: 'Действия' },
];

export const AuditLogsTable = ({ logs, onDeleteClick }: AuditLogsTableProps) => {
    return (
        <Table
            columns={columns}
            data={logs}
            emptyMessage="Нет записей"
            renderRow={(log) => (
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
            )}
        />
    );
};

