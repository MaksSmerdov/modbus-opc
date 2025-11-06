export type FunctionCode = 'holding' | 'input' | 'coil' | 'discrete';

export type DataType = 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32' | 'string' | 'bits';

export type ByteOrder = 'BE' | 'LE' | 'ABCD' | 'CDAB' | 'BADC' | 'DCBA'

export interface Tag {
    _id: string;
    deviceId: string;
    address: number; 
    length?: number;
    name: string;
    category: string;
    functionCode: FunctionCode;
    dataType: DataType;
    bitIndex?: number | null;
    byteOrder: ByteOrder;
    scale: number;
    offset: number;
    decimals: number;
    unit: string;
    minValue: number | null;
    maxValue: number | null;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTagData {
    deviceId: string;
    address: number;
    length?: number;
    name: string;
    category?: string; 
    functionCode?: FunctionCode;
    dataType: DataType;
    bitIndex?: number | null;
    byteOrder?: ByteOrder; 
    scale?: number;
    offset?: number; 
    decimals?: number;
    unit?: string;
    minValue?: number | null;
    maxValue?: number | null;
    description?: string;
}


// Данные для обновления тэга (все поля опциональны)
export type UpdateTagData = Partial<CreateTagData>;

// Ответ API при получении списка тэгов
export interface TagsListResponse {
    success: true;
    count: number;
    data: Tag[];
}

// Ответ API при получении одного тэга
export interface TagResponse {
    success: true;
    data: Tag;
}


