import { useState, useEffect, useCallback } from 'react';
import type { Tag } from '@/features/settings/tag/types';

interface UseLocalTagsReturn {
    localTags: Tag[];
    setLocalTags: (tags: Tag[]) => void;
    reorderTags: (newOrder: Tag[]) => void;
}

export const useLocalTags = (tags: Tag[]): UseLocalTagsReturn => {
    const [localTags, setLocalTags] = useState<Tag[]>(tags);

    // Синхронизируем локальное состояние с пропсами
    useEffect(() => {
        setLocalTags(tags);
    }, [tags]);

    const reorderTags = useCallback((newOrder: Tag[]) => {
        setLocalTags(newOrder);
    }, []);

    return {
        localTags,
        setLocalTags,
        reorderTags,
    };
};

