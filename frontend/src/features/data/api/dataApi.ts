import { baseApi } from '@/app/api/baseApi';
import type {
  DevicesRealTimeData,
  DeviceRealTimeData,
  DeviceHistoryResponse,
  HistoryQueryParams,
} from '../types/data.types';

/**
 * API для работы с данными устройств
 */
export const dataApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Получить real-time данные всех устройств
     */
    getAllDevicesData: builder.query<DevicesRealTimeData, void>({
      query: () => '/data/devices',
      providesTags: ['DeviceData'],
    }),

    /**
     * Получить real-time данные конкретного устройства
     */
    getDeviceData: builder.query<DeviceRealTimeData, string>({
      query: (deviceName) => `/data/${deviceName}`,
      providesTags: (_result, _error, deviceName) => [
        { type: 'DeviceData', id: deviceName },
      ],
    }),

    /**
     * Получить историю данных устройства
     */
    getDeviceHistory: builder.query<
      DeviceHistoryResponse,
      { deviceName: string; params?: HistoryQueryParams }
    >({
      query: ({ deviceName, params }) => ({
        url: `/data/${deviceName}/history`,
        params: params || {},
      }),
      providesTags: (_result, _error, { deviceName }) => [
        { type: 'DeviceHistory', id: deviceName },
      ],
    }),
  }),
});

/**
 * Экспортируем автоматически сгенерированные хуки
 */
export const {
  useGetAllDevicesDataQuery,
  useGetDeviceDataQuery,
  useGetDeviceHistoryQuery,
} = dataApi;

