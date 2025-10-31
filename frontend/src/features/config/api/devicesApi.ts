import { baseApi } from '@/app/api/baseApi';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  Device,
  DevicePopulated,
  CreateDeviceDto,
  UpdateDeviceDto,
} from '../types/config.types';

/**
 * API для работы с устройствами
 */
export const devicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Получить все устройства
     */
    getDevices: builder.query<ApiResponse<DevicePopulated[]>, void>({
      query: () => '/config/devices',
      providesTags: ['Devices'],
    }),

    /**
     * Получить устройство по ID
     */
    getDevice: builder.query<ApiResponse<DevicePopulated>, string>({
      query: (id) => `/config/devices/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Devices', id }],
    }),

    /**
     * Создать новое устройство
     */
    createDevice: builder.mutation<ApiResponse<Device>, CreateDeviceDto>({
      query: (body) => ({
        url: '/config/devices',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Devices'],
    }),

    /**
     * Обновить устройство
     */
    updateDevice: builder.mutation<
      ApiResponse<Device>,
      { id: string; data: UpdateDeviceDto }
    >({
      query: ({ id, data }) => ({
        url: `/config/devices/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Devices', id },
        'Devices',
      ],
    }),

    /**
     * Удалить устройство
     */
    deleteDevice: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/config/devices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Devices'],
    }),
  }),
});

/**
 * Экспортируем автоматически сгенерированные хуки
 */
export const {
  useGetDevicesQuery,
  useGetDeviceQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
} = devicesApi;

