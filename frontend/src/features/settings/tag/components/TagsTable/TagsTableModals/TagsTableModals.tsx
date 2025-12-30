import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { TagDetailsModal } from '@/features/settings/tag/components/TagDetailsModal/TagDetailsModal';
import { CloneTagModal } from '@/features/settings/tag/components/CloneTagModal/CloneTagModal';
import { EditingModals } from '../EditingModals/EditingModals';
import type { Tag, UpdateTagData } from '@/features/settings/tag/types';
import type { UseModalsReturn } from '../hooks/useModals';
import type { UseModalHandlersReturn } from '../hooks/useModalHandlers';
import type { EditingRow } from '../types';

interface TagsTableModalsProps {
    modals: UseModalsReturn;
    editingRow: EditingRow | null;
    selectedTag: Tag | null;
    selection: {
        selectedCount: number;
        selectedTagIds: Set<string>;
        clearSelection: () => void;
    };
    modalHandlers: UseModalHandlersReturn;
    onSaveDetails: (data: UpdateTagData) => Promise<void>;
    onConfirmDelete: () => Promise<void>;
    onConfirmClone: (count: number) => Promise<void>;
    onBulkDeleteConfirm: () => Promise<void>;
    isUpdating: boolean;
    isDeleting: boolean;
    isCloning: boolean;
}

export const TagsTableModals = ({
    modals,
    editingRow,
    selectedTag,
    selection,
    modalHandlers,
    onSaveDetails,
    onConfirmDelete,
    onConfirmClone,
    onBulkDeleteConfirm,
    isUpdating,
    isDeleting,
    isCloning,
}: TagsTableModalsProps) => {
    return (
        <>
            <TagDetailsModal
                open={modals.isOpen('details')}
                onClose={modalHandlers.details.close}
                tag={selectedTag}
                onSave={onSaveDetails}
                isLoading={isUpdating}
            />
            <EditingModals
                editingRow={editingRow}
                modals={modals}
                modalHandlers={{
                    byteOrder: {
                        close: modalHandlers.byteOrder.close,
                        save: (value: unknown) => modalHandlers.byteOrder.save(value as Parameters<typeof modalHandlers.byteOrder.save>[0]),
                    },
                    dataType: {
                        close: modalHandlers.dataType.close,
                        save: (value: unknown) => modalHandlers.dataType.save(value as Parameters<typeof modalHandlers.dataType.save>[0]),
                    },
                    functionCode: {
                        close: modalHandlers.functionCode.close,
                        save: (value: unknown) => modalHandlers.functionCode.save(value as Parameters<typeof modalHandlers.functionCode.save>[0]),
                    },
                }}
            />
            <CloneTagModal
                open={modals.isOpen('clone')}
                onClose={modalHandlers.clone.close}
                onConfirm={onConfirmClone}
                isLoading={isCloning}
            />
            <ConfirmModal
                open={modals.isOpen('delete')}
                onClose={modalHandlers.delete.close}
                onConfirm={onConfirmDelete}
                title="Удаление тэга"
                message="Вы уверены, что хотите удалить этот тэг?"
                isLoading={isDeleting}
            />
            <ConfirmModal
                open={modals.isOpen('bulkDelete')}
                onClose={modalHandlers.bulkDelete.close}
                onConfirm={onBulkDeleteConfirm}
                title="Массовое удаление тегов"
                message={`Вы уверены, что хотите удалить ${selection.selectedCount} ${selection.selectedCount === 1 ? 'тег' : selection.selectedCount < 5 ? 'тега' : 'тегов'}?`}
                isLoading={isDeleting}
            />
        </>
    );
};

