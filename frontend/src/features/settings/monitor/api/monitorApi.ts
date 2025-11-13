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
            queryFn: async (arg, api, extraOptions, baseQuery) => {
                const result = await baseQuery('/data/devices/tags/all', api, extraOptions);

                // Если получили ошибку 503 с "Modbus не инициализирован",
                // преобразуем её в успешный ответ с пустым массивом
                if (result.error) {
                    const errorData = result.error.data as { error?: string } | undefined;
                    if (
                        result.error.status === 503 &&
                        errorData?.error?.includes('Modbus не инициализирован')
                    ) {
                        return {
                            data: [],
                        };
                    }
                }

                // Если успешный ответ, преобразуем его
                if (result.data) {
                    const response = result.data as MonitorResponse;
                    return {
                        data: response.data,
                    };
                }

                // Возвращаем ошибку как есть
                return result;
            },
            providesTags: ['Tags'],
        }),
    }),
});

export const { useGetMonitorQuery } = monitorApi;

