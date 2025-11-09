import { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { Button } from '@/shared/ui/Button/Button';
import type { ByteOrder } from '../../types';
import styles from './ByteOrderModal.module.scss';

interface ByteOrderModalProps {
    open: boolean;
    onClose: () => void;
    currentValue: ByteOrder;
    onSave: (value: ByteOrder) => void;
}

interface ByteOrderOption {
    value: ByteOrder;
    label: string;
    example: {
        bytes: string[];
        result: string;
        explanation: string;
    };
}

const BYTE_ORDER_OPTIONS: ByteOrderOption[] = [
    {
        value: 'ABCD',
        label: 'Старший байт первым',
        example: {
            bytes: ['12', '34', '56', '78'],
            result: '0x12345678',
            explanation: 'Байты читаются в исходном порядке: A→B→C→D',
        },
    },
    {
        value: 'DCBA',
        label: 'Младший байт первым',
        example: {
            bytes: ['12', '34', '56', '78'],
            result: '0x78563412',
            explanation: 'Байты читаются в обратном порядке: D→C→B→A',
        },
    },
    {
        value: 'BADC',
        label: 'Обмен байтов в парах (B↔A, D↔C)',
        example: {
            bytes: ['12', '34', '56', '78'],
            result: '0x34127856',
            explanation: 'Меняются местами пары байтов: B↔A, D↔C',
        },
    },
    {
        value: 'CDAB',
        label: 'Обмен байтов в парах (C↔D, A↔B)',
        example: {
            bytes: ['12', '34', '56', '78'],
            result: '0x56781234',
            explanation: 'Меняются местами пары байтов: C↔D, A↔B',
        },
    },
];

export const ByteOrderModal = ({
    open,
    onClose,
    currentValue,
    onSave,
}: ByteOrderModalProps) => {
    const [selectedValue, setSelectedValue] = useState<ByteOrder>(currentValue);

    // Синхронизируем selectedValue с currentValue при открытии модалки
    useEffect(() => {
        if (open) {
            setSelectedValue(currentValue);
        }
    }, [open, currentValue]);

    const handleSave = () => {
        onSave(selectedValue);
    };

    const handleSelect = (value: ByteOrder) => {
        setSelectedValue(value);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Выбор порядка байтов"
            maxWidth="md"
            actions={
                <>
                    <Button variant="outlined" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button variant="contained" onClick={handleSave}>
                        Сохранить
                    </Button>
                </>
            }
        >
            <div className={styles['byteOrderModal']}>
                <div className={styles['byteOrderModal__options']}>
                    {BYTE_ORDER_OPTIONS.map((option) => {
                        const isSelected = selectedValue === option.value;
                        return (
                            <div
                                key={option.value}
                                className={`${styles['byteOrderModal__option']} ${isSelected ? styles['byteOrderModal__option_selected'] : ''
                                    }`}
                                onClick={() => handleSelect(option.value)}
                            >
                                <div className={styles['byteOrderModal__optionHeader']}>
                                    <div className={styles['byteOrderModal__optionLabel']}>
                                        <input
                                            type="radio"
                                            name="byteOrder"
                                            value={option.value}
                                            checked={isSelected}
                                            onChange={() => handleSelect(option.value)}
                                            className={styles['byteOrderModal__radio']}
                                        />
                                        <span className={styles['byteOrderModal__label']}>
                                            {option.label}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles['byteOrderModal__example']}>
                                    <div className={styles['byteOrderModal__exampleRow']}>
                                        <div className={styles['byteOrderModal__exampleBytes']}>
                                            <span className={styles['byteOrderModal__exampleLabel']}>
                                                Исходные байты:
                                            </span>
                                            <div className={styles['byteOrderModal__bytes']}>
                                                {option.example.bytes.map((byte, index) => (
                                                    <div
                                                        key={index}
                                                        className={styles['byteOrderModal__byte']}
                                                    >
                                                        <span className={styles['byteOrderModal__byteLabel']}>
                                                            {String.fromCharCode(65 + index)}
                                                        </span>
                                                        <span className={styles['byteOrderModal__byteValue']}>
                                                            {byte}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={styles['byteOrderModal__exampleResult']}>
                                            <span className={styles['byteOrderModal__exampleLabel']}>
                                                Результат:
                                            </span>
                                            <div className={styles['byteOrderModal__result']}>
                                                {option.example.result}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles['byteOrderModal__explanation']}>
                                        {option.example.explanation}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
};

