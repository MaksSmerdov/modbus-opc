import { useMemo } from 'react';
import { Table, type TableColumn } from '@/shared/ui/Table/Table';
import type { Tag } from '@/features/settings/tag/types';
import type { DeviceData } from '@/features/settings/device/api/deviceDataApi';
import styles from './TagsValuesView.module.scss';

interface TagsValuesViewProps {
    tags: Tag[];
    deviceData: DeviceData | null;
}

interface TagWithValue {
    tag: Tag;
    value: number | string | boolean | null;
    unit: string;
    isAlarm: boolean;
}

interface GroupedTags {
    [category: string]: TagWithValue[];
}

const columns: TableColumn[] = [
    { key: 'name', label: 'Название', width: '30%' },
    { key: 'value', label: 'Значение', width: '25%' },
    { key: 'unit', label: 'Ед. изм.', width: '15%' },
];

export const TagsValuesView = ({ tags, deviceData }: TagsValuesViewProps) => {
    const tagsWithValues = useMemo(() => {
        if (!deviceData) {
            return tags.map((tag) => ({
                tag,
                value: null,
                unit: tag.unit || '',
                isAlarm: false,
            }));
        }

        return tags.map((tag) => {
            const categoryData = deviceData[tag.category];
            const tagData = categoryData?.[tag.name];

            if (!tagData) {
                return {
                    tag,
                    value: null,
                    unit: tag.unit || '',
                    isAlarm: false,
                };
            }

            return {
                tag,
                value: tagData.value,
                unit: tagData.unit ?? tag.unit ?? '',
                isAlarm: tagData.isAlarm ?? false,
            };
        });
    }, [tags, deviceData]);

    const groupedTags = useMemo(() => {
        const grouped: GroupedTags = {};

        tagsWithValues.forEach((tagWithValue) => {
            const category = tagWithValue.tag.category || 'default';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(tagWithValue);
        });

        // Сортируем категории
        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            if (a === 'default') return 1;
            if (b === 'default') return -1;
            return a.localeCompare(b);
        });

        return sortedCategories.map((category) => ({
            category,
            tags: grouped[category],
        }));
    }, [tagsWithValues]);

    if (tags.length === 0) {
        return (
            <div className={styles['tagsValuesView__empty']}>
                Нет тегов для отображения
            </div>
        );
    }

    return (
        <div className={styles['tagsValuesView']}>
            <div className={styles['tagsValuesView__wrapper']}>
                {groupedTags.map(({ category, tags: categoryTags }) => (
                    <div key={category} className={styles['tagsValuesView__group']}>
                        {category !== 'default' && (
                            <div className={styles['tagsValuesView__groupHeader']}>
                                <h3 className={styles['tagsValuesView__groupTitle']}>{category}</h3>
                            </div>
                        )}
                        <Table
                            columns={columns}
                            data={categoryTags}
                            emptyMessage="Нет тегов в этой категории"
                            className={styles['tagsValuesView__table']}
                            renderRow={({ tag, value, unit, isAlarm }) => (
                                <tr
                                    key={tag._id}
                                    className={isAlarm ? styles['tagsValuesView__row_alarm'] : ''}
                                >
                                    <td className={styles['tagsValuesView__cell']}>
                                        <span className={styles['tagsValuesView__name']}>{tag.name}</span>
                                    </td>
                                    <td className={styles['tagsValuesView__cell']}>
                                        {value !== null && value !== undefined ? (
                                            <span className={`${styles['tagsValuesView__value']} ${isAlarm ? styles['tagsValuesView__value_alarm'] : ''}`}>
                                                {typeof value === 'boolean' ? (value ? 'Да' : 'Нет') : String(value)}
                                            </span>
                                        ) : (
                                            <span className={styles['tagsValuesView__noData']}>Нет данных</span>
                                        )}
                                    </td>
                                    <td className={styles['tagsValuesView__cell']}>
                                        {unit && (
                                            <span className={styles['tagsValuesView__unit']}>{unit}</span>
                                        )}
                                    </td>
                                </tr>
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

