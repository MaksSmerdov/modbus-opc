import { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';
import type { Tag, UpdateTagData } from '../../types';
import styles from './TagDetailsModal.module.scss';

interface TagDetailsModalProps {
    open: boolean;
    onClose: () => void;
    tag: Tag | null;
    onSave: (data: UpdateTagData) => Promise<void>;
    isLoading?: boolean;
}

export const TagDetailsModal = ({ open, onClose, tag, onSave, isLoading = false }: TagDetailsModalProps) => {
    const [minValue, setMinValue] = useState<string>('');
    const [maxValue, setMaxValue] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    useEffect(() => {
        if (tag) {
            setMinValue(tag.minValue !== null && tag.minValue !== undefined ? String(tag.minValue) : '');
            setMaxValue(tag.maxValue !== null && tag.maxValue !== undefined ? String(tag.maxValue) : '');
            setDescription(tag.description || '');
        }
    }, [tag]);

    const handleSave = async () => {
        if (!tag) return;

        const updateData: UpdateTagData = {
            minValue: minValue === '' ? null : Number(minValue),
            maxValue: maxValue === '' ? null : Number(maxValue),
            description: description || undefined,
        };

        await onSave(updateData);
        onClose();
    };

    const handleCancel = () => {
        if (tag) {
            setMinValue(tag.minValue !== null && tag.minValue !== undefined ? String(tag.minValue) : '');
            setMaxValue(tag.maxValue !== null && tag.maxValue !== undefined ? String(tag.maxValue) : '');
            setDescription(tag.description || '');
        }
        onClose();
    };

    if (!tag) return null;

    return (
        <Modal
            open={open}
            onClose={handleCancel}
            title={`Дополнительные параметры: ${tag.name}`}
            maxWidth="sm"
            fullWidth
        >
            <div className={styles['tagDetailsModal']}>
                <Input
                    label="Минимальное значение"
                    type="number"
                    step="0.01"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    helperText="Оставьте пустым, чтобы убрать ограничение"
                    disabled={isLoading}
                />

                <Input
                    label="Максимальное значение"
                    type="number"
                    step="0.01"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    helperText="Оставьте пустым, чтобы убрать ограничение"
                    disabled={isLoading}
                />

                <Input
                    label="Описание"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    helperText="Дополнительное описание тэга"
                    disabled={isLoading}
                />

                <div className={styles['tagDetailsModal__actions']}>
                    <Button variant="outlined" onClick={handleCancel} disabled={isLoading} fullWidth>
                        Отмена
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={isLoading} fullWidth>
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

