import type { CreateTagData } from '@/features/settings/tag/types';

export const TAG_TABLE_CONFIG = {
    dragActivationDistance: 8,
    clickTimeout: 200,
    defaultTagData: {
        address: 0,
        name: '',
        category: 'general',
        dataType: 'int16' as CreateTagData['dataType'],
        functionCode: 'holding' as CreateTagData['functionCode'],
        byteOrder: 'ABCD' as CreateTagData['byteOrder'],
        scale: 1,
        offset: 0,
        decimals: 0,
    },
} as const;

