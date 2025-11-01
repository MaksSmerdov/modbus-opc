import { baseApi } from '@/app/api/baseApi';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  Port,
  CreatePortDto,
  UpdatePortDto,
} from '../types/config.types';

/**
 * API для работы с портами
 */
export const portsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Получить все порты
     */
    getPorts: builder.query<ApiResponse<Port[]>, void>({
      query: () => '/config/ports',
      providesTags: ['Ports'],
    }),

    /**
     * Получить порт по ID
     */
    getPort: builder.query<ApiResponse<Port>, string>({
      query: (id) => `/config/ports/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Ports', id }],
    }),

    /**
     * Создать новый порт
     */
    createPort: builder.mutation<ApiResponse<Port>, CreatePortDto>({
      query: (body) => ({
        url: '/config/ports',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Ports'],
    }),

    /**
     * Обновить порт
     */
    updatePort: builder.mutation<
      ApiResponse<Port>,
      { id: string; data: UpdatePortDto }
    >({
      query: ({ id, data }) => ({
        url: `/config/ports/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ports', id },
        'Ports',
      ],
    }),

    /**
     * Удалить порт
     */
    deletePort: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/config/ports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Ports'],
    }),
  }),
});

/**
 * Экспортируем автоматически сгенерированные хуки
 */
export const {
  useGetPortsQuery,
  useGetPortQuery,
  useCreatePortMutation,
  useUpdatePortMutation,
  useDeletePortMutation,
} = portsApi;
