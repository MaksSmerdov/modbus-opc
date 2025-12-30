import { useState, useEffect, type ReactNode } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { Button } from '@/shared/ui/Button/Button';
import styles from './OptionSelectModal.module.scss';

export interface OptionSelectOption<T> {
    value: T;
    label: string;
    content?: ReactNode;
}

interface OptionSelectModalProps<T> {
    open: boolean;
    onClose: () => void;
    currentValue: T;
    onSave: (value: T) => void;
    title: string;
    options: OptionSelectOption<T>[];
    name: string;
}

export function OptionSelectModal<T extends string | number>({
    open,
    onClose,
    currentValue,
    onSave,
    title,
    options,
    name,
}: OptionSelectModalProps<T>) {
    const [selectedValue, setSelectedValue] = useState<T>(currentValue);

    // Синхронизируем selectedValue с currentValue при открытии модалки
    useEffect(() => {
        if (open) {
            setSelectedValue(currentValue);
        }
    }, [open, currentValue]);

    const handleSave = () => {
        onSave(selectedValue);
    };

    const handleSelect = (value: T) => {
        setSelectedValue(value);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            maxWidth="md"
            actions={
                <>
                    <Button variant="outlined" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button variant="success" onClick={handleSave}>
                        Сохранить
                    </Button>
                </>
            }
        >
            <div className={styles['optionSelectModal']}>
                <div className={styles['optionSelectModal__options']}>
                    {options.map((option) => {
                        const isSelected = selectedValue === option.value;
                        return (
                            <div
                                key={String(option.value)}
                                className={`${styles['optionSelectModal__option']} ${isSelected ? styles['optionSelectModal__option_selected'] : ''
                                    }`}
                                onClick={() => handleSelect(option.value)}
                            >
                                <div className={styles['optionSelectModal__optionHeader']}>
                                    <div className={styles['optionSelectModal__optionLabel']}>
                                        <input
                                            type="radio"
                                            name={name}
                                            value={String(option.value)}
                                            checked={isSelected}
                                            onChange={() => handleSelect(option.value)}
                                            className={styles['optionSelectModal__radio']}
                                        />
                                        <span className={styles['optionSelectModal__label']}>
                                            {option.label}
                                        </span>
                                    </div>
                                </div>

                                {option.content && (
                                    <div className={styles['optionSelectModal__content']}>
                                        {option.content}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
}

