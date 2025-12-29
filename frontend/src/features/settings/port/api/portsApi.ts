import { baseApi } from '@/shared/api/baseApi';
import type {
    Port,
    PortsListResponse,
    PortResponse,
    CreatePortData,
    UpdatePortData,
} from '@/features/settings/port/types';

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

        // Клонировать порт
        clonePort: builder.mutation<Port, string>({
            query: (id) => ({
                url: `/config/ports/${id}/clone`,
                method: 'POST',
            }),
            transformResponse: (response: PortResponse) => response.data,
            invalidatesTags: ['Ports', 'Devices'],
        }),
    }),
});

export const {
    useGetPortsQuery,
    useLazyGetPortsQuery,
    useGetPortQuery,
    useLazyGetPortQuery,
    useCreatePortMutation,
    useUpdatePortMutation,
    useDeletePortMutation,
    useClonePortMutation,
} = portsApi;

