// AuditLog type is used in function parameters, so import is needed

export const formatAuditLogDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatAuditLogUser = (log: { userName: string; userEmail: string }): string => {
    return `${log.userName} (${log.userEmail})`;
};

export const formatAuditLogOldValue = (oldValue: string | null): string => {
    return oldValue || '—';
};

