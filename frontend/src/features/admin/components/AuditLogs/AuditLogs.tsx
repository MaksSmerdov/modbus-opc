import { useState } from 'react';
import { useGetAuditLogsQuery } from '@/features/admin/api/auditApi';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { useAuditLogsDeletion } from './hooks/useAuditLogsDeletion';
import { AuditLogsHeader } from './AuditLogsHeader/AuditLogsHeader';
import { AuditLogsTable } from './AuditLogsTable/AuditLogsTable';
import { AuditLogsPagination } from './AuditLogsPagination/AuditLogsPagination';
import styles from './AuditLogs.module.scss';

export const AuditLogs = () => {
    const [page, setPage] = useState(1);
    const [entityTypeFilter, setEntityTypeFilter] = useState<string>('');

    const { data, isLoading, refetch } = useGetAuditLogsQuery({
        page,
        limit: 25,
        entityType: entityTypeFilter || undefined
    });

    const deletion = useAuditLogsDeletion();

    const handleFilterChange = (value: string) => {
        setEntityTypeFilter(value);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    if (isLoading) {
        return (
            <div className={styles['auditLogs']}>
                <div className={styles['auditLogs__loading']}>Загрузка...</div>
            </div>
        );
    }

    return (
        <div className={styles['auditLogs']}>
            <AuditLogsHeader
                entityTypeFilter={entityTypeFilter}
                onFilterChange={handleFilterChange}
                onRefresh={refetch}
                onDeleteDateClick={deletion.handleDeleteDateClick}
                onDeleteAllClick={deletion.handleDeleteAllClick}
            />

            <AuditLogsTable
                logs={data?.data || []}
                onDeleteClick={deletion.handleDeleteClick}
            />

            {data?.pagination && (
                <AuditLogsPagination
                    currentPage={data.pagination.page}
                    totalPages={data.pagination.pages}
                    onPageChange={handlePageChange}
                />
            )}

            <ConfirmModal
                open={deletion.deleteConfirmOpen}
                onClose={deletion.handleDeleteCancel}
                onConfirm={deletion.handleDeleteConfirm}
                title="Удаление лога"
                message="Вы уверены, что хотите удалить этот лог? Это действие нельзя отменить."
                confirmText="Удалить"
                cancelText="Отмена"
                confirmVariant="danger"
                isLoading={deletion.isDeletingLog}
            />

            <ConfirmModal
                open={deletion.deleteAllConfirmOpen}
                onClose={deletion.closeDeleteAllModal}
                onConfirm={deletion.handleDeleteAllConfirm}
                title="Удаление всех логов"
                message="Вы уверены, что хотите удалить все логи? Это действие нельзя отменить."
                confirmText="Удалить все"
                cancelText="Отмена"
                confirmVariant="danger"
                isLoading={deletion.isDeletingAll}
            />

            <ConfirmModal
                open={deletion.deleteDateConfirmOpen}
                onClose={deletion.closeDeleteDateModal}
                onConfirm={deletion.handleDeleteDateConfirm}
                title="Удаление логов за день"
                message={
                    <div className={styles['auditLogs__date-modal']}>
                        <p>Выберите дату для удаления логов:</p>
                        <input
                            type="date"
                            value={deletion.dateToDelete}
                            onChange={deletion.handleDateChange}
                            className={styles['auditLogs__date-input']}
                        />
                        <p className={styles['auditLogs__date-warning']}>
                            Все логи за выбранный день будут удалены. Это действие нельзя отменить.
                        </p>
                    </div>
                }
                confirmText="Удалить"
                cancelText="Отмена"
                confirmVariant="danger"
                isLoading={deletion.isDeletingByDate}
            />
        </div>
    );
};

