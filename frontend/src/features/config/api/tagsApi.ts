import { baseApi } from '@/app/api/baseApi';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  Tag,
  CreateTagDto,
  UpdateTagDto,
} from '../types/config.types';

/**
 * API для работы с тэгами устройств
 */
export const tagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Получить все тэги устройства
     */
    getDeviceTags: builder.query<ApiResponse<Tag[]>, string>({
      query: (deviceId) => `/config/devices/${deviceId}/tags`,
      providesTags: (_result, _error, deviceId) => [
        { type: 'Tags', id: `DEVICE_${deviceId}` },
        'Tags',
      ],
    }),

    /**
     * Получить тэг по ID
     */
    getTag: builder.query<ApiResponse<Tag>, { deviceId: string; tagId: string }>({
      query: ({ deviceId, tagId }) => `/config/devices/${deviceId}/tags/${tagId}`,
      providesTags: (_result, _error, { tagId }) => [{ type: 'Tags', id: tagId }],
    }),

    /**
     * Создать новый тэг для устройства
     */
    createTag: builder.mutation<
      ApiResponse<Tag>,
      { deviceId: string; data: CreateTagDto }
    >({
      query: ({ deviceId, data }) => ({
        url: `/config/devices/${deviceId}/tags`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { deviceId }) => [
        { type: 'Tags', id: `DEVICE_${deviceId}` },
        'Tags',
        'Devices',
        'DeviceData',
      ],
    }),

    /**
     * Обновить тэг
     */
    updateTag: builder.mutation<
      ApiResponse<Tag>,
      { deviceId: string; tagId: string; data: UpdateTagDto }
    >({
      query: ({ deviceId, tagId, data }) => ({
        url: `/config/devices/${deviceId}/tags/${tagId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { deviceId, tagId }) => [
        { type: 'Tags', id: tagId },
        { type: 'Tags', id: `DEVICE_${deviceId}` },
        'Tags',
        'Devices',
        'DeviceData',
      ],
    }),

    /**
     * Удалить тэг
     */
    deleteTag: builder.mutation<
      ApiResponse<{ message: string }>,
      { deviceId: string; tagId: string }
    >({
      query: ({ deviceId, tagId }) => ({
        url: `/config/devices/${deviceId}/tags/${tagId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { deviceId }) => [
        { type: 'Tags', id: `DEVICE_${deviceId}` },
        'Tags',
        'Devices',
        'DeviceData',
      ],
    }),
  }),
});

/**
 * Экспортируем автоматически сгенерированные хуки
 */
export const {
  useGetDeviceTagsQuery,
  useGetTagQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagsApi;

