import { Add } from '@mui/icons-material';
import styles from './TagsTableToolbar.module.scss';

interface TagsTableToolbarProps {
    onAdd: () => void;
    disabled?: boolean;
}

export const TagsTableToolbar = ({ onAdd, disabled = false }: TagsTableToolbarProps) => {
    return (
        <div className={styles['tagsTableToolbar']}>
            <button
                className={styles['tagsTableToolbar__addButton']}
                onClick={onAdd}
                disabled={disabled}
            >
                <Add fontSize="small" />
                Добавить строку
            </button>
        </div>
    );
};