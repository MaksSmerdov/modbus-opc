import { useMemo } from 'react';
import type { ByteOrder } from '@/features/settings/tag/types';
import { OptionSelectModal, type OptionSelectOption } from '@/features/settings/tag/components/OptionSelectModal/OptionSelectModal';
import styles from '@/features/settings/tag/components/OptionSelectModal/OptionContent.module.scss';

interface ByteOrderModalProps {
    open: boolean;
    onClose: () => void;
    currentValue: ByteOrder;
    onSave: (value: ByteOrder) => void;
}

interface ByteOrderExample {
    bytes: string[];
    result: string;
    explanation: string;
}

const BYTE_ORDER_DATA: Record<ByteOrder, { label: string; example: ByteOrderExample }> = {
    ABCD: {
        label: 'Старший байт первым',
        example: {
            bytes: ['12', '34', '56', '78'],
            result: '0x12345678',
            explanation: 'Байты читаются в исходном порядке: A→B→C→D',
        },
    },
    DCBA: {
        label: 'Младший байт первым',
        example: {
            bytes: ['12', '34', '56', '78'],
            result: '0x78563412',
            explanation: 'Байты читаются в обратном порядке: D→C→B→A',
        },
    },
    BADC: {
        label: 'Обмен байтов в парах (B↔A, D↔C)',
        example: {
            bytes: ['12', '34', '56', '78'],
            result: '0x34127856',
            explanation: 'Меняются местами пары байтов: B↔A, D↔C',
        },
    },
    CDAB: {
        label: 'Обмен байтов в парах (C↔D, A↔B)',
        example: {
            bytes: ['12', '34', '56', '78'],
            result: '0x56781234',
            explanation: 'Меняются местами пары байтов: C↔D, A↔B',
        },
    },
    BE: {
        label: 'Big Endian',
        example: {
            bytes: ['12', '34', '56', '78'],
            result: '0x12345678',
            explanation: 'Big Endian порядок байтов',
        },
    },
    LE: {
        label: 'Little Endian',
        example: {
            bytes: ['12', '34', '56', '78'],
            result: '0x78563412',
            explanation: 'Little Endian порядок байтов',
        },
    },
};

const renderByteOrderContent = (example: ByteOrderExample) => (
    <div className={styles['optionContent__example']}>
        <div className={styles['optionContent__exampleRow']}>
            <div className={styles['optionContent__exampleBytes']}>
                <span className={styles['optionContent__exampleLabel']}>
                    Исходные байты:
                </span>
                <div className={styles['optionContent__bytes']}>
                    {example.bytes.map((byte, index) => (
                        <div
                            key={index}
                            className={styles['optionContent__byte']}
                        >
                            <span className={styles['optionContent__byteLabel']}>
                                {String.fromCharCode(65 + index)}
                            </span>
                            <span className={styles['optionContent__byteValue']}>
                                {byte}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles['optionContent__exampleResult']}>
                <span className={styles['optionContent__exampleLabel']}>
                    Результат:
                </span>
                <div className={styles['optionContent__result']}>
                    {example.result}
                </div>
            </div>
        </div>

        <div className={styles['optionContent__explanation']}>
            {example.explanation}
        </div>
    </div>
);

export const ByteOrderModal = ({
    open,
    onClose,
    currentValue,
    onSave,
}: ByteOrderModalProps) => {
    const options = useMemo<OptionSelectOption<ByteOrder>[]>(() => {
        return (Object.keys(BYTE_ORDER_DATA) as ByteOrder[]).map((value) => ({
            value,
            label: BYTE_ORDER_DATA[value].label,
            content: renderByteOrderContent(BYTE_ORDER_DATA[value].example),
        }));
    }, []);

    return (
        <OptionSelectModal
            open={open}
            onClose={onClose}
            currentValue={currentValue}
            onSave={onSave}
            title="Выбор порядка байтов"
            options={options}
            name="byteOrder"
        />
    );
};
