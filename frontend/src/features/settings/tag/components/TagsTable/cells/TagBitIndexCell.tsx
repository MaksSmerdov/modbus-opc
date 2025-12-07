import { TagNumberCell } from './TagNumberCell';
import { shouldShowBitIndex } from '@/features/settings/tag/components/TagsTable/utils/tagsTableUtils';
import styles from './TagCell.module.scss';

interface TagBitIndexCellProps {
    value: number | null | undefined;
    dataType: string;
    isEditing: boolean;
    onChange: (value: number | null) => void;
}

export const TagBitIndexCell = ({ value, dataType, isEditing, onChange }: TagBitIndexCellProps) => {
    if (!shouldShowBitIndex(dataType)) {
        return <span className={styles['tagCell__empty']}>—</span>;
    }

    return (
        <TagNumberCell
            value={value}
            isEditing={isEditing}
            onChange={(val) => onChange(val === undefined ? null : val)}
            min={0}
            max={15}
            placeholder="0-15"
        />
    );
};

