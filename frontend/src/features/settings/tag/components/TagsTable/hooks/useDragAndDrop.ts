import { useCallback, useMemo } from 'react';
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useReorderTagsMutation } from '@/features/settings/tag/api/tagsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { TAG_TABLE_CONFIG } from '../config';
import type { Tag } from '@/features/settings/tag/types';

interface UseDragAndDropProps {
    deviceId: string;
    tags: Tag[];
    localTags: Tag[];
    setLocalTags: (tags: Tag[]) => void;
    canEdit: boolean;
    editingRow: { id: string | 'new' } | null;
    isCreating: boolean;
    reorderMode: boolean;
}

interface UseDragAndDropReturn {
    isDragEnabled: boolean;
    sensors: ReturnType<typeof useSensors>;
    handleDragEnd: (event: DragEndEvent) => Promise<void>;
}

export const useDragAndDrop = ({
    deviceId,
    tags,
    localTags,
    setLocalTags,
    canEdit,
    editingRow,
    isCreating,
    reorderMode,
}: UseDragAndDropProps): UseDragAndDropReturn => {
    const { showSuccess, showError } = useSnackbar();
    const [reorderTags] = useReorderTagsMutation();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: TAG_TABLE_CONFIG.dragActivationDistance,
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Отключаем drag and drop, если не в режиме перестановки
    const isDragEnabled = useMemo(
        () => reorderMode && canEdit && !editingRow && !isCreating,
        [reorderMode, canEdit, editingRow, isCreating]
    );

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over || active.id === over.id) {
                return;
            }

            // Не позволяем перетаскивать новую строку
            if (active.id === 'new' || over.id === 'new') {
                return;
            }

            const activeIndex = localTags.findIndex(tag => tag._id === active.id);
            const overIndex = localTags.findIndex(tag => tag._id === over.id);

            if (activeIndex === -1 || overIndex === -1) {
                return;
            }

            // Оптимистичное обновление
            const newTags = arrayMove(localTags, activeIndex, overIndex);
            setLocalTags(newTags);

            // Обновляем порядок на бэкенде
            const tagIds = newTags.map(tag => tag._id);
            try {
                await reorderTags({ deviceId, tagIds }).unwrap();
                showSuccess('Порядок тегов успешно обновлен');
            } catch (error) {
                console.error('Ошибка обновления порядка тегов:', error);
                showError('Не удалось обновить порядок тегов');
                // Откатываем изменения
                setLocalTags(tags);
            }
        },
        [localTags, tags, deviceId, reorderTags, setLocalTags, showSuccess, showError]
    );

    return {
        isDragEnabled,
        sensors,
        handleDragEnd,
    };
};

