/**
 * Тип ошибки RTK Query при использовании unwrap()
 */
type RTKQueryError = {
    data?: {
        error?: string;
        message?: string;
        success?: boolean;
    };
    status?: number;
    error?: string;
};

/**
 * Извлекает сообщение об ошибке из объекта ошибки RTK Query
 * @param error - Объект ошибки из catch блока при использовании unwrap()
 * @param defaultMessage - Сообщение по умолчанию, если не удалось извлечь ошибку
 * @returns Сообщение об ошибке
 */
export function getErrorMessage(
    error: unknown,
    defaultMessage = 'Произошла ошибка'
): string {
    if (!error) {
        return defaultMessage;
    }

    // Проверяем, является ли ошибка объектом RTK Query
    if (typeof error === 'object' && 'data' in error) {
        const rtkError = error as RTKQueryError;

        // Пытаемся извлечь сообщение из data.error или data.message
        if (rtkError.data?.error) {
            return rtkError.data.error;
        }

        if (rtkError.data?.message) {
            return rtkError.data.message;
        }
    }

    // Если это обычная ошибка Error
    if (error instanceof Error) {
        return error.message;
    }

    // Если это строка
    if (typeof error === 'string') {
        return error;
    }

    return defaultMessage;
}
