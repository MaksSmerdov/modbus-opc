import { useState, useCallback, useMemo } from 'react';
import type { Tag } from '@/features/settings/tag/types';

interface UseTagSelectionReturn {
    selectedTagIds: Set<string>;
    handleTagSelect: (tagId: string, checked: boolean) => void;
    handleSelectAll: (checked: boolean) => void;
    isAllSelected: boolean;
    isIndeterminate: boolean;
    clearSelection: () => void;
    selectedCount: number;
}

export const useTagSelection = (tags: Tag[]): UseTagSelectionReturn => {
    const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

    const handleTagSelect = useCallback((tagId: string, checked: boolean) => {
        setSelectedTagIds(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(tagId);
            } else {
                newSet.delete(tagId);
            }
            return newSet;
        });
    }, []);

    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) {
            const allTagIds = tags.map(tag => tag._id);
            setSelectedTagIds(new Set(allTagIds));
        } else {
            setSelectedTagIds(new Set());
        }
    }, [tags]);

    const isAllSelected = useMemo(() => {
        return tags.length > 0 && selectedTagIds.size === tags.length;
    }, [tags.length, selectedTagIds.size]);

    const isIndeterminate = useMemo(() => {
        return selectedTagIds.size > 0 && selectedTagIds.size < tags.length;
    }, [selectedTagIds.size, tags.length]);

    const clearSelection = useCallback(() => {
        setSelectedTagIds(new Set());
    }, []);

    return {
        selectedTagIds,
        handleTagSelect,
        handleSelectAll,
        isAllSelected,
        isIndeterminate,
        clearSelection,
        selectedCount: selectedTagIds.size,
    };
};

