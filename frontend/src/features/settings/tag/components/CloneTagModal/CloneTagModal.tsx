import { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';
import styles from './CloneTagModal.module.scss';

interface CloneTagModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (count: number) => void;
    isLoading?: boolean;
}

export const CloneTagModal = ({
    open,
    onClose,
    onConfirm,
    isLoading = false,
}: CloneTagModalProps) => {
    const [count, setCount] = useState<string>('1');

    useEffect(() => {
        if (open) {
            setCount('1');
        }
    }, [open]);

    const handleConfirm = () => {
        const numCount = Number(count);
        if (numCount >= 1 && numCount <= 100) {
            onConfirm(numCount);
        }
    };

    const handleCancel = () => {
        setCount('1');
        onClose();
    };

    const countValue = Number(count);
    const isValid = countValue >= 1 && countValue <= 100 && Number.isInteger(countValue);

    return (
        <Modal
            open={open}
            onClose={handleCancel}
            title="Клонирование тега"
            maxWidth="sm"
            fullWidth
        >
            <div className={styles['cloneTagModal']}>
                <Input
                    label="Количество копий"
                    type="number"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    helperText="Введите количество копий (от 1 до 100)"
                    disabled={isLoading}
                    fullWidth
                    inputProps={{ min: 1, max: 100, step: 1 }}
                    error={!isValid && count !== ''}
                />

                <div className={styles['cloneTagModal__actions']}>
                    <Button variant="outlined" onClick={handleCancel} disabled={isLoading} fullWidth>
                        Отмена
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={handleConfirm} 
                        disabled={isLoading || !isValid} 
                        fullWidth
                    >
                        {isLoading ? 'Клонирование...' : 'Клонировать'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

