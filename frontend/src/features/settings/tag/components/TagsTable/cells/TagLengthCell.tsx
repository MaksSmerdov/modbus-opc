import { TagNumberCell } from './TagNumberCell';
import { shouldShowLength } from '@/features/settings/tag/components/TagsTable/utils/tagsTableUtils';
import styles from './TagCell.module.scss';

interface TagLengthCellProps {
    value: number | undefined;
    dataType: string;
    isEditing: boolean;
    onChange: (value: number | undefined) => void;
}

export const TagLengthCell = ({ value, dataType, isEditing, onChange }: TagLengthCellProps) => {
    if (!shouldShowLength(dataType)) {
        return <span className={styles['tagCell__empty']}>—</span>;
    }

    return (
        <TagNumberCell
            value={value}
            isEditing={isEditing}
            onChange={onChange}
            placeholder="Обязательно"
        />
    );
};

