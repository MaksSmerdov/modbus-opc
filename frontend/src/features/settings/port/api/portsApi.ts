import { baseApi } from '@/shared/api/baseApi';
import type {
    Port,
    PortsListResponse,
    PortResponse,
    CreatePortData,
    UpdatePortData,
    AvailablePorts,
    AvailablePortsResponse,
} from '../types';

// Добавить интерфейс для настроек портов
export interface AvailablePortSettings {
    _id: string;
    portName: string;
    description: string | null;
    isHidden: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AvailablePortSettingsResponse {
    success: true;
    count: number;
    data: AvailablePortSettings[];
}

export const portsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Получить список всех портов
        getPorts: builder.query<Port[], void>({
            query: () => '/config/ports',
            providesTags: ['Ports'],
            transformResponse: (response: PortsListResponse) => response.data,
        }),

        // Получить порт по ID
        getPort: builder.query<Port, string>({
            query: (id) => `/config/ports/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Ports', id }],
            transformResponse: (response: PortResponse) => response.data,
        }),

        // Получить список доступных COM-портов
        getAvailablePorts: builder.query<AvailablePorts[], void>({
            query: () => `/config/ports/available`,
            providesTags: ['Ports'],
            transformResponse: (response: AvailablePortsResponse) => response.data,
        }),

        // Получить настройки доступных портов
        getAvailablePortsSettings: builder.query<AvailablePortSettings[], void>({
            query: () => '/config/ports/available/settings',
            providesTags: ['Ports'],
            transformResponse: (response: AvailablePortSettingsResponse) => response.data,
        }),

        // Создать новый порт
        createPort: builder.mutation<Port, CreatePortData>({
            query: (portData) => ({
                url: '/config/ports',
                method: 'POST',
                body: portData,
            }),
            transformResponse: (response: PortResponse) => response.data,
            invalidatesTags: ['Ports'],
        }),

        // Обновить порт
        updatePort: builder.mutation<Port, { id: string; data: UpdatePortData }>({
            query: ({ id, data }) => ({
                url: `/config/ports/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: PortResponse) => response.data,
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Ports', id },
                'Ports',
            ],
        }),

        // Удалить порт
        deletePort: builder.mutation<{ success: true; message: string }, string>({
            query: (id) => ({
                url: `/config/ports/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Ports', id },
                'Ports',
            ],
        }),

        // Обновить настройки доступного порта
        updateAvailablePortSettings: builder.mutation<
            AvailablePortSettings,
            { portName: string; data: { description?: string | null; isHidden?: boolean } }
        >({
            query: ({ portName, data }) => ({
                url: `/config/ports/available/settings/${portName}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: { success: true; data: AvailablePortSettings }) => response.data,
            invalidatesTags: ['Ports'],
        }),
    }),
});

export const {
    useGetPortsQuery,
    useGetAvailablePortsQuery,
    useGetAvailablePortsSettingsQuery,
    useLazyGetPortsQuery,
    useGetPortQuery,
    useLazyGetPortQuery,
    useCreatePortMutation,
    useUpdatePortMutation,
    useDeletePortMutation,
    useUpdateAvailablePortSettingsMutation,
} = portsApi;

