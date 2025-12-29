import { useMemo } from 'react';
import type { DataType } from '@/features/settings/tag/types';
import { OptionSelectModal, type OptionSelectOption } from '@/features/settings/tag/components/OptionSelectModal/OptionSelectModal';
import styles from '@/features/settings/tag/components/OptionSelectModal/OptionContent.module.scss';

interface DataTypeModalProps {
    open: boolean;
    onClose: () => void;
    currentValue: DataType;
    onSave: (value: DataType) => void;
}

interface DataTypeInfo {
    description: string;
    size: string;
    range: string;
    example?: string;
}

const DATA_TYPE_INFO: Record<DataType, DataTypeInfo> = {
    int16: {
        description: '16-битное целое число со знаком',
        size: '2 байта',
        range: '-32,768 до 32,767',
        example: '-1234, 5678',
    },
    uint16: {
        description: '16-битное целое число без знака',
        size: '2 байта',
        range: '0 до 65,535',
        example: '1234, 5678',
    },
    int32: {
        description: '32-битное целое число со знаком',
        size: '4 байта',
        range: '-2,147,483,648 до 2,147,483,647',
        example: '-123456, 987654',
    },
    uint32: {
        description: '32-битное целое число без знака',
        size: '4 байта',
        range: '0 до 4,294,967,295',
        example: '123456, 987654',
    },
    float32: {
        description: '32-битное число с плавающей точкой (IEEE 754)',
        size: '4 байта',
        range: '±3.4 × 10³⁸',
        example: '3.14, -45.67, 123.456',
    },
    string: {
        description: 'Строка символов (ASCII)',
        size: '1-125 байт',
        range: 'Зависит от длины',
        example: '"Hello", "Temperature"',
    },
    bits: {
        description: 'Отдельные биты в регистре',
        size: '1 байт',
        range: '0-15 бит',
        example: 'Бит 0, Бит 5, Бит 15',
    },
    int32_float32: {
        description: 'Составной тип: одновременно int32 и float32',
        size: '4 байта',
        range: 'int32: -2,147,483,648 до 2,147,483,647\nfloat32: ±3.4 × 10³⁸',
        example: 'Можно отображать как целое или как число с плавающей точкой',
    },
};

const renderDataTypeContent = (info: DataTypeInfo) => (
    <div className={styles['optionContent']}>
        <div className={styles['optionContent__description']}>
            {info.description}
        </div>
        <div className={styles['optionContent__details']}>
            <div className={styles['optionContent__detailRow']}>
                <span className={styles['optionContent__detailLabel']}>
                    Размер:
                </span>
                <span className={styles['optionContent__detailValue']}>
                    {info.size}
                </span>
            </div>
            <div className={styles['optionContent__detailRow']}>
                <span className={styles['optionContent__detailLabel']}>
                    Диапазон:
                </span>
                <span className={styles['optionContent__detailValue']}>
                    {info.range}
                </span>
            </div>
            {info.example && (
                <div className={styles['optionContent__detailRow']}>
                    <span className={styles['optionContent__detailLabel']}>
                        Пример:
                    </span>
                    <span className={styles['optionContent__detailValue']}>
                        {info.example}
                    </span>
                </div>
            )}
        </div>
    </div>
);

export const DataTypeModal = ({
    open,
    onClose,
    currentValue,
    onSave,
}: DataTypeModalProps) => {
    const options = useMemo<OptionSelectOption<DataType>[]>(() => {
        return (Object.keys(DATA_TYPE_INFO) as DataType[]).map((value) => ({
            value,
            label: value === 'int32_float32' ? 'int32_float32' : value,
            content: renderDataTypeContent(DATA_TYPE_INFO[value]),
        }));
    }, []);

    return (
        <OptionSelectModal
            open={open}
            onClose={onClose}
            currentValue={currentValue}
            onSave={onSave}
            title="Выбор типа данных"
            options={options}
            name="dataType"
        />
    );
};
