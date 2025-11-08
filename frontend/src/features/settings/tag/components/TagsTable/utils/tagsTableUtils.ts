export const shouldShowLength = (dataType: string): boolean => dataType === 'string';
export const shouldShowBitIndex = (dataType: string): boolean => dataType === 'bits';
export const shouldShowByteOrder = (dataType: string): boolean => 
    ['int32', 'uint32', 'float32'].includes(dataType);

export const getDefaultLength = (dataType: string): number => {
    const typeMap: Record<string, number> = {
        'int16': 1,
        'uint16': 1,
        'bits': 1,
        'int32': 2,
        'uint32': 2,
        'float32': 2,
    };
    return typeMap[dataType] ?? 1;
};