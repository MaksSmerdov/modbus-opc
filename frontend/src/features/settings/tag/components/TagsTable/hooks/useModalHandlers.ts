import { useCallback } from 'react';
import type { ByteOrder, DataType, FunctionCode, CreateTagData, Tag } from '@/features/settings/tag/types';
import type { UseModalsReturn } from './useModals';
import type { EditingRow } from '../types';

interface UseModalHandlersProps {
    modals: UseModalsReturn;
    editingRow: EditingRow | null;
    onFieldChange: (field: keyof CreateTagData, value: unknown) => void;
}

export interface UseModalHandlersReturn {
    byteOrder: {
        open: () => void;
        close: () => void;
        save: (value: ByteOrder) => void;
    };
    dataType: {
        open: () => void;
        close: () => void;
        save: (value: DataType) => void;
    };
    functionCode: {
        open: () => void;
        close: () => void;
        save: (value: FunctionCode) => void;
    };
    details: {
        open: (tag: Tag | string | undefined) => void;
        close: () => void;
    };
    clone: {
        open: (tagId: string) => void;
        close: () => void;
    };
    delete: {
        open: (tagId: string) => void;
        close: () => void;
    };
    bulkDelete: {
        open: () => void;
        close: () => void;
    };
}

export const useModalHandlers = ({
    modals,
    editingRow,
    onFieldChange,
}: UseModalHandlersProps): UseModalHandlersReturn => {
    const handleOpenByteOrder = useCallback(() => {
        modals.openModal('byteOrder');
    }, [modals]);

    const handleCloseByteOrder = useCallback(() => {
        modals.closeModal('byteOrder');
    }, [modals]);

    const handleSaveByteOrder = useCallback(
        (byteOrder: ByteOrder) => {
            if (!editingRow) return;
            onFieldChange('byteOrder', byteOrder);
            modals.closeModal('byteOrder');
        },
        [editingRow, onFieldChange, modals]
    );

    const handleOpenDataType = useCallback(() => {
        modals.openModal('dataType');
    }, [modals]);

    const handleCloseDataType = useCallback(() => {
        modals.closeModal('dataType');
    }, [modals]);

    const handleSaveDataType = useCallback(
        (dataType: DataType) => {
            if (!editingRow) return;
            onFieldChange('dataType', dataType);
            modals.closeModal('dataType');
        },
        [editingRow, onFieldChange, modals]
    );

    const handleOpenFunctionCode = useCallback(() => {
        modals.openModal('functionCode');
    }, [modals]);

    const handleCloseFunctionCode = useCallback(() => {
        modals.closeModal('functionCode');
    }, [modals]);

    const handleSaveFunctionCode = useCallback(
        (functionCode: FunctionCode) => {
            if (!editingRow) return;
            onFieldChange('functionCode', functionCode);
            modals.closeModal('functionCode');
        },
        [editingRow, onFieldChange, modals]
    );

    const handleOpenDetails = useCallback(
        (tag: Tag | string | undefined) => {
            modals.openModal('details', tag);
        },
        [modals]
    );

    const handleCloseDetails = useCallback(() => {
        modals.closeModal('details');
    }, [modals]);

    const handleOpenClone = useCallback(
        (tagId: string) => {
            modals.openModal('clone', tagId);
        },
        [modals]
    );

    const handleCloseClone = useCallback(() => {
        modals.closeModal('clone');
    }, [modals]);

    const handleOpenDelete = useCallback(
        (tagId: string) => {
            modals.openModal('delete', tagId);
        },
        [modals]
    );

    const handleCloseDelete = useCallback(() => {
        modals.closeModal('delete');
    }, [modals]);

    const handleOpenBulkDelete = useCallback(() => {
        modals.openModal('bulkDelete');
    }, [modals]);

    const handleCloseBulkDelete = useCallback(() => {
        modals.closeModal('bulkDelete');
    }, [modals]);

    return {
        byteOrder: {
            open: handleOpenByteOrder,
            close: handleCloseByteOrder,
            save: handleSaveByteOrder,
        },
        dataType: {
            open: handleOpenDataType,
            close: handleCloseDataType,
            save: handleSaveDataType,
        },
        functionCode: {
            open: handleOpenFunctionCode,
            close: handleCloseFunctionCode,
            save: handleSaveFunctionCode,
        },
        details: {
            open: handleOpenDetails,
            close: handleCloseDetails,
        },
        clone: {
            open: handleOpenClone,
            close: handleCloseClone,
        },
        delete: {
            open: handleOpenDelete,
            close: handleCloseDelete,
        },
        bulkDelete: {
            open: handleOpenBulkDelete,
            close: handleCloseBulkDelete,
        },
    };
};

