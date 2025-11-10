import { Input } from '@/shared/ui/Input/Input';
import styles from './TagCell.module.scss';

interface TagAddressCellProps {
    value: number;
    isEditing: boolean;
    onChange: (value: number) => void;
}

export const TagAddressCell = ({ value, isEditing, onChange }: TagAddressCellProps) => {
    const addressValue = value === null || value === undefined ? 0 : Number(value);
    const hexAddress = addressValue.toString(16).toUpperCase().padStart(4, '0');

    if (isEditing) {
        return (
            <div className={styles['tagCell__addressWrapper']}>
                <Input
                    type="number"
                    value={addressValue}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                            onChange(0);
                        } else {
                            const parsedValue = parseInt(inputValue, 10);
                            if (!isNaN(parsedValue) && parsedValue >= 0) {
                                onChange(parsedValue);
                            }
                        }
                    }}
                    fullWidth={true}
                    helperText=""
                    className={styles['tagCell__addressInput']}
                    placeholder="0"
                />
                <span className={styles['tagCell__addressHex']}>
                    (0x{hexAddress})
                </span>
            </div>
        );
    }

    if (addressValue === null || addressValue === undefined) {
        return <span className={styles['tagCell__empty']}>—</span>;
    }

    return <span>{addressValue} (0x{hexAddress})</span>;
};

