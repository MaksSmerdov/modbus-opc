import { useState, useCallback } from 'react';
import {
    useDeleteAuditLogMutation,
    useDeleteAllAuditLogsMutation,
    useDeleteAuditLogsByDateMutation
} from '../../../api/auditApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';

export function useAuditLogsDeletion() {
    const [deleteLog, { isLoading: isDeletingLog }] = useDeleteAuditLogMutation();
    const [deleteAll, { isLoading: isDeletingAll }] = useDeleteAllAuditLogsMutation();
    const [deleteByDate, { isLoading: isDeletingByDate }] = useDeleteAuditLogsByDateMutation();
    const { showSuccess, showError } = useSnackbar();

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
    const [deleteDateConfirmOpen, setDeleteDateConfirmOpen] = useState(false);
    const [logToDelete, setLogToDelete] = useState<string | null>(null);
    const [dateToDelete, setDateToDelete] = useState<string>('');

    const handleDeleteClick = useCallback((logId: string) => {
        setLogToDelete(logId);
        setDeleteConfirmOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!logToDelete) return;
        try {
            await deleteLog(logToDelete).unwrap();
            setDeleteConfirmOpen(false);
            setLogToDelete(null);
            showSuccess('Лог успешно удален');
        } catch (error) {
            console.error('Ошибка удаления лога:', error);
            showError('Не удалось удалить лог');
        }
    }, [logToDelete, deleteLog, showSuccess, showError]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteConfirmOpen(false);
        setLogToDelete(null);
    }, []);

    const handleDeleteAllClick = useCallback(() => {
        setDeleteAllConfirmOpen(true);
    }, []);

    const handleDeleteAllConfirm = useCallback(async () => {
        try {
            const result = await deleteAll().unwrap();
            setDeleteAllConfirmOpen(false);
            showSuccess(result.message || 'Все логи успешно удалены');
        } catch (error) {
            console.error('Ошибка удаления всех логов:', error);
            showError('Не удалось удалить логи');
        }
    }, [deleteAll, showSuccess, showError]);

    const handleDeleteDateClick = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        setDateToDelete(today);
        setDeleteDateConfirmOpen(true);
    }, []);

    const handleDeleteDateConfirm = useCallback(async () => {
        if (!dateToDelete) return;
        try {
            const result = await deleteByDate(dateToDelete).unwrap();
            setDeleteDateConfirmOpen(false);
            setDateToDelete('');
            showSuccess(result.message || `Логи за ${dateToDelete} успешно удалены`);
        } catch (error) {
            console.error('Ошибка удаления логов за дату:', error);
            showError('Не удалось удалить логи');
        }
    }, [dateToDelete, deleteByDate, showSuccess, showError]);

    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setDateToDelete(e.target.value);
    }, []);

    const closeDeleteDateModal = useCallback(() => {
        setDeleteDateConfirmOpen(false);
        setDateToDelete('');
    }, []);

    const closeDeleteAllModal = useCallback(() => {
        setDeleteAllConfirmOpen(false);
    }, []);

    return {
        // Состояния
        deleteConfirmOpen,
        deleteAllConfirmOpen,
        deleteDateConfirmOpen,
        logToDelete,
        dateToDelete,
        isDeletingLog,
        isDeletingAll,
        isDeletingByDate,
        // Обработчики
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
        handleDeleteAllClick,
        handleDeleteAllConfirm,
        handleDeleteDateClick,
        handleDeleteDateConfirm,
        handleDateChange,
        closeDeleteDateModal,
        closeDeleteAllModal
    };
}

