import { useState, useCallback } from 'react';
import type { Tag } from '@/features/settings/tag/types';

type ModalType = 'byteOrder' | 'dataType' | 'functionCode' | 'clone' | 'delete' | 'bulkDelete' | 'details';

export interface UseModalsReturn {
    openModal: (type: ModalType, data?: string | Tag) => void;
    closeModal: (type: ModalType) => void;
    isOpen: (type: ModalType) => boolean;
    getModalData: <T = string | Tag>() => T | null;
    getModalDataByType: <T = string | Tag>(type: ModalType) => T | null;
}

export const useModals = (): UseModalsReturn => {
    const [openModals, setOpenModals] = useState<Set<ModalType>>(new Set());
    const [modalData, setModalData] = useState<Record<ModalType, string | Tag | null>>({
        byteOrder: null,
        dataType: null,
        functionCode: null,
        clone: null,
        delete: null,
        bulkDelete: null,
        details: null,
    });

    const openModal = useCallback((type: ModalType, data?: string | Tag) => {
        setOpenModals(prev => new Set(prev).add(type));
        if (data !== undefined) {
            setModalData(prev => ({ ...prev, [type]: data }));
        }
    }, []);

    const closeModal = useCallback((type: ModalType) => {
        setOpenModals(prev => {
            const next = new Set(prev);
            next.delete(type);
            return next;
        });
        setModalData(prev => ({ ...prev, [type]: null }));
    }, []);

    const isOpen = useCallback((type: ModalType) => {
        return openModals.has(type);
    }, [openModals]);

    const getModalData = useCallback(<T = string | Tag>() => {
        const lastModal = Array.from(openModals).pop();
        return lastModal ? (modalData[lastModal] as T) : null;
    }, [openModals, modalData]);

    const getModalDataByType = useCallback(<T = string | Tag>(type: ModalType) => {
        return (modalData[type] as T) || null;
    }, [modalData]);

    return { openModal, closeModal, isOpen, getModalData, getModalDataByType };
};

