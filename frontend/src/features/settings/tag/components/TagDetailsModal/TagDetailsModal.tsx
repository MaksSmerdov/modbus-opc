import { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';
import type { Tag, UpdateTagData } from '@/features/settings/tag/types';
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
    const [scale, setScale] = useState<string>('');
    const [offset, setOffset] = useState<string>('');
    const [decimals, setDecimals] = useState<string>('');

    useEffect(() => {
        if (tag) {
            setMinValue(tag.minValue !== null && tag.minValue !== undefined ? String(tag.minValue) : '');
            setMaxValue(tag.maxValue !== null && tag.maxValue !== undefined ? String(tag.maxValue) : '');
            setDescription(tag.description || '');
            setScale(tag.scale !== null && tag.scale !== undefined ? String(tag.scale) : '1');
            setOffset(tag.offset !== null && tag.offset !== undefined ? String(tag.offset) : '0');
            setDecimals(tag.decimals !== null && tag.decimals !== undefined ? String(tag.decimals) : '0');
        }
    }, [tag]);

    const handleSave = async () => {
        if (!tag) return;

        const updateData: UpdateTagData = {
            minValue: minValue === '' ? null : Number(minValue),
            maxValue: maxValue === '' ? null : Number(maxValue),
            description: description || undefined,
            scale: scale === '' ? undefined : Number(scale),
            offset: offset === '' ? undefined : Number(offset),
            decimals: decimals === '' ? undefined : Number(decimals),
        };

        await onSave(updateData);
        onClose();
    };

    const handleCancel = () => {
        if (tag) {
            setMinValue(tag.minValue !== null && tag.minValue !== undefined ? String(tag.minValue) : '');
            setMaxValue(tag.maxValue !== null && tag.maxValue !== undefined ? String(tag.maxValue) : '');
            setDescription(tag.description || '');
            setScale(tag.scale !== null && tag.scale !== undefined ? String(tag.scale) : '1');
            setOffset(tag.offset !== null && tag.offset !== undefined ? String(tag.offset) : '0');
            setDecimals(tag.decimals !== null && tag.decimals !== undefined ? String(tag.decimals) : '0');
        }
        onClose();
    };

    if (!tag) return null;

    return (
        <Modal
            open={open}
            onClose={handleCancel}
            title={`Дополнительные параметры`}
            maxWidth="sm"
            fullWidth
        >
            <div className={styles['tagDetailsModal']}>
                <div className={styles['tagDetailsModal__row']}>
                    <Input
                        label="Минимальное значение"
                        type="number"
                        value={minValue}
                        onChange={(e) => setMinValue(e.target.value)}
                        helperText="Нижняя уставка"
                        disabled={isLoading}
                    />

                    <Input
                        label="Максимальное значение"
                        type="number"
                        value={maxValue}
                        onChange={(e) => setMaxValue(e.target.value)}
                        helperText="Верхняя уставка"
                        disabled={isLoading}
                    />
                </div>

                <div className={styles['tagDetailsModal__row']}>
                    <Input
                        label="Масштабирование"
                        type="number"
                        value={scale}
                        onChange={(e) => setScale(e.target.value)}
                        helperText="Коэффициент масштабирования"
                        disabled={isLoading}
                    />

                    <Input
                        label="Смещение"
                        type="number"
                        value={offset}
                        onChange={(e) => setOffset(e.target.value)}
                        helperText="Смещение значения"
                        disabled={isLoading}
                    />
                </div>

                <Input
                    label="Округление"
                    type="number"
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                    helperText="Количество знаков после запятой"
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

