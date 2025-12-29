import { useMemo } from 'react';
import type { FunctionCode } from '@/features/settings/tag/types';
import { OptionSelectModal, type OptionSelectOption } from '@/features/settings/tag/components/OptionSelectModal/OptionSelectModal';
import styles from '@/features/settings/tag/components/OptionSelectModal/OptionContent.module.scss';

interface FunctionCodeModalProps {
    open: boolean;
    onClose: () => void;
    currentValue: FunctionCode;
    onSave: (value: FunctionCode) => void;
}

interface FunctionCodeInfo {
    label: string;
    description: string;
    code: string;
    registerType: string;
    readWrite: string;
}

const FUNCTION_CODE_INFO: Record<FunctionCode, FunctionCodeInfo> = {
    holding: {
        label: 'Holding Registers',
        description: 'Регистры хранения (чтение/запись)',
        code: '03 (0x03)',
        registerType: '16-битные регистры',
        readWrite: 'Чтение и запись',
    },
    input: {
        label: 'Input Registers',
        description: 'Входные регистры (только чтение)',
        code: '04 (0x04)',
        registerType: '16-битные регистры',
        readWrite: 'Только чтение',
    },
    coil: {
        label: 'Coils',
        description: 'Катушки (чтение/запись)',
        code: '01 (0x01) / 05 (0x05) / 15 (0x0F)',
        registerType: '1-битные регистры',
        readWrite: 'Чтение и запись',
    },
    discrete: {
        label: 'Discrete Inputs',
        description: 'Дискретные входы (только чтение)',
        code: '02 (0x02)',
        registerType: '1-битные регистры',
        readWrite: 'Только чтение',
    },
};

const renderFunctionCodeContent = (info: FunctionCodeInfo) => (
    <div className={styles['optionContent']}>
        <div className={styles['optionContent__description']}>
            {info.description}
        </div>
        <div className={styles['optionContent__details']}>
            <div className={styles['optionContent__detailRow']}>
                <span className={styles['optionContent__detailLabel']}>
                    Код функции:
                </span>
                <span className={styles['optionContent__detailValue']}>
                    {info.code}
                </span>
            </div>
            <div className={styles['optionContent__detailRow']}>
                <span className={styles['optionContent__detailLabel']}>
                    Тип регистра:
                </span>
                <span className={styles['optionContent__detailValue']}>
                    {info.registerType}
                </span>
            </div>
            <div className={styles['optionContent__detailRow']}>
                <span className={styles['optionContent__detailLabel']}>
                    Доступ:
                </span>
                <span className={styles['optionContent__detailValue']}>
                    {info.readWrite}
                </span>
            </div>
        </div>
    </div>
);

export const FunctionCodeModal = ({
    open,
    onClose,
    currentValue,
    onSave,
}: FunctionCodeModalProps) => {
    const options = useMemo<OptionSelectOption<FunctionCode>[]>(() => {
        return (Object.keys(FUNCTION_CODE_INFO) as FunctionCode[]).map((value) => ({
            value,
            label: FUNCTION_CODE_INFO[value].label,
            content: renderFunctionCodeContent(FUNCTION_CODE_INFO[value]),
        }));
    }, []);

    return (
        <OptionSelectModal
            open={open}
            onClose={onClose}
            currentValue={currentValue}
            onSave={onSave}
            title="Выбор кода функции Modbus"
            options={options}
            name="functionCode"
        />
    );
};

