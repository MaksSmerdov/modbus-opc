import type { Tag, CreateTagData } from '@/features/settings/tag/types';

// Упрощенная типизация с discriminated union
export type TableRowData =
    | { type: 'new'; id: 'new' }
    | { type: 'tag'; tag: Tag };

export interface EditingRow {
    id: string | 'new';
    data: Partial<CreateTagData>;
}

// Типы для reducer редактирования
export type TagEditingAction =
    | { type: 'START_EDITING'; tag: Tag }
    | { type: 'START_CREATING' }
    | { type: 'UPDATE_FIELD'; field: keyof CreateTagData; value: unknown }
    | { type: 'CANCEL' }
    | { type: 'SAVE_SUCCESS' };

export interface TagEditingState {
    editingRow: EditingRow | null;
    originalDataTypes: Record<string, string>;
}

