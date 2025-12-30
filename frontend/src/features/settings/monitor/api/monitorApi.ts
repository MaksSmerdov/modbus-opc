import { baseApi } from '@/shared/api/baseApi';

export interface MonitorTagItem {
    _id: string;
    portName: string;
    portId: string;
    deviceName: string;
    deviceSlug: string;
    deviceId: string;
    tagName: string;
    category: string;
    value: number | string | boolean | null;
    unit: string;
    address: number;
    functionCode: string;
    dataType: string;
}

export interface MonitorResponse {
    success: boolean;
    count: number;
    data: MonitorTagItem[];
}

export const monitorApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMonitor: builder.query<MonitorTagItem[], void>({
            query: () => '/data/devices/tags/all',
            transformResponse: (response: unknown) => {
                // Проверяем, является ли ответ ошибкой
                const errorResponse = response as { error?: string; status?: number } | undefined;
                if (errorResponse?.error) {
                    // Если ошибка 503 с "Modbus не инициализирован", возвращаем пустой массив
                    if (errorResponse.status === 503 && errorResponse.error.includes('Modbus не инициализирован')) {
                        return [];
                    }
                    return [];
                }
                // Если успешный ответ, преобразуем его
                const successResponse = response as MonitorResponse;
                return successResponse.data || [];
            },
            providesTags: ['Tags'],
        }),
    }),
});

export const { useGetMonitorQuery } = monitorApi;

